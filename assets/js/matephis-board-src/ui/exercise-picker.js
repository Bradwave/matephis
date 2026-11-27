/**
 * Exercise Picker & HTML Extraction for Matephis Board (/board/).
 *
 * Pure parsing, query matching, URL rewriting, and HTML extraction helpers are
 * exported separately so Vitest can test them in Node without jsdom.
 */
import { AIDS_SELECTOR } from './exercise-steps.js';

export const DEFAULT_TOPICS = ['Dinamica', 'Limiti', 'Elettrostatica', 'Onde', 'Ottica'];
export const DEFAULT_SECTIONS = ['Quesiti', 'Quiz', 'Problemi'];

const SECTION_SYNONYMS = {
    quesiti: 'quesiti',
    quesito: 'quesiti',
    quiz: 'quiz',
    problemi: 'problemi',
    problema: 'problemi',
    esplorazioni: 'esplorazioni',
    esplorazione: 'esplorazioni',
    domande: 'domande',
    domanda: 'domande',
    esercizi: 'esercizi',
    esercizio: 'esercizi',
};

const STOP_WORDS = new Set(['esercizi', 'esercizio', 'su', 'sui', 'sulle', 'sulla', 'di', 'del', 'della', 'delle', 'degli', 'il', 'la', 'le', 'i', 'gli', 'un', 'una']);

function stripAccents(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function normalizeToken(str) {
    return stripAccents(str).toLowerCase().trim();
}

function isHelperSlugOrPath(str) {
    const s = normalizeToken(str);
    return s.includes('scala-difficolt') || s.includes('soluzioni-') || s.includes('facsimile-');
}

export function normalizeManifest(raw) {
    const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.exercises) ? raw.exercises : []);
    return list
        .filter((item) => item && typeof item === 'object' && (item.url || item.slug || item.title))
        .filter((item) => !isHelperSlugOrPath(item.slug || item.url || ''))
        .map((item) => ({
            title: String(item.title || item.slug || ''),
            slug: String(item.slug || String(item.url || '').split('/').filter(Boolean).pop() || ''),
            url: String(item.url || ''),
            tags: Array.isArray(item.tags) ? item.tags.map((t) => String(t)) : [],
        }));
}

export function normalizeSearchData(raw) {
    if (!raw) return [];
    const entries = Array.isArray(raw) ? raw : Object.values(raw);
    return entries
        .filter((item) => item && typeof item === 'object' && item.url)
        .map((item) => ({
            doc: String(item.doc || item.title || ''),
            title: String(item.title || item.doc || ''),
            content: String(item.content || ''),
            url: String(item.url || ''),
        }));
}

export function extractTopicsFromManifest(manifest = [], defaults = DEFAULT_TOPICS) {
    const out = [];
    const seen = new Set();
    const add = (label, query) => {
        const key = normalizeToken(label);
        if (!key || seen.has(key)) return;
        seen.add(key);
        out.push({ id: key, label, query: query || key });
    };

    for (const d of defaults) {
        add(d, normalizeToken(d));
    }

    for (const item of manifest) {
        const slug = String(item.slug || '').replace(/^esercizi-/, '');
        if (!slug) continue;
        // Pick readable topic name from first meaningful slug token or tag
        const candidateTag = (item.tags || []).find((t) => {
            const nt = normalizeToken(t);
            return nt && nt !== 'esercizi' && nt !== 'fisica' && nt !== 'matematica' && nt !== 'attivita';
        });
        const rawTopic = candidateTag || slug.replace(/-\d+$/, '').replace(/-/g, ' ');
        const clean = rawTopic.trim();
        if (!clean) continue;
        const label = clean.charAt(0).toUpperCase() + clean.slice(1);
        add(label, normalizeToken(clean));
    }
    return out;
}

/**
 * Parse queries such as:
 *   "dinamica quesiti 4"
 *   "limiti 2.7"
 *   "elettrostatica 2 quiz 3"
 *   "forza centripeta"
 */
export function parseExerciseQuery(rawQuery, manifest = []) {
    const raw = String(rawQuery || '').trim();
    const cleaned = raw.replace(/[·,]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
        return {
            raw,
            topic: null,
            section: null,
            itemNumber: null,
            subItemNumber: null,
            keywords: [],
            text: '',
        };
    }

    const tokens = cleaned.split(' ').filter(Boolean);
    const knownTopics = new Set(DEFAULT_TOPICS.map(normalizeToken));
    for (const entry of manifest) {
        const slug = normalizeToken(entry.slug).replace(/^esercizi-/, '');
        for (const part of slug.split('-')) {
            if (part.length >= 3 && !/^\d+$/.test(part)) knownTopics.add(part);
        }
        for (const t of entry.tags || []) {
            const nt = normalizeToken(t);
            if (nt && nt !== 'esercizi') knownTopics.add(nt);
        }
    }

    let topic = null;
    let section = null;
    let itemNumber = null;
    let subItemNumber = null;
    const keywords = [];

    // Find all number tokens like "4", "#4", "2.7", "#2.7"
    const numIndices = [];
    for (let i = 0; i < tokens.length; i++) {
        if (/^#?\d+(?:\.\d+)?$/.test(tokens[i])) {
            numIndices.push(i);
        }
    }

    // If there are multiple numbers (e.g. "elettrostatica 2 quiz 3"), prefer the one after section or last one
    let chosenNumIdx = -1;
    if (numIndices.length === 1) {
        chosenNumIdx = numIndices[0];
    } else if (numIndices.length > 1) {
        chosenNumIdx = numIndices[numIndices.length - 1];
    }

    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        const norm = normalizeToken(tok);

        if (i === chosenNumIdx) {
            const m = tok.match(/^#?(\d+)(?:\.(\d+))?$/);
            if (m) {
                itemNumber = Number(m[1]);
                subItemNumber = m[2] ? Number(m[2]) : null;
                continue;
            }
        }

        const sec = SECTION_SYNONYMS[norm];
        if (sec && (sec !== 'esercizi' || chosenNumIdx !== -1)) {
            if (!section) {
                section = sec;
                continue;
            }
        }

        if (!topic && knownTopics.has(norm)) {
            topic = norm;
        }
        if (!STOP_WORDS.has(norm) || tokens.length === 1) {
            keywords.push(norm);
        }
    }

    return {
        raw,
        topic,
        section,
        itemNumber,
        subItemNumber,
        keywords,
        text: cleaned,
    };
}

