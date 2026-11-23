/**
 * Anchored placement for trays and popovers.
 *
 * Every tray / popover opens next to the control that opened it (never at a
 * fixed screen position), is clamped inside the viewport and gets a max size
 * so long menus scroll instead of running off-screen.
 *
 * side:
 *   'top'   — above `edgeEl`, horizontally centred on `anchorEl` (bottom bar, nav pill)
 *   'left'  — left of `edgeEl`, vertically centred on `anchorEl` (rail on the right)
 *   'right' — right of `edgeEl`, vertically centred on `anchorEl` (rail on the left)
 */

const MARGIN = 8;
const GAP = 10;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function clearFloating(el) {
    for (const prop of ['left', 'top', 'maxWidth', 'maxHeight']) el.style[prop] = '';
}

export function placeFloating(el, anchorEl, side = 'top', edgeEl = anchorEl) {
    if (!el || el.hidden || !anchorEl) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const a = anchorEl.getBoundingClientRect();
    const edge = (edgeEl || anchorEl).getBoundingClientRect();

    // Reset to a neutral spot so measuring is not affected by the previous placement.
    el.style.left = '0px';
    el.style.top = '0px';

    if (side === 'left' || side === 'right') {
        // Flip to the other side of the rail when the preferred side is too narrow
        // (e.g. rail swapped next to a pinned-left strip on a portrait tablet).
        el.style.maxWidth = `${vw - MARGIN * 2}px`;
        const natural = el.getBoundingClientRect().width;
        const roomLeft = edge.left - GAP - MARGIN;
        const roomRight = vw - edge.right - GAP - MARGIN;
        const preferred = side === 'left' ? roomLeft : roomRight;
        const other = side === 'left' ? roomRight : roomLeft;
        if (preferred < natural && other > preferred) side = side === 'left' ? 'right' : 'left';
        const room = side === 'left' ? roomLeft : roomRight;
        el.style.maxWidth = `${Math.max(160, room)}px`;
        el.style.maxHeight = `${vh - MARGIN * 2}px`;
        const r = el.getBoundingClientRect();
        const x = side === 'left'
            ? Math.max(MARGIN, edge.left - GAP - r.width)
            : Math.min(vw - r.width - MARGIN, edge.right + GAP);
        const y = clamp(a.top + a.height / 2 - r.height / 2, MARGIN, vh - r.height - MARGIN);
        el.style.left = `${Math.round(x)}px`;
        el.style.top = `${Math.round(y)}px`;
        return;
    }

    el.style.maxWidth = `${vw - MARGIN * 2}px`;
    el.style.maxHeight = `${Math.max(140, edge.top - GAP - MARGIN)}px`;
    const r = el.getBoundingClientRect();
    const x = clamp(a.left + a.width / 2 - r.width / 2, MARGIN, vw - r.width - MARGIN);
    const y = Math.max(MARGIN, edge.top - GAP - r.height);
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
}
