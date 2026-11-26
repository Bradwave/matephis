// Checks the board's HTML sanitiser (assets/js/matephis-board-src/model/sanitize-html.js)
// in real headless Chrome, because only a browser's own parser shows what an attack does.
//
//   node tools/security/sanitize-check.mjs                    attack payloads only
//   node tools/security/sanitize-check.mjs --site <url>       also every exercise of the site
//
// 1. Attack payloads: each is sanitised and attached to a live page. Nothing may run
//    (a flag set by any injected script stays unset), and the result may hold no
//    script-capable element, event handler or javascript: URL.
// 2. Real content (--site): every exercise page of the manifest. Sanitising the exercise
//    content must keep every element, attribute and character of text; the only changes
//    allowed are dropping heading ids and adding target/rel to links.
import { build } from 'esbuild';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from '../bench/cdp.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const siteArg = process.argv.indexOf('--site');
const site = siteArg > 0 ? process.argv[siteArg + 1].replace(/\/$/, '') : null;

const bundle = (await build({
    entryPoints: [`${root}assets/js/matephis-board-src/model/sanitize-html.js`],
    bundle: true, format: 'iife', globalName: 'Sanitize', write: false, target: 'es2019',
})).outputFiles[0].text;

const PAYLOADS = [
    '<img src=x onerror="window.__xss=1">',
    '<svg onload="window.__xss=1"></svg>',
    '<script>window.__xss=1</script>',
    '<a href="javascript:window.__xss=1">x</a>',
    '<a href=" java\tscript:window.__xss=1">x</a>',
    '<a href="JaVaScRiPt:window.__xss=1">x</a>',
    '<a href="data:text/html,<script>parent.__xss=1</script>">x</a>',
    '<iframe srcdoc="<script>parent.__xss=1</script>"></iframe>',
    '<iframe src="javascript:parent.__xss=1"></iframe>',
    '<object data="javascript:window.__xss=1"></object>',
    '<embed src="javascript:window.__xss=1">',
    '<details open ontoggle="window.__xss=1">x</details>',
    '<body onload="window.__xss=1">',
    '<style>@import "https://evil.test/x.css";</style>',
    '<div style="background:url(javascript:window.__xss=1)">x</div>',
    '<span style="background-image:url(https://evil.test/t.png)">x</span>',
    '<svg><a xlink:href="javascript:window.__xss=1"><text x=0 y=10>x</text></a></svg>',
    '<svg><use href="data:image/svg+xml,<svg id=x onload=window.__xss=1 />#x"></use></svg>',
    '<svg><use xlink:href="https://evil.test/sprite.svg#a"></use></svg>',
    '<svg><animate attributeName="href" to="javascript:window.__xss=1" /></svg>',
    '<svg><set attributeName="onmouseover" to="window.__xss=1" /></svg>',
    '<svg><foreignObject><img src=x onerror="window.__xss=1"></foreignObject></svg>',
    '<svg><script>window.__xss=1</script></svg>',
    '<svg><style>@import "https://evil.test/x.css";</style></svg>',
    '<math><mtext><table><mglyph><style><img src=x onerror="window.__xss=1">',
    '<math><annotation-xml encoding="text/html"><img src=x onerror="window.__xss=1"></annotation-xml></math>',
    '<math><mi href="javascript:window.__xss=1">x</mi></math>',
    '<form action="javascript:window.__xss=1"><button>x</button></form>',
    '<input autofocus onfocus="window.__xss=1">',
    '<base href="https://evil.test/">',
    '<meta http-equiv="refresh" content="0;url=javascript:window.__xss=1">',
    '<link rel="stylesheet" href="https://evil.test/x.css">',
    '<template><img src=x onerror="window.__xss=1"></template>',
    '<noscript><p title="</noscript><img src=x onerror=window.__xss=1>">',
    '<img src="x" id="matephis-board" name="MathJax">',
    '<div id="MathJax">clobber</div>',
    '<img srcset="x 1x" onerror="window.__xss=1">',
    '<!--<img src=x onerror="window.__xss=1">-->',
    '<p>ok <strong>bold</strong> <a href="https://matephis.com/notes/x">link</a></p>',
];