export function findMatchingNotes(manifest = [], parsedQuery, searchData = []) {
    const q = typeof parsedQuery === 'string' ? parseExerciseQuery(parsedQuery, manifest) : (parsedQuery || parseExerciseQuery(''));
    const terms = [];
    if (q.topic) terms.push(normalizeToken(q.topic));
    for (const kw of q.keywords || []) {
        if (!terms.includes(kw)) terms.push(kw);
    }

    const byUrl = new Map();
    for (const entry of manifest) {
        const slugNorm = normalizeToken(entry.slug);
        const titleNorm = normalizeToken(entry.title);
        const tagsNorm = (entry.tags || []).map(normalizeToken);
        let score = 0;

        if (terms.length === 0) {
            score = 1;
        } else {
            for (const term of terms) {
                if (slugNorm === term || slugNorm === `esercizi-${term}`) score += 100;
                else if (slugNorm.includes(term)) score += 60;
                if (tagsNorm.some((t) => t === term)) score += 50;
                else if (tagsNorm.some((t) => t.includes(term))) score += 25;
                if (titleNorm.includes(term)) score += 40;
            }
        }
        if (score > 0) {
            byUrl.set(entry.url, {
                ...entry,
                score,
                snippet: '',
            });
        }
    }

    // Enrich / fallback via SearchData.json
    if (terms.length > 0 && Array.isArray(searchData) && searchData.length > 0) {
        const manifestUrls = new Set(manifest.map((m) => m.url));
        for (const sd of searchData) {
            if (isHelperSlugOrPath(sd.url)) continue;
            const inManifest = manifestUrls.has(sd.url);
            // If we already have strong manifest matches and this isn't an exercise note, weight lower
            const titleNorm = normalizeToken(sd.title);
            const contentNorm = normalizeToken(sd.content);
            let sdScore = 0;
            let firstHitIdx = -1;
            for (const term of terms) {
                if (titleNorm.includes(term)) sdScore += 35;
                const idx = contentNorm.indexOf(term);
                if (idx !== -1) {
                    sdScore += 15;
                    if (firstHitIdx === -1) firstHitIdx = idx;
                }
            }
            if (sdScore > 0 && (inManifest || byUrl.size === 0 || sdScore >= 30)) {
                const existing = byUrl.get(sd.url);
                let snippet = '';
                if (firstHitIdx !== -1 && sd.content) {
                    const start = Math.max(0, firstHitIdx - 45);
                    const end = Math.min(sd.content.length, firstHitIdx + 120);
                    snippet = (start > 0 ? '…' : '') + sd.content.slice(start, end).trim() + (end < sd.content.length ? '…' : '');
                }
                if (existing) {
                    existing.score += sdScore;
                    if (snippet && !existing.snippet) existing.snippet = snippet;
                } else if (inManifest || normalizeToken(sd.url).includes('esercizi')) {
                    byUrl.set(sd.url, {
                        title: sd.title,
                        slug: sd.url.split('/').filter(Boolean).pop() || '',
                        url: sd.url,
                        tags: [],
                        score: sdScore + (inManifest ? 20 : 0),
                        snippet,
                    });
                }
            }
        }
    }

    return Array.from(byUrl.values()).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function rewriteRelativeUrl(rawUrl, noteUrl = '', baseurl = '') {
    if (!rawUrl || typeof rawUrl !== 'string') return rawUrl || '';
    const trimmed = rawUrl.trim();
    if (!trimmed) return trimmed;
    if (/^(?:https?:|data:|blob:|mailto:|javascript:|#)/i.test(trimmed) || trimmed.startsWith('//')) {
        return trimmed;
    }
    const cleanBase = baseurl && baseurl !== '/' ? (baseurl.endsWith('/') ? baseurl.slice(0, -1) : baseurl) : '';
    if (trimmed.startsWith('/')) {
        if (cleanBase && !trimmed.startsWith(`${cleanBase}/`) && trimmed !== cleanBase) {
            return `${cleanBase}${trimmed}`;
        }
        return trimmed;
    }
    const baseNotePath = noteUrl
        ? (noteUrl.startsWith('/') ? noteUrl : `/${noteUrl}`)
        : '/notes/note';
    try {
        const resolved = new URL(trimmed, `https://matephis.local${baseNotePath}`);
        let out = `${resolved.pathname}${resolved.search}${resolved.hash}`;
        if (cleanBase && baseNotePath.startsWith(`${cleanBase}/`) && !out.startsWith(`${cleanBase}/`)) {
            out = `${cleanBase}${out}`;
        }
        return out;
    } catch (_) {
        return trimmed;
    }
}

// =============================================================================
// Lightweight Pure-JS HTML DOM Fallback (used in Node when DOMParser is absent)
// =============================================================================

const VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
    'meta', 'param', 'source', 'track', 'wbr',
]);

