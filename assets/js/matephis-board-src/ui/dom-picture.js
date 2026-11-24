/**
 * Full-fidelity bitmap of a DOM subtree: the element is cloned into an SVG
 * `<foreignObject>` together with the page's CSS (with `:root` rewritten onto a
 * wrapper and the board fonts embedded as data URLs), the current values of
 * inputs, canvases and images inlined, and MathJax's shared glyph cache. The
 * browser then renders it as an image, so HTML parts (sliders, buttons, readouts,
 * exercise text and formulas) look as on the board.
 *
 * An SVG image cannot load anything external, which is why fonts, images and
 * canvases are turned into data URLs first.
 */

const EMBEDDED_FONT_FAMILIES = ['Noto Sans', 'Space Mono', 'Space Grotesk'];

const fontDataCache = new Map(); // absolute url -> Promise<dataUrl|null>
let cssCache = { key: '', promise: null };

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
    });
}

function fetchAsDataUrl(url) {
    if (!fontDataCache.has(url)) {
        fontDataCache.set(url, fetch(url)
            .then((res) => (res.ok ? res.blob() : null))
            .then((blob) => (blob ? blobToDataUrl(blob) : null))
            .catch(() => null));
    }
    return fontDataCache.get(url);
}

/** Text of a @font-face rule for one of the board fonts, with its file inlined (upright faces only). */
async function inlineFontFace(rule, baseHref) {
    const family = String(rule.style.getPropertyValue('font-family') || '').replace(/["']/g, '').trim();
    if (!EMBEDDED_FONT_FAMILIES.includes(family)) return '';
    if (/italic/i.test(rule.style.getPropertyValue('font-style'))) return '';
    let css = rule.cssText;
    const urls = [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)];
    for (const m of urls) {
        const abs = new URL(m[2], baseHref || location.href).href;
        const data = await fetchAsDataUrl(abs);
        if (!data) return '';
        css = css.replace(m[0], `url("${data}")`);
    }
    return css;
}

/**
 * All same-origin CSS of the page as one string, ready for the picture wrapper.
 * Recomputed when stylesheets are added (engines load their CSS lazily).
 */
function pageCss() {
    const sheets = Array.from(document.styleSheets);
    const key = sheets.map((s) => `${s.href || 'inline'}:${s.cssRules ? s.cssRules.length : 0}`).join('|');
    if (cssCache.key === key && cssCache.promise) return cssCache.promise;
    cssCache = {
        key,
        promise: (async () => {
            const parts = [];
            for (const sheet of sheets) {
                let rules;
                try { rules = sheet.cssRules; } catch (_) { continue; } // cross-origin sheet
                if (!rules) continue;
                for (const rule of rules) {
                    if (rule.type === 5) { // CSSFontFaceRule
                        parts.push(await inlineFontFace(rule, sheet.href));
                    } else {
                        // Variables and theme live on :root / html: move them onto the wrapper.
                        parts.push(rule.cssText
                            .replace(/:root\b/g, '.board-pic-root')
                            .replace(/(^|[\s,(])html(?=[\s,.[:{>])/g, '$1.board-pic-root'));
                    }
                }
            }
            // Anything else external (backgrounds, cursors) cannot load inside an image anyway.
            return parts.join('\n').replace(/url\(\s*(['"]?)(?!data:)[^'")]+\1\s*\)/g, 'none');
        })(),
    };
    return cssCache.promise;
}

/** Copy what lives in properties, not attributes: input values, canvases, images. */
async function freezeClone(src, dst) {
    const srcInputs = src.querySelectorAll('input, textarea, select');
    const dstInputs = dst.querySelectorAll('input, textarea, select');
    srcInputs.forEach((el, i) => {
        const d = dstInputs[i];
        if (!d) return;
        if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) d.setAttribute('checked', '');
            else d.removeAttribute('checked');
        } else if (el.tagName === 'TEXTAREA') {
            d.textContent = el.value;
        } else {
            d.setAttribute('value', el.value);
        }
    });

    const srcCanvases = src.querySelectorAll('canvas');
    const dstCanvases = dst.querySelectorAll('canvas');
    srcCanvases.forEach((c, i) => {
        const d = dstCanvases[i];
        if (!d) return;
        const img = document.createElement('img');
        try { img.src = c.toDataURL('image/png'); } catch (_) { /* tainted: leave it out */ }
        img.setAttribute('style', `width:${c.offsetWidth}px;height:${c.offsetHeight}px;display:block`);
        img.className = c.className;
        d.replaceWith(img);
    });

    const imgs = Array.from(dst.querySelectorAll('img')).filter((im) => im.src && !im.src.startsWith('data:'));
    await Promise.all(imgs.map(async (im) => {
        const data = await fetchAsDataUrl(im.src);
        if (data) im.src = data;
        else im.remove();
    }));
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Render `root` (a laid-out element) into a new canvas of `width`×`height` CSS px
 * at `scale` device px per CSS px. `strip` lists selectors removed from the copy.
 */
export async function renderDomPicture(root, { width, height, scale = 2, theme = 'light', strip = [], classesOff = [] } = {}) {
    const css = await pageCss();
    const clone = root.cloneNode(true);
    for (const sel of strip) clone.querySelectorAll(sel).forEach((n) => n.remove());
    for (const c of classesOff) clone.classList.remove(c);
    await freezeClone(root, clone);
    clone.style.left = '0px';
    clone.style.top = '0px';
    clone.style.position = 'relative';
    clone.style.transform = 'none';
    clone.style.width = `${width}px`;

    const cs = getComputedStyle(root);
    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrapper.className = 'board-pic-root board-root';
    wrapper.setAttribute('data-theme', theme);
    wrapper.setAttribute('style', [
        'position:relative', 'inset:auto', 'overflow:hidden', 'margin:0',
        `width:${width}px`, `height:${height}px`,
        `font-family:${cs.fontFamily}`, `font-size:${cs.fontSize}`, `line-height:${cs.lineHeight}`,
        `color:${cs.color}`,
    ].join(';'));

    const style = document.createElement('style');
    style.textContent = css;
    wrapper.appendChild(style);

    // MathJax (SVG output, global font cache): glyphs are <use> references into a shared <defs>.
    const mjxCache = document.getElementById('MJX-SVG-global-cache');
    if (mjxCache && clone.querySelector('mjx-container, .MathJax')) {
        const cacheClone = mjxCache.cloneNode(true);
        cacheClone.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
        wrapper.appendChild(cacheClone);
    }
    wrapper.appendChild(clone);

    const xhtml = new XMLSerializer().serializeToString(wrapper);
    const pxW = Math.max(1, Math.round(width * scale));
    const pxH = Math.max(1, Math.round(height * scale));
    // Inside an SVG image the <svg> is the root element: `rem` must resolve as on the page.
    const rootFont = getComputedStyle(document.documentElement).fontSize || '16px';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${width} ${height}" style="font-size:${rootFont}">`
        + `<foreignObject x="0" y="0" width="${width}" height="${height}">${xhtml}</foreignObject></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    try {
        const img = await loadImage(url);
        if (img.decode) { try { await img.decode(); } catch (_) { /* drawn anyway */ } }
        const canvas = document.createElement('canvas');
        canvas.width = pxW;
        canvas.height = pxH;
        canvas.getContext('2d').drawImage(img, 0, 0, pxW, pxH);
        return canvas;
    } finally {
        URL.revokeObjectURL(url);
    }
}
