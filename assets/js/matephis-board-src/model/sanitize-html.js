/**
 * Allowlist sanitiser for HTML that a board file carries (exercise widgets).
 *
 * A board file can come from a file import today and from the cloud archive later, so its
 * HTML is untrusted: it must never be able to run script, load other pages or hijack the
 * board. Exercise items are cut from the site's own notes, so the allowlist is what those
 * notes contain: text markup, tables, images, MathJax output (SVG + hidden MathML) and the
 * code blocks the engines read. Everything else is removed.
 *
 * The HTML is parsed once in an inert document (no scripts, no image loads, no event
 * handlers) and the cleaned tree is imported as nodes. It is never serialised and parsed
 * again, which is what mutation-XSS tricks rely on.
 */

const HTML_NS = 'http://www.w3.org/1999/xhtml';
const SVG_NS = 'http://www.w3.org/2000/svg';
const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const words = (s) => new Set(s.trim().split(/\s+/));

// Elements removed together with everything inside them.
const DROP_WITH_CONTENT = words(`
    script style iframe frame frameset object embed applet portal fencedframe
    form input button textarea select option optgroup datalist output
    base link meta template noscript noembed noframes xmp plaintext listing
    audio video source track canvas dialog slot
    foreignobject annotation-xml annotation semantics maction
    animate animatemotion animatetransform set discard image feimage
    handler listener
`);

const ALLOWED = {
    [HTML_NS]: words(`
        h1 h2 h3 h4 h5 h6 p div span br hr
        strong em b i u s sub sup small mark abbr cite q kbd var
        ol ul li dl dt dd blockquote figure figcaption
        pre code details summary
        table caption colgroup col thead tbody tfoot tr th td
        img a
        mjx-container mjx-assistive-mml
    `),
    [SVG_NS]: words(`
        svg g defs use path rect line circle ellipse polyline polygon text tspan title desc
    `),
    [MATHML_NS]: words(`
        math mrow mi mo mn ms mtext mspace msub msup msubsup mfrac msqrt mroot
        mover munder munderover mmultiscripts mprescripts none mstyle mpadded mphantom
        menclose merror mtable mtr mtd mlabeledtr
    `),
};

const GLOBAL_ATTRS = words('class title role tabindex dir lang');

const ELEMENT_ATTRS = {
    a: words('href'),
    img: words('src alt width height loading'),
    ol: words('start type reversed'),
    p: words('start'),
    li: words('value'),
    td: words('colspan rowspan align style'),
    th: words('colspan rowspan align style scope'),
    col: words('span'),
    colgroup: words('span'),
    details: words('open'),
    'mjx-container': words('jax display style width'),
    'mjx-assistive-mml': words('unselectable display'),
};

const SVG_ATTRS = words(`
    xmlns xmlns:xlink width height viewbox preserveaspectratio x y x1 y1 x2 y2 cx cy r rx ry
    d points transform fill stroke stroke-width stroke-dasharray stroke-linecap stroke-linejoin
    stroke-miterlimit fill-opacity stroke-opacity opacity fill-rule
    font-size font-family font-weight font-style text-anchor dominant-baseline
    focusable style
`);