function decodeEntities(str) {
    return String(str || '')
        .replace(/&nbsp;/gi, '\u00a0')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&amp;/gi, '&');
}

function escapeAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeHtmlText(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

class MiniText {
    constructor(text) {
        this.nodeType = 3;
        this.data = decodeEntities(text);
        this.parentNode = null;
    }
    get textContent() { return this.data; }
    cloneNode() { return new MiniText(escapeHtmlText(this.data)); }
}

class MiniElement {
    constructor(tagName, attrs = {}) {
        this.nodeType = 1;
        this.tagName = tagName.toUpperCase();
        this._attrs = { ...attrs };
        this.childNodes = [];
        this.parentNode = null;
    }

    get id() { return this._attrs.id || ''; }
    get className() { return this._attrs.class || ''; }
    set className(val) { this._attrs.class = String(val || ''); }
    get attributes() {
        return Object.entries(this._attrs).map(([name, value]) => ({ name, value }));
    }

    get classList() {
        const el = this;
        const list = () => (el._attrs.class || '').split(/\s+/).filter(Boolean);
        return {
            contains: (c) => list().includes(c),
            add: (...cls) => {
                const s = new Set(list());
                for (const c of cls) if (c) s.add(c);
                el._attrs.class = Array.from(s).join(' ');
            },
            remove: (...cls) => {
                const rem = new Set(cls);
                el._attrs.class = list().filter((c) => !rem.has(c)).join(' ');
            },
        };
    }

    get children() {
        return this.childNodes.filter((n) => n.nodeType === 1);
    }

    get nextElementSibling() {
        if (!this.parentNode) return null;
        const sibs = this.parentNode.children;
        const idx = sibs.indexOf(this);
        return idx >= 0 && idx + 1 < sibs.length ? sibs[idx + 1] : null;
    }

    getAttribute(name) {
        const key = String(name).toLowerCase();
        return Object.prototype.hasOwnProperty.call(this._attrs, key) ? this._attrs[key] : null;
    }

    setAttribute(name, val) {
        this._attrs[String(name).toLowerCase()] = String(val);
    }

    hasAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this._attrs, String(name).toLowerCase());
    }

    removeAttribute(name) {
        delete this._attrs[String(name).toLowerCase()];
    }

    appendChild(node) {
        if (!node) return node;
        node.parentNode = this;
        this.childNodes.push(node);
        return node;
    }

    replaceChild(newNode, oldNode) {
        const idx = this.childNodes.indexOf(oldNode);
        if (idx === -1) return oldNode;
        newNode.parentNode = this;
        oldNode.parentNode = null;
        this.childNodes[idx] = newNode;
        return oldNode;
    }

    get textContent() {
        return this.childNodes.map((n) => n.textContent).join('');
    }

    get innerHTML() {
        return this.childNodes.map((n) => {
            if (n.nodeType === 3) return escapeHtmlText(n.data);
            return n.outerHTML;
        }).join('');
    }

    get outerHTML() {
        const tag = this.tagName.toLowerCase();
        const attrStr = Object.entries(this._attrs)
            .map(([k, v]) => (v === '' ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
            .join('');
        if (VOID_TAGS.has(tag)) return `<${tag}${attrStr} />`;
        return `<${tag}${attrStr}>${this.innerHTML}</${tag}>`;
    }

    cloneNode(deep = false) {
        const copy = new MiniElement(this.tagName, this._attrs);
        if (deep) {
            for (const c of this.childNodes) {
                copy.appendChild(c.cloneNode(true));
            }
        }
        return copy;
    }

    _matchesSimple(simpleSel) {
        const s = simpleSel.trim();
        if (!s) return false;
        let rest = s;
        // Tag
        const tagMatch = rest.match(/^[a-zA-Z0-9_-]+/);
        if (tagMatch) {
            if (this.tagName.toLowerCase() !== tagMatch[0].toLowerCase()) return false;
            rest = rest.slice(tagMatch[0].length);
        }
        while (rest.length > 0) {
            if (rest[0] === '.') {
                const m = rest.slice(1).match(/^[a-zA-Z0-9_-]+/);
                if (!m) return false;
                if (!this.classList.contains(m[0])) return false;
                rest = rest.slice(1 + m[0].length);
            } else if (rest[0] === '#') {
                const m = rest.slice(1).match(/^[a-zA-Z0-9_-]+/);
                if (!m) return false;
                if (this.id !== m[0]) return false;
                rest = rest.slice(1 + m[0].length);
            } else {
                return false;
            }
        }
        return true;
    }

    _matchesSelector(sel) {
        const parts = sel.trim().split(/\s+/);
        if (parts.length === 1) return this._matchesSimple(parts[0]);
        if (!this._matchesSimple(parts[parts.length - 1])) return false;
        // Walk ancestors for remaining parts
        let idx = parts.length - 2;
        let cur = this.parentNode;
        while (idx >= 0 && cur && cur.nodeType === 1) {
            if (cur._matchesSimple(parts[idx])) idx--;
            cur = cur.parentNode;
        }
        return idx < 0;
    }

    querySelectorAll(selector) {
        const selectors = String(selector).split(',').map((s) => s.trim()).filter(Boolean);
        const results = [];
        const walk = (node) => {
            for (const child of node.children) {
                if (selectors.some((sel) => child._matchesSelector(sel))) {
                    results.push(child);
                }
                walk(child);
            }
        };
        walk(this);
        return results;
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }
}

export function parseMiniHtml(html) {
    const root = new MiniElement('DOCUMENT');
    const body = new MiniElement('BODY');
    root.appendChild(body);
    const stack = [body];
    const src = String(html || '');
    const tagRe = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^<>]*?)?)\s*\/?>/g;
    let lastIdx = 0;
    let m;

    const parseAttrs = (rawAttrs) => {
        const attrs = {};
        if (!rawAttrs) return attrs;
        const attrRe = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        let am;
        while ((am = attrRe.exec(rawAttrs)) !== null) {
            const key = am[1].toLowerCase();
            const val = am[2] !== undefined ? am[2] : (am[3] !== undefined ? am[3] : (am[4] !== undefined ? am[4] : ''));
            attrs[key] = decodeEntities(val);
        }
        return attrs;
    };

    while ((m = tagRe.exec(src)) !== null) {
        if (m.index > lastIdx) {
            const text = src.slice(lastIdx, m.index);
            if (text) stack[stack.length - 1].appendChild(new MiniText(text));
        }
        lastIdx = tagRe.lastIndex;
        const full = m[0];
        if (full.startsWith('<!--')) continue;
        const tag = (m[1] || '').toLowerCase();
        if (!tag) continue;
        if (tag === 'html' || tag === 'head') continue;
        if (tag === 'body') continue;

        const isClosing = full.startsWith('</');
        const selfClosing = full.endsWith('/>') || VOID_TAGS.has(tag);

        if (isClosing) {
            for (let i = stack.length - 1; i >= 1; i--) {
                if (stack[i].tagName.toLowerCase() === tag) {
                    stack.length = i;
                    break;
                }
            }
            continue;
        }

        // Skip raw <script> / <style> contents cleanly
        if (tag === 'script' || tag === 'style') {
            if (!selfClosing) {
                const closeRe = new RegExp(`</${tag}\\s*>`, 'i');
                const rest = src.slice(lastIdx);
                const cm = closeRe.exec(rest);
                if (cm) {
                    lastIdx += cm.index + cm[0].length;
                    tagRe.lastIndex = lastIdx;
                }
            }
            continue;
        }

        // Implicit <li> closure when encountering sibling <li> directly inside <ol>/<ul>
        if (tag === 'li' && stack[stack.length - 1].tagName === 'LI') {
            stack.pop();
        }
        if (tag === 'p' && stack[stack.length - 1].tagName === 'P') {
            stack.pop();
        }

        const el = new MiniElement(tag, parseAttrs(m[2]));
        stack[stack.length - 1].appendChild(el);
        if (!selfClosing) {
            stack.push(el);
        }
    }

    if (lastIdx < src.length) {
        const tail = src.slice(lastIdx);
        if (tail) stack[stack.length - 1].appendChild(new MiniText(tail));
    }

    return {
        body,
        querySelector: (sel) => body.querySelector(sel),
        querySelectorAll: (sel) => body.querySelectorAll(sel),
    };
}

