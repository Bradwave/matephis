#!/usr/bin/env node
// Runs the board benchmark (/board/bench/) in headless Chrome, optionally with CPU throttling
// and an emulated screen, and prints or saves the results. Compare them with the results of
// the same page on the real device to find the throttling that matches it.
//
//   node tools/bench/run-headless.mjs [--url http://localhost:4000/board/bench/]
//        [--cpu 1,4,8] [--size 1920x1080] [--dpr 1] [--only cpu,plot] [--out results.json]
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
    return acc;
}, []));
const url = args.url || 'http://localhost:4000/board/bench/';
const rates = String(args.cpu || '1').split(',').map(Number);
const [width, height] = String(args.size || '1920x1080').split('x').map(Number);
const dpr = Number(args.dpr || 1);
const only = args.only ? String(args.only).split(',') : null;

const chrome = await launch({ width, height });
const all = {};
try {
    await chrome.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile: false });
    for (const rate of rates) {
        await chrome.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        await chrome.send('Page.navigate', { url });
        for (let i = 0; i < 50; i++) {
            if (await chrome.evaluate('!!(window.MatephisBench && document.readyState === "complete")')) break;
            await sleep(200);
        }
        await chrome.send('Emulation.setCPUThrottlingRate', { rate });
        const res = await chrome.evaluate(`window.MatephisBench.runAll(${JSON.stringify({ only })})`);
        all[`cpu x${rate}`] = res;
        const s = res.scenarios;
        const fps = (x) => (x && x.fps !== undefined ? `${x.fps} fps` : '—');
        console.log(`cpu x${rate}: cpu ${s.cpu ? s.cpu.ms.med + ' ms' : '—'} | fill ${s.fill ? fps(s.fill.device) : '—'} | ink ${fps(s.ink)}`
            + ` | pan ${s.pan ? fps(s.pan.fastPan) : '—'} | plot ${s.plot ? `${s.plot.functions.drawMs}/${s.plot.implicit.drawMs} ms` : '—'}`
            + ` | physics ${s.physics ? `${fps(s.physics.playback)}, slider ${s.physics.slider.drawMs} ms` : '—'}`);
    }
} finally {
    chrome.close();
}
if (args.out) writeFileSync(args.out, JSON.stringify(all, null, 1));
else if (!args.quiet) console.log(JSON.stringify(all, null, 1));