const CHECK_PAGE = `(${(async (payloads) => {
    window.__xss = 0;
    const bad = [];
    const host = document.createElement('div');
    document.body.appendChild(host);
    for (const p of payloads) {
        const frag = Sanitize.sanitizeHtmlToFragment(p);
        const box = document.createElement('div');
        box.appendChild(frag);
        host.appendChild(box);
        for (const el of box.querySelectorAll('*')) {
            const tag = el.localName.toLowerCase();
            if (/^(script|style|iframe|object|embed|form|input|button|base|meta|link|template|foreignobject|animate|set|annotation-xml)$/.test(tag)) bad.push([p, `element <${tag}>`]);
            for (const a of el.attributes) {
                if (/^on/i.test(a.name)) bad.push([p, `handler ${a.name}`]);
                if (/href|src|action|data/i.test(a.name) && /^\s*(javascript|data:text|vbscript)/i.test(a.value)) bad.push([p, `${a.name}=${a.value}`]);
                if (a.name === 'id' && !/^MJX-/.test(a.value)) bad.push([p, `id ${a.value}`]);
                if (a.name === 'name') bad.push([p, 'name attribute']);
                if (a.name === 'style' && /url\(/i.test(a.value)) bad.push([p, 'style url()']);
                if (/href$/.test(a.name) && el.localName === 'use' && !a.value.startsWith('#')) bad.push([p, `external use ${a.value}`]);
            }
        }
    }
    // Give images, handlers and focus a chance to fire, then click every link.
    await new Promise((r) => setTimeout(r, 500));
    for (const a of host.querySelectorAll('a')) {
        if (a.getAttribute('href') && !/^https?:/.test(a.href)) bad.push(['link', a.href]);
    }
    return { xss: window.__xss, bad, sample: host.lastChild.innerHTML };
}).toString()})`;

const REAL_PAGE = `(${(async (siteUrl) => {
    const man = await (await fetch(`${siteUrl}/exercises-manifest.json`)).json();
    const diffs = [];
    let items = 0;
    const describe = (root) => {
        const out = [];
        for (const el of root.querySelectorAll('*')) {
            const attrs = Array.from(el.attributes)
                .filter((a) => !(a.name === 'id' && /^h[1-6]$/.test(el.localName)))
                .filter((a) => !(el.localName === 'a' && (a.name === 'target' || a.name === 'rel')))
                .map((a) => `${a.name}=${a.value}`).sort().join(' ');
            out.push(`${el.namespaceURI.slice(-6)}:${el.localName}[${attrs}]`);
        }
        return { els: out, text: root.textContent };
    };
    for (const n of man) {
        const html = await (await fetch(siteUrl + n.url)).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const root = doc.querySelector('.content') || doc.querySelector('main') || doc.body;
        for (const block of root.children) {
            items++;
            const wrap = doc.createElement('div');
            wrap.appendChild(block.cloneNode(true));
            const before = describe(wrap);
            const box = document.createElement('div');
            box.appendChild(Sanitize.sanitizeHtmlToFragment(block.outerHTML));
            const after = describe(box);
            if (before.text !== after.text) diffs.push([n.url, 'text changed']);
            const a = new Set(after.els);
            const lost = before.els.filter((e) => !a.has(e));
            if (lost.length) diffs.push([n.url, lost.slice(0, 3)]);
        }
    }
    return { pages: man.length, items, diffs: diffs.slice(0, 20), diffCount: diffs.length };
}).toString()})`;

// Served from a local http page so the check runs on a normal origin.
const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><meta charset="utf-8"><body></body>');
}).listen(0);
const port = server.address().port;

const browser = await launch({ width: 800, height: 600 });
let failed = false;
try {
    await browser.send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
    await sleep(500);
    await browser.evaluate(bundle);
    const r = await browser.evaluate(`${CHECK_PAGE}(${JSON.stringify(PAYLOADS)})`);
    if (r.xss) { failed = true; console.error('FAIL: an injected script ran'); }
    for (const [p, why] of r.bad) { failed = true; console.error(`FAIL: ${why}\n      from ${p}`); }
    if (!r.sample.includes('<strong>bold</strong>')) { failed = true; console.error('FAIL: harmless markup was lost:', r.sample); }
    console.log(`${PAYLOADS.length} attack payloads: ${r.xss || r.bad.length ? 'FAILED' : 'nothing ran, nothing unsafe kept'}`);

    if (site) {
        // Fetch the site from the same origin as the check: navigate there first.
        await browser.send('Page.navigate', { url: `${site}/` });
        await sleep(2500);
        await browser.evaluate(bundle);
        const s = await browser.evaluate(`${REAL_PAGE}(${JSON.stringify(site)})`);
        console.log(`${s.pages} exercise pages, ${s.items} blocks: ${s.diffCount} changed by the sanitiser`);
        for (const d of s.diffs) console.log('  ', JSON.stringify(d).slice(0, 400));
        if (s.diffCount) failed = true;
    }
} finally {
    browser.close();
    server.close();
}
process.exit(failed ? 1 : 0);