export function parseHtmlToDocument(html, DOMParserImpl = null) {
    if (DOMParserImpl) {
        return new DOMParserImpl().parseFromString(html, 'text/html');
    }
    if (typeof DOMParser !== 'undefined') {
        return new DOMParser().parseFromString(html, 'text/html');
    }
    return parseMiniHtml(html);
}

// =============================================================================
// Exercise HTML Extraction
// =============================================================================

function rewriteUrlsInElement(rootEl, noteUrl, baseurl) {
    if (!rootEl) return;
    const imgs = rootEl.querySelectorAll('img');
    for (const img of imgs) {
        const src = img.getAttribute('src');
        if (src) img.setAttribute('src', rewriteRelativeUrl(src, noteUrl, baseurl));
    }
    const links = rootEl.querySelectorAll('a');
    for (const a of links) {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#')) {
            a.setAttribute('href', rewriteRelativeUrl(href, noteUrl, baseurl));
        }
    }
}

function directChildrenByTag(el, tagLower) {
    return Array.from(el.children || []).filter((c) => c.tagName && c.tagName.toLowerCase() === tagLower);
}

function getLiStemHtml(liEl) {
    // Collect everything inside <li> before the first nested <ol>/<ul>
    const parts = [];
    for (const child of liEl.childNodes || []) {
        if (child.nodeType === 1) {
            const t = child.tagName.toLowerCase();
            if (t === 'ol' || t === 'ul') break;
            parts.push(child.outerHTML);
        } else if (child.nodeType === 3) {
            parts.push(escapeHtmlText(child.data));
        }
    }
    return parts.join('').trim();
}

function cleanText(str) {
    return String(str || '').replace(/\s+/g, ' ').trim();
}

function extractDifficulty(el) {
    const tag = el.querySelector && el.querySelector('.difficulty-tag');
    if (tag) return cleanText(tag.textContent);
    const txt = el.textContent || '';
    const m = txt.match(/\[([A-Z]{1,3}(?:\/[A-Z])?[+-]?)\]/);
    return m ? m[1] : '';
}

function hasSolutionMarkup(el) {
    if (!el || !el.querySelector) return false;
    return Boolean(el.querySelector(AIDS_SELECTOR));
}

function stripOpenDetails(el) {
    if (!el || !el.querySelectorAll) return;
    for (const d of el.querySelectorAll('details')) {
        d.removeAttribute('open');
    }
}

/**
 * Build a map of glyph id -> <path> element from a pre-rendered page's
 * `#MJX-SVG-global-cache` (created at build time by tools/mathjax/prerender.mjs).
 */
function buildMathGlyphMap(doc) {
    const map = new Map();
    if (!doc || typeof doc.querySelector !== 'function') return map;
    const cache = doc.querySelector('#MJX-SVG-global-cache');
    if (!cache || typeof cache.querySelectorAll !== 'function') return map;
    const paths = cache.querySelectorAll('path');
    for (let i = 0; i < paths.length; i++) {
        const p = paths[i];
        const id = p && typeof p.getAttribute === 'function' ? p.getAttribute('id') : null;
        const d = p && typeof p.getAttribute === 'function' ? p.getAttribute('d') : null;
        if (id && d !== null) map.set(id, p);
    }
    return map;
}

