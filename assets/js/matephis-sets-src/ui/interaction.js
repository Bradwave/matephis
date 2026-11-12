/**
 * Pointer and keyboard interaction of a sets diagram:
 *   - hovering (or focusing) an element lights up its arrows, its images and
 *     its preimages, and fades the rest ("hover": false turns it off);
 *   - probe handles can be dragged along their set.
 * The drawing is rebuilt on every frame, so nodes, links and drag handles are
 * registered again by each draw (reset + add*), and bind() wires them up.
 */
export class Interaction {
    constructor(scene) {
        this.scene = scene;
        this.enabled = scene.config.hover !== false;
        this.nodes = new Map();
        this.links = [];
        this.drags = [];
        this.focusKey = null;
        this.dragging = null;
        this._onMove = (e) => this._move(e);
        this._onUp = () => this._end();
        // The drawing is rebuilt under the pointer (sliders, theme): a node that is
        // replaced never sends pointerleave, so the SVG itself clears the focus
        this._onSvgMove = (e) => {
            if (this.focusKey && document.activeElement && !this.scene.svg.contains(document.activeElement)
                && !(e.target.closest && e.target.closest('.mps-el'))) this.focus(null);
        };
        this._onSvgLeave = () => {
            if (this.focusKey && !this.scene.svg.contains(document.activeElement)) this.focus(null);
        };
        if (this.enabled) {
            scene.svg.addEventListener('pointermove', this._onSvgMove);
            scene.svg.addEventListener('pointerleave', this._onSvgLeave);
        }
    }

    reset() {
        this.nodes = new Map();
        this.links = [];
        this.drags = [];
    }

    addNode(key, el) {
        if (!this.nodes.has(key)) this.nodes.set(key, []);
        this.nodes.get(key).push(el);
    }

    addLink(fromKey, toKey, el) {
        this.links.push({ fromKey, toKey, el });
    }

    addDrag(el, onMove) {
        const index = this.drags.length;
        this.drags.push(onMove);
        el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.dragging = index;
            el.classList.add('is-dragging');
            window.addEventListener('pointermove', this._onMove);
            window.addEventListener('pointerup', this._onUp);
            window.addEventListener('pointercancel', this._onUp);
        });
    }

    /** Pointer position in SVG pixels. */
    _local(e) {
        const svg = this.scene.svg;
        const r = svg.getBoundingClientRect();
        const sx = r.width ? this.scene.width / r.width : 1, sy = r.height ? this.scene.height / r.height : 1;
        return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy];
    }

    _move(e) {
        if (this.dragging === null) return;
        const fn = this.drags[this.dragging];
        if (fn) fn(...this._local(e));
    }

    _end() {
        this.dragging = null;
        window.removeEventListener('pointermove', this._onMove);
        window.removeEventListener('pointerup', this._onUp);
        window.removeEventListener('pointercancel', this._onUp);
    }

    /** Wires hover and focus on the nodes drawn this frame, and restores a focus that was on. */
    bind() {
        if (!this.enabled) return;
        this.nodes.forEach((els, key) => {
            els.forEach(el => {
                el.addEventListener('pointerenter', () => this.focus(key));
                el.addEventListener('pointerleave', () => this.focus(null));
                el.addEventListener('focus', () => this.focus(key));
                el.addEventListener('blur', () => this.focus(null));
            });
        });
        if (this.focusKey) this._apply(this.focusKey);
    }

    focus(key) {
        this.focusKey = key;
        this._apply(key);
    }

    /** Element key -> what lights up: its arrows, their other ends. */
    related(key) {
        const keys = new Set([key]);
        const links = [];
        this.links.forEach(l => {
            if (l.fromKey === key || l.toKey === key) {
                links.push(l);
                if (l.fromKey) keys.add(l.fromKey);
                if (l.toKey) keys.add(l.toKey);
            }
        });
        return { keys, links };
    }

    _apply(key) {
        const svg = this.scene.svg;
        svg.querySelectorAll('.mps-lit').forEach(el => el.classList.remove('mps-lit'));
        if (!key || !this.nodes.has(key)) {
            svg.classList.remove('mps-focus');
            return;
        }
        const { keys, links } = this.related(key);
        svg.classList.add('mps-focus');
        keys.forEach(k => (this.nodes.get(k) || []).forEach(el => el.classList.add('mps-lit')));
        links.forEach(l => l.el.classList.add('mps-lit'));
    }

    destroy() {
        this._end();
    }
}
