// Minimal Chrome DevTools Protocol client for the bench tools: starts headless Chrome,
// opens one page and sends commands. No dependencies (Node 22+: global WebSocket and fetch).
import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME_PATHS = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
].filter(Boolean);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ width = 1920, height = 1080 } = {}) {
    const bin = CHROME_PATHS.find((p) => existsSync(p));
    if (!bin) throw new Error('Chrome not found: set CHROME=/path/to/chrome');
    if (typeof WebSocket === 'undefined') throw new Error('Node 22 or newer is needed (global WebSocket)');
    const port = 9300 + Math.floor(Math.random() * 500);
    const proc = spawn(bin, ['--headless=new', `--remote-debugging-port=${port}`,
        `--user-data-dir=${mkdtempSync(join(tmpdir(), 'matephis-bench-'))}`,
        `--window-size=${width},${height}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 75 && !ws; i++) {
        try {
            const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
            const page = list.find((t) => t.type === 'page');
            if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
        } catch (_) { /* not up yet */ }
        if (!ws) await sleep(200);
    }
    if (!ws) { proc.kill(); throw new Error('Chrome did not start'); }
    await new Promise((r) => ws.addEventListener('open', r, { once: true }));
    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (m) => {
        const d = JSON.parse(m.data);
        if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    });
    const send = (method, params = {}) => new Promise((r) => {
        const i = ++id;
        pending.set(i, r);
        ws.send(JSON.stringify({ id: i, method, params }));
    });
    const evaluate = async (expression) => {
        const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.error) throw new Error(r.error.message);
        if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 1000));
        return r.result.result.value;
    };
    const close = () => { try { ws.close(); } catch (_) { /* closed */ } proc.kill(); };
    await send('Page.enable');
    return { send, evaluate, close };
}