/**
 * Make pre-rendered MathJax SVG formulas self-contained by replacing each
 * `<use xlink:href="#MJX-...">` with the referenced `<path>` from the note's
 * global font cache. Extracted exercises then render on /board/ (and survive
 * IndexedDB reloads, dom-picture bitmaps, sanitizer passes, and SVG export)
 * without depending on the source page's `#MJX-SVG-global-cache` or colliding
 * on duplicate IDs.
 */
function inlinePrerenderedMathGlyphs(rootEl, glyphMap) {
    if (!rootEl || !glyphMap || glyphMap.size === 0 || typeof rootEl.querySelectorAll !== 'function') return;
    const uses = Array.from(rootEl.querySelectorAll('use'));
    for (const use of uses) {
        const href = use.getAttribute('xlink:href') || use.getAttribute('href');
        if (!href || !href.startsWith('#')) continue;
        const glyph = glyphMap.get(href.slice(1));
        if (!glyph || typeof glyph.cloneNode !== 'function') continue;

        const path = glyph.cloneNode(false);
        if (typeof path.removeAttribute === 'function') path.removeAttribute('id');

        const attrs = use.attributes ? Array.from(use.attributes) : [];
        let transform = '';
        let ux = null;
        let uy = null;
        for (const attr of attrs) {
            const name = attr.name;
            const lower = name.toLowerCase();
            if (lower === 'xlink:href' || lower === 'href') continue;
            if (lower === 'x') { ux = attr.value; continue; }
            if (lower === 'y') { uy = attr.value; continue; }
            if (lower === 'transform') { transform = attr.value; continue; }
            path.setAttribute(name, attr.value);
        }
        if (ux !== null || uy !== null) {
            const tx = ux || '0';
            const ty = uy || '0';
            transform = transform ? `translate(${tx},${ty}) ${transform}` : `translate(${tx},${ty})`;
        }
        if (transform) path.setAttribute('transform', transform);

        if (use.parentNode && typeof use.parentNode.replaceChild === 'function') {
            use.parentNode.replaceChild(path, use);
        }
    }
}

/**
 * Extracts all structured exercises from an exercise note's HTML document,
 * and returns the best match for `{ section, itemNumber, subItemNumber, searchText }`.
 */
