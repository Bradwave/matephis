/**
 * Quick menu: a 3×3 square of one-tap actions that opens where the teacher taps with two
 * fingers (or two-finger clicks / right-clicks with a trackpad or mouse), so changing colour
 * or tool never means walking to the rail.
 *
 *   ink    red     blue
 *   undo   style   green
 *   bar    eraser  orange
 *
 * Centre: line style — each tap cycles solid → dashed → dotted.
 * Colours, eraser and "move the bar" close the menu; undo and the style button keep it open
 * so they can be tapped repeatedly. Tapping anywhere else closes it.
 */

import { PEN_COLORS, resolveInkColor } from '../ink/palette.js';
import { BoardIcons } from './icons.js';

const MARGIN = 8;

const RAIL_ICON = (side) => {
    // A bar on the target edge with an arrow pointing to it.
    const bar = side === 'left' ? 'M4 4v16' : 'M20 4v16';
    const arrow = side === 'left' ? 'M19 12H9M13 8l-4 4 4 4' : 'M5 12h10M11 8l4 4-4 4';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${bar}"/><path d="${arrow}"/></svg>`;
};

const STYLE_SVG = (id) => {
    const dash = id === 'dashed' ? 'stroke-dasharray="5 3.5"' : id === 'dotted' ? 'stroke-dasharray="0.5 4.5"' : '';
    return `<svg viewBox="0 0 28 10" class="board-style-svg"><line x1="2" y1="5" x2="26" y2="5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ${dash}/></svg>`;
};

export class QuickMenu {
    constructor(hostEl, { toolbar, getTheme, onUndo }) {
        this.toolbar = toolbar;
        this.getTheme = getTheme;
        this.onUndo = onUndo;
        this.targetSide = 'right';

        this.el = document.createElement('div');
        this.el.className = 'board-quick-menu';
        this.el.hidden = true;
        this.el.setAttribute('role', 'menu');
        this.el.setAttribute('aria-label', 'Menu rapido');
        this.el.addEventListener('pointerdown', (e) => e.stopPropagation());

        const slots = [];
        this.colorBtns = [];
        for (const c of PEN_COLORS.filter((item) => item.quick)) {
            const btn = this._makeBtn(c.name, '<span class="board-quick-dot-fill"></span>', () => {
                this.toolbar.setPenColor(c.id);
                this.hide();
            });
            btn.dataset.colorId = String(c.id);
            this.colorBtns.push(btn);
            slots.push(btn);
        }
        this.eraserBtn = this._makeBtn('Gomma', BoardIcons.eraser, () => {
            this.toolbar.selectTool('eraser');
            this.hide();
        });
        this.undoBtn = this._makeBtn('Annulla', BoardIcons.undo, () => {
            if (this.onUndo) this.onUndo();
        });
        this.sideBtn = this._makeBtn('Sposta qui la barra', RAIL_ICON('right'), () => {
            this.toolbar.setSide(this.targetSide);
            this.hide();
        });
        slots.push(this.eraserBtn, this.undoBtn, this.sideBtn);

        // [row, column] of each slot, in the order pushed above.
        const cells = [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [3, 2], [2, 1], [3, 1]];
        slots.forEach((btn, i) => {
            btn.style.gridRow = String(cells[i][0]);
            btn.style.gridColumn = String(cells[i][1]);
            this.el.appendChild(btn);
        });

        this.styleBtn = this._makeBtn('Stile linea', '', () => {
            this.toolbar.cyclePenStyle();
            this._render();
        });
        this.styleBtn.classList.add('is-center');
        this.styleBtn.style.gridRow = '2';
        this.styleBtn.style.gridColumn = '2';
        this.el.appendChild(this.styleBtn);

        hostEl.appendChild(this.el);

        // Close on any press outside the menu that the canvas stage does not handle itself
        // (the stage closes it through onCanvasTouch so that tap does not draw).
        document.addEventListener('pointerdown', (e) => {
            const onStage = e.target && typeof e.target.closest === 'function' && e.target.closest('.board-stage');
            if (this.isOpen && !this.el.contains(e.target) && !onStage) this.hide();
        }, true);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.hide();
        });
    }

    get isOpen() {
        return !this.el.hidden;
    }

    open(x, y) {
        this.targetSide = x < window.innerWidth / 2 ? 'left' : 'right';
        this.sideBtn.innerHTML = RAIL_ICON(this.targetSide);
        const label = this.targetSide === 'left' ? 'Sposta la barra a sinistra' : 'Sposta la barra a destra';
        this.sideBtn.title = label;
        this.sideBtn.setAttribute('aria-label', label);
        this.sideBtn.disabled = this.toolbar.layout !== 'rail' || this.toolbar.side === this.targetSide;

        this.el.hidden = false;
        this._render();
        const r = this.el.getBoundingClientRect();
        const left = Math.max(MARGIN, Math.min(window.innerWidth - r.width - MARGIN, x - r.width / 2));
        const top = Math.max(MARGIN, Math.min(window.innerHeight - r.height - MARGIN, y - r.height / 2));
        this.el.style.left = `${Math.round(left)}px`;
        this.el.style.top = `${Math.round(top)}px`;
    }

    hide() {
        this.el.hidden = true;
    }

    _render() {
        const st = this.toolbar.getToolState();
        const theme = this.getTheme();
        for (const btn of this.colorBtns) {
            const id = Number(btn.dataset.colorId);
            btn.style.setProperty('--swatch-color', resolveInkColor(id, theme));
            btn.classList.toggle('active', st.tool === 'pen' && st.penColor === id);
        }
        this.eraserBtn.classList.toggle('active', st.tool === 'eraser');
        this.styleBtn.innerHTML = STYLE_SVG(st.penStyle);
    }

    _makeBtn(label, html, onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'board-quick-item';
        btn.title = label;
        btn.setAttribute('aria-label', label);
        btn.setAttribute('role', 'menuitem');
        btn.innerHTML = html;
        btn.addEventListener('click', onClick);
        return btn;
    }
}