const MATHML_ATTRS = words(`
    xmlns display mathvariant mathsize mathcolor mathbackground stretchy fence separator
    accent accentunder movablelimits largeop symmetric minsize maxsize lspace rspace
    scriptlevel displaystyle width height depth voffset columnalign columnspacing rowspacing
    rowalign columnlines rowlines frame framespacing notation linethickness bevelled
    numalign denomalign align
`);

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);
const SAFE_DATA_IMAGE = /^data:image\/(png|gif|jpe?g|webp|svg\+xml)[;,]/i;
// MathJax's font cache ids: the only ids kept (others could shadow globals or board ids).
const SAFE_ID = /^MJX-[A-Za-z0-9-]+$/;
// No resource loads or legacy script hooks from inline styles.
const UNSAFE_STYLE = /url\s*\(|expression\s*\(|@import|behavior\s*:|-moz-binding|javascript:|\\/i;

function baseUrl() {
    return (typeof location !== 'undefined' && location.href) || 'https://matephis.com/';
}

/** True for relative URLs and for absolute ones whose protocol is in `allowed`. */
export function isSafeUrl(value, kind = 'link') {
    const raw = String(value || '').trim();
    if (!raw) return false;
    if (kind === 'image' && SAFE_DATA_IMAGE.test(raw)) return true;
    let url;
    try {
        url = new URL(raw, baseUrl());
    } catch (_) {
        return false;
    }
    const allowed = kind === 'image' ? SAFE_IMAGE_PROTOCOLS : SAFE_LINK_PROTOCOLS;
    return allowed.has(url.protocol);
}

function attrAllowed(el, ns, tag, name) {
    if (name.startsWith('on')) return false;
    if (name.startsWith('aria-') || (name.startsWith('data-') && name.length > 5)) return true;
    if (GLOBAL_ATTRS.has(name)) return true;
    if (ns === HTML_NS) return Boolean(ELEMENT_ATTRS[tag] && ELEMENT_ATTRS[tag].has(name));
    if (ns === SVG_NS) return SVG_ATTRS.has(name);
    if (ns === MATHML_NS) return MATHML_ATTRS.has(name);
    return false;
}

function cleanAttributes(el, ns, tag) {
    for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value;
        let keep;
        if (name === 'id') {
            keep = SAFE_ID.test(value);
        } else if (name === 'href' || name === 'xlink:href') {
            // Links only on HTML <a>; in SVG only same-document references (<use href="#MJX-…">).
            if (ns === HTML_NS && tag === 'a' && name === 'href') keep = isSafeUrl(value, 'link');
            else if (ns === SVG_NS && tag === 'use') keep = /^#MJX-[A-Za-z0-9-]+$/.test(value);
            else keep = false;
        } else if (name === 'src') {
            keep = ns === HTML_NS && tag === 'img' && isSafeUrl(value, 'image');
        } else if (name === 'style') {
            keep = attrAllowed(el, ns, tag, name) && !UNSAFE_STYLE.test(value);
        } else {
            keep = attrAllowed(el, ns, tag, name);
        }
        if (!keep) el.removeAttributeNode(attr);
    }
    if (ns === HTML_NS && tag === 'a' && el.hasAttribute('href')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
    }
}

function cleanTree(parent) {
    // Static copy: children are removed or replaced while walking.
    for (const node of Array.from(parent.childNodes)) {
        if (node.nodeType === 3) continue; // text
        if (node.nodeType !== 1) {
            node.remove(); // comments, processing instructions, CDATA
            continue;
        }
        const ns = node.namespaceURI;
        const tag = node.localName.toLowerCase();
        if (DROP_WITH_CONTENT.has(tag)) {
            node.remove();
            continue;
        }
        const allowed = ALLOWED[ns] && ALLOWED[ns].has(tag);
        cleanTree(node);
        if (!allowed) {
            // Unknown but harmless wrappers: keep what they contain, lose the element.
            node.replaceWith(...Array.from(node.childNodes));
            continue;
        }
        cleanAttributes(node, ns, tag);
    }
}

function inertDocument() {
    // DOMParser documents have scripting disabled and load no images. Chrome still files a
    // CSP report for each on… attribute it parses (nothing runs): real exercises have none,
    // so a report means a board carried an attack.
    if (typeof DOMParser !== 'undefined') {
        return new DOMParser().parseFromString('<!doctype html><body></body>', 'text/html');
    }
    if (typeof document !== 'undefined' && document.implementation) {
        return document.implementation.createHTMLDocument('');
    }
    return null;
}

/**
 * Parse `html` without running it and return a DocumentFragment, owned by `targetDoc`,
 * that holds only allowlisted elements and attributes. Returns null without a DOM.
 */
export function sanitizeHtmlToFragment(html, targetDoc = (typeof document !== 'undefined' ? document : null)) {
    const doc = inertDocument();
    if (!doc || !targetDoc) return null;
    // A <template> parses its markup into an inert fragment of the inert document.
    const tpl = doc.createElement('template');
    tpl.innerHTML = typeof html === 'string' ? html : '';
    cleanTree(tpl.content);
    return targetDoc.importNode(tpl.content, true);
}