export function extractExercisesFromHtml(html, opts = {}) {
    const {
        noteUrl = '',
        noteTitle = '',
        baseurl = '',
        section = null,
        itemNumber = null,
        subItemNumber = null,
        searchText = '',
        DOMParserImpl = null,
    } = opts;

    const doc = parseHtmlToDocument(html, DOMParserImpl);
    const mathGlyphs = buildMathGlyphMap(doc);
    const contentRoot = doc.querySelector('.content')
        || doc.querySelector('main')
        || doc.body
        || doc;

    const docTitleEl = doc.querySelector('h1');
    const resolvedTitle = noteTitle || (docTitleEl ? cleanText(docTitleEl.textContent) : '');

    let currentSection = '';
    let currentSectionKey = '';
    let currentSubsection = '';
    let problemCounter = 0;

    const items = [];
    const children = contentRoot.children || [];

    const pushItem = (entry) => {
        items.push(entry);
    };

    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const tag = node.tagName ? node.tagName.toLowerCase() : '';

        if (tag === 'h2') {
            currentSection = cleanText(node.textContent);
            currentSectionKey = normalizeToken(currentSection);
            currentSubsection = '';
            problemCounter = 0;
            continue;
        }
        if (tag === 'h3') {
            currentSubsection = cleanText(node.textContent);
            continue;
        }

        if (tag === 'ol') {
            const startAttr = Number(node.getAttribute('start'));
            const startNum = Number.isFinite(startAttr) && startAttr > 0 ? startAttr : 1;
            const lis = directChildrenByTag(node, 'li');

            for (let liIdx = 0; liIdx < lis.length; liIdx++) {
                const num = startNum + liIdx;
                const clone = lis[liIdx].cloneNode(true);
                rewriteUrlsInElement(clone, noteUrl, baseurl);
                stripOpenDetails(clone);
                inlinePrerenderedMathGlyphs(clone, mathGlyphs);

                const itemHtml = `<div class="board-ex-item">${clone.innerHTML}</div>`;
                const itemText = cleanText(clone.textContent);
                const diff = extractDifficulty(clone);

                const parentEntry = {
                    section: currentSection || 'Esercizi',
                    sectionKey: currentSectionKey || 'esercizi',
                    subsection: currentSubsection,
                    itemNumber: num,
                    subItemNumber: null,
                    label: `#${num}`,
                    difficulty: diff,
                    hasSolution: hasSolutionMarkup(clone),
                    html: itemHtml,
                    text: itemText,
                };
                pushItem(parentEntry);

                // Nested <ol> sub-items (e.g. 2.7)
                const nestedOls = directChildrenByTag(clone, 'ol');
                if (nestedOls.length > 0) {
                    const stemHtml = getLiStemHtml(clone);
                    let subOffset = 0;
                    for (const subOl of nestedOls) {
                        const subStartAttr = Number(subOl.getAttribute('start'));
                        const subStart = Number.isFinite(subStartAttr) && subStartAttr > 0 ? subStartAttr : (subOffset + 1);
                        const subLis = directChildrenByTag(subOl, 'li');
                        for (let sIdx = 0; sIdx < subLis.length; sIdx++) {
                            const subNum = subStart + sIdx;
                            const subClone = subLis[sIdx].cloneNode(true);
                            const subHtml = [
                                stemHtml ? `<div class="board-ex-stem">${stemHtml}</div>` : '',
                                `<div class="board-ex-subitem"><span class="board-ex-subnum">${num}.${subNum})</span> ${subClone.innerHTML}</div>`,
                            ].filter(Boolean).join('');
                            pushItem({
                                section: currentSection || 'Esercizi',
                                sectionKey: currentSectionKey || 'esercizi',
                                subsection: currentSubsection,
                                itemNumber: num,
                                subItemNumber: subNum,
                                label: `#${num}.${subNum}`,
                                difficulty: diff || extractDifficulty(subClone),
                                hasSolution: hasSolutionMarkup(subClone) || parentEntry.hasSolution,
                                html: subHtml,
                                text: cleanText(`${stemHtml ? `${cleanText(parseMiniHtml(stemHtml).body.textContent)} ` : ''}${subClone.textContent}`),
                            });
                        }
                        subOffset += subLis.length;
                    }
                }
            }
            continue;
        }

        // Unnumbered **Title [DIFF]** problem blocks (commonly under ## Problemi)
        if (tag === 'p') {
            const firstChild = (node.children || [])[0];
            const startsWithStrong = firstChild && firstChild.tagName && firstChild.tagName.toLowerCase() === 'strong';
            const isProblemSection = currentSectionKey.includes('problem');
            if (startsWithStrong && (isProblemSection || extractDifficulty(node))) {
                problemCounter++;
                const groupEls = [node.cloneNode(true)];
                let j = i + 1;
                while (j < children.length) {
                    const sib = children[j];
                    const stag = sib.tagName ? sib.tagName.toLowerCase() : '';
                    if (stag === 'h2' || stag === 'h3' || stag === 'hr') break;
                    if (stag === 'p') {
                        const sFirst = (sib.children || [])[0];
                        const sibStartsStrong = sFirst && sFirst.tagName && sFirst.tagName.toLowerCase() === 'strong';
                        if (sibStartsStrong && (isProblemSection || extractDifficulty(sib))) break;
                    }
                    groupEls.push(sib.cloneNode(true));
                    j++;
                }
                i = j - 1;

                const partsHtml = [];
                const partsText = [];
                let problemHasSol = false;
                let problemDiff = '';
                for (const g of groupEls) {
                    rewriteUrlsInElement(g, noteUrl, baseurl);
                    stripOpenDetails(g);
                    inlinePrerenderedMathGlyphs(g, mathGlyphs);
                    if (!problemDiff) problemDiff = extractDifficulty(g);
                    if (!problemHasSol && (hasSolutionMarkup(g) || (g.classList && (g.classList.contains('details') || g.classList.contains('solution-tag'))))) {
                        problemHasSol = true;
                    }
                    partsHtml.push(g.outerHTML);
                    partsText.push(g.textContent || '');
                }
                pushItem({
                    section: currentSection || 'Problemi',
                    sectionKey: currentSectionKey || 'problemi',
                    subsection: currentSubsection,
                    itemNumber: problemCounter,
                    subItemNumber: null,
                    label: `#${problemCounter}`,
                    difficulty: problemDiff,
                    hasSolution: problemHasSol,
                    html: `<div class="board-ex-problem">${partsHtml.join('')}</div>`,
                    text: cleanText(partsText.join(' ')),
                });
            }
        }
    }

    // Select best match
    const secFilter = section ? normalizeToken(section) : null;
    let candidates = secFilter
        ? items.filter((it) => it.sectionKey === secFilter || it.sectionKey.includes(secFilter))
        : items;
    if (candidates.length === 0) candidates = items;

    let match = null;
    if (itemNumber !== null && subItemNumber !== null) {
        match = candidates.find((it) => it.itemNumber === itemNumber && it.subItemNumber === subItemNumber)
            || candidates.find((it) => it.itemNumber === itemNumber)
            || null;
    } else if (itemNumber !== null) {
        match = candidates.find((it) => it.itemNumber === itemNumber && it.subItemNumber === null)
            || candidates.find((it) => it.itemNumber === itemNumber)
            || null;
    } else if (searchText) {
        const kws = normalizeToken(searchText).split(/\s+/).filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
        let bestScore = 0;
        for (const it of candidates) {
            const t = normalizeToken(it.text);
            let sc = 0;
            for (const kw of kws) {
                if (t.includes(kw)) sc++;
            }
            if (sc > bestScore) {
                bestScore = sc;
                match = it;
            }
        }
    }
    if (!match) {
        match = candidates.find((it) => it.subItemNumber === null) || candidates[0] || null;
    }

    return {
        noteTitle: resolvedTitle,
        noteUrl,
        items,
        candidates,
        match,
    };
}

/**
 * Hydrate any embedded Matephis engine code blocks inside an extracted exercise element.
 * Returns mounted engine instances so callers can `.destroy()` them on unmount.
 */
export async function hydrateEmbeddedEngines(containerEl, engineLoader) {
    if (!containerEl || !engineLoader) return [];
    const mounted = [];

    const specs = [
        { kind: 'plot', codeSel: 'code.language-matephis', boxSel: '.matephis-plot', wrapSel: 'div.language-matephis', global: 'MatephisPlot' },
        { kind: 'physics', codeSel: 'code.language-physics', boxSel: '.matephis-physics', wrapSel: 'div.language-physics', global: 'MatephisPhysics' },
        { kind: 'sets', codeSel: 'code.language-sets', boxSel: '.matephis-sets', wrapSel: 'div.language-sets', global: 'MatephisSets' },
        { kind: 'circuit', codeSel: 'code.language-circuit', boxSel: '.matephis-circuit', wrapSel: 'div.language-circuit', global: 'MatephisCircuit' },
    ];

    for (const sp of specs) {
        const codes = Array.from(containerEl.querySelectorAll(sp.codeSel));
        const boxes = Array.from(containerEl.querySelectorAll(sp.boxSel));
        if (codes.length === 0 && boxes.length === 0) continue;

        if ((sp.kind === 'plot' || sp.kind === 'physics' || sp.kind === 'sets')
            && typeof engineLoader.loadMathJax === 'function') {
            // Start loading MathJax so embedded engine labels wait via #MathJax-script
            engineLoader.loadMathJax();
        }

        const Engine = await engineLoader.loadEngine(sp.kind);
        if (!Engine) continue;

        const renderInto = async (host, rawSrc) => {
            let parsed = null;
            try { parsed = JSON.parse(rawSrc); } catch (_) { parsed = null; }
            if (parsed && typeof parsed === 'object') {
                if (sp.kind === 'physics' && parsed.graphs) await engineLoader.loadEngine('plot');
                if (sp.kind === 'sets' && parsed.plot) await engineLoader.loadEngine('plot');
                if (parsed.cssWidth === undefined) parsed.cssWidth = '100%';
            }

            if (sp.kind === 'circuit') {
                host.innerHTML = '';
                const jsonStr = parsed ? JSON.stringify(parsed) : rawSrc;
                Engine._render(host, jsonStr);
                return;
            }
            if (typeof Engine.render === 'function') {
                const inst = Engine.render(host, parsed || rawSrc, { noLightbox: true, observeResize: false });
                if (inst) mounted.push(inst);
            }
        };

        for (const box of boxes) {
            if (box.getAttribute('data-processed')) continue;
            const rawSrc = box.textContent;
            box.setAttribute('data-processed', 'true');
            box.innerHTML = '';
            try { await renderInto(box, rawSrc); } catch (_) { /* ignore malformed block */ }
        }

        for (const code of codes) {
            const target = code.closest(sp.wrapSel) || code.closest('pre') || code.parentElement;
            if (!target || target.getAttribute('data-processed')) continue;
            target.setAttribute('data-processed', 'true');
            const host = document.createElement('div');
            host.className = sp.boxSel.slice(1);
            host.setAttribute('data-processed', 'true');
            target.parentNode.insertBefore(host, target);
            target.style.display = 'none';
            try { await renderInto(host, code.textContent); } catch (_) { /* ignore malformed block */ }
        }
    }

    return mounted;
}

// =============================================================================
// Runtime ExercisePicker Data Client
// =============================================================================

/** "Esercizi sulle disequazioni" → "Disequazioni" (the topic is on screen); "Domande…" and "Problemi…" stay. */
export function shortNoteTitle(title) {
    const t = String(title || '').trim()
        .replace(/^esercizi\s+((introduttivi|guidati)\s+)?((sulle|sulla|sugli|sullo|sui|sul|su|delle|della|degli|dello|dei|del|di)\s+)?/i, '');
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : String(title || '');
}

/**
 * Subjects → topics → notes for the board, from `_data/board_exercises.yml`
 * (as /board-exercises.json) joined with the exercises manifest. Manifest notes
 * the catalog does not list go to an "Altro" subject, so none is lost.
 */
export function buildExerciseCatalog(raw, manifest = []) {
    const bySlug = new Map(manifest.map((m) => [m.slug, m]));
    const used = new Set();
    const subjects = [];
    for (const s of Array.isArray(raw) ? raw : []) {
        const topics = [];
        for (const t of Array.isArray(s && s.topics) ? s.topics : []) {
            const notes = (t.notes || []).map((slug) => bySlug.get(slug)).filter(Boolean);
            notes.forEach((n) => used.add(n.slug));
            if (notes.length) topics.push({ label: String(t.label), notes });
        }
        if (topics.length) subjects.push({ subject: String(s.subject), topics });
    }
    const rest = manifest.filter((m) => !used.has(m.slug));
    if (rest.length) subjects.push({ subject: 'Altro', topics: [{ label: 'Altre note', notes: rest }] });
    return subjects;
}

export class ExercisePicker {
    constructor({ baseurl = '', engineLoader = null, fetchImpl = null, DOMParserImpl = null } = {}) {
        const cleanBase = baseurl && baseurl !== '/' ? (baseurl.endsWith('/') ? baseurl.slice(0, -1) : baseurl) : '';
        this.baseurl = cleanBase;
        this.engineLoader = engineLoader;
        this.fetchImpl = fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
        this.DOMParserImpl = DOMParserImpl;

        this._manifest = null;
        this._manifestPromise = null;
        this._searchData = null;
        this._loadPromise = null;
        this._noteCache = new Map();
        this._parsedNotes = new Map();
    }

    _url(path) {
        if (/^https?:\/\//.test(path)) return path;
        const p = path.startsWith('/') ? path : `/${path}`;
        if (this.baseurl && !p.startsWith(`${this.baseurl}/`)) {
            return `${this.baseurl}${p}`;
        }
        return p;
    }

    async ensureManifest() {
        if (this._manifest !== null) return this._manifest;
        if (this._manifestPromise) return this._manifestPromise;
        this._manifestPromise = (async () => {
            if (!this.fetchImpl) {
                this._manifest = [];
                return this._manifest;
            }
            try {
                const res = await this.fetchImpl(this._url('/exercises-manifest.json'));
                this._manifest = res && res.ok ? normalizeManifest(await res.json()) : [];
            } catch (_) {
                this._manifest = [];
            }
            return this._manifest;
        })();
        return this._manifestPromise;
    }

    async ensureLoaded() {
        if (this._manifest !== null && this._searchData !== null) {
            return { manifest: this._manifest, searchData: this._searchData };
        }
        if (this._loadPromise) return this._loadPromise;

        this._loadPromise = (async () => {
            if (!this.fetchImpl) {
                this._manifest = [];
                this._searchData = [];
                return { manifest: this._manifest, searchData: this._searchData };
            }
            const [manifest, sRes] = await Promise.all([
                this.ensureManifest(),
                this.fetchImpl(this._url('/SearchData.json')).then(
                    (value) => ({ status: 'fulfilled', value }),
                    (reason) => ({ status: 'rejected', reason })
                ),
            ]);

            if (sRes.status === 'fulfilled' && sRes.value && sRes.value.ok) {
                try {
                    this._searchData = normalizeSearchData(await sRes.value.json());
                } catch (_) {
                    this._searchData = [];
                }
            } else {
                this._searchData = [];
            }

            return { manifest, searchData: this._searchData };
        })();

        return this._loadPromise;
    }

    /** Subjects → topics → notes (see buildExerciseCatalog). Does not fetch SearchData.json. */
    async loadCatalog() {
        if (this._catalog) return this._catalog;
        const manifest = await this.ensureManifest();
        let raw = [];
        if (this.fetchImpl) {
            try {
                const res = await this.fetchImpl(this._url('/board-exercises.json'));
                if (res && res.ok) raw = await res.json();
            } catch (_) { /* everything goes to "Altro" */ }
        }
        this._catalog = buildExerciseCatalog(raw, manifest);
        return this._catalog;
    }

    /** All exercises of a note, parsed once (LRU-capped to bound RAM across a lesson). */
    async loadNote(note) {
        const MAX_CACHED_NOTES = 6;
        if (this._parsedNotes.has(note.url)) {
            const hit = this._parsedNotes.get(note.url);
            this._parsedNotes.delete(note.url);
            this._parsedNotes.set(note.url, hit);
            return hit;
        }
        const url = this._url(note.url);
        const html = await this.fetchNoteHtml(note.url);
        // Raw HTML is no longer needed once parsed into exercise items.
        this._noteCache.delete(url);
        const extracted = extractExercisesFromHtml(html, {
            noteUrl: note.url,
            noteTitle: note.title,
            baseurl: this.baseurl,
            DOMParserImpl: this.DOMParserImpl,
        });
        const out = { noteTitle: extracted.noteTitle || note.title, items: extracted.items || [] };
        this._parsedNotes.set(note.url, out);
        while (this._parsedNotes.size > MAX_CACHED_NOTES) {
            const oldest = this._parsedNotes.keys().next().value;
            this._parsedNotes.delete(oldest);
        }
        return out;
    }

    getTopics() {
        return extractTopicsFromManifest(this._manifest || [], DEFAULT_TOPICS);
    }

    /** Drop cached note HTML, parsed exercises, and search corpus to reclaim RAM. */
    clearCache() {
        this._noteCache.clear();
        this._parsedNotes.clear();
        this._searchData = null;
        this._loadPromise = null;
    }

    async fetchNoteHtml(noteUrl) {
        const url = this._url(noteUrl);
        if (this._noteCache.has(url)) return this._noteCache.get(url);
        if (!this.fetchImpl) return '';
        let res = await this.fetchImpl(url);
        // Plain static servers do not map extensionless permalinks (/notes/x) to x.html.
        if (res && res.status === 404 && !/\.html?$/.test(url.split(/[?#]/)[0])) {
            const alt = await this.fetchImpl(`${url.split(/[?#]/)[0].replace(/\/$/, '')}.html`);
            if (alt && alt.ok) res = alt;
        }
        if (!res || !res.ok) throw new Error(`Impossibile caricare la nota (${res ? res.status : 'network'})`);
        const html = await res.text();
        this._noteCache.set(url, html);
        return html;
    }

    async resolveQuery(rawQuery, { topicChip = null, sectionChip = null, noteUrl = null } = {}) {
        const { manifest, searchData } = await this.ensureLoaded();
        const parsed = parseExerciseQuery(rawQuery, manifest);
        if (!parsed.topic && topicChip) {
            parsed.topic = normalizeToken(topicChip);
            if (!parsed.keywords.includes(parsed.topic)) parsed.keywords.unshift(parsed.topic);
        }
        if (!parsed.section && sectionChip) {
            parsed.section = normalizeToken(sectionChip);
        }

        const notes = findMatchingNotes(manifest, parsed, searchData);
        const targetNote = (noteUrl && (notes.find((n) => n.url === noteUrl) || manifest.find((n) => n.url === noteUrl)))
            || notes[0]
            || manifest[0]
            || null;

        if (!targetNote) {
            return { parsed, notes: [], activeNote: null, extracted: null };
        }

        const html = await this.fetchNoteHtml(targetNote.url);
        const extracted = extractExercisesFromHtml(html, {
            noteUrl: targetNote.url,
            noteTitle: targetNote.title,
            baseurl: this.baseurl,
            section: parsed.section,
            itemNumber: parsed.itemNumber,
            subItemNumber: parsed.subItemNumber,
            searchText: parsed.itemNumber === null ? parsed.keywords.filter((k) => k !== parsed.topic).join(' ') : '',
            DOMParserImpl: this.DOMParserImpl,
        });

        return {
            parsed,
            notes,
            activeNote: targetNote,
            extracted,
        };
    }
}
