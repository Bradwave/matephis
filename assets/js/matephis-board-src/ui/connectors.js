/**
 * Explanation Connectors for Matephis Board (Track 2B).
 *
 * Paired derivation markers (`A, B, C…` or `1, 2, 3…`) rendered in screen space
 * inside `overlay.connectorsLayer`, anchored to world coordinates (mm).
 * Supports Nuovo -> auto-Collega across pages, tap-to-jump with JS-timed
 * highlight ring, drag-to-move, contextual selection chip, and HistoryStack undo/redo.
 */

import { worldToScreen } from '../ink/geometry.js';
import { resolveInkColor } from '../ink/palette.js';
import { nextConnectorId } from '../model/scene.js';

const DRAG_THRESHOLD_PX = 4;
const LONG_PRESS_MS = 420;
const HIGHLIGHT_MS = 1400;

let pairCounter = 1;

export function nextPairId() {
    return `pair_${Date.now().toString(36)}_${(pairCounter++).toString(36)}`;
}

/**
 * Project a connector's world coordinates (mm) to screen CSS pixels.
 */
export function computeConnectorScreenPos(connector, cam) {
    return worldToScreen(connector.x, connector.y, cam);
}

/**
 * Compute target camera `{ x, y, scale }` that centers `connector` in the viewport
 * while preserving the current zoom scale.
 */
export function computeJumpCamera(connector, currentCam, viewportW, viewportH) {
    const scale = (currentCam && currentCam.scale > 0)
        ? currentCam.scale
        : ((currentCam && currentCam.baseScale > 0) ? currentCam.baseScale : 4);
    const vw = viewportW || 1280;
    const vh = viewportH || 720;
    return {
        x: connector.x - (vw / scale) * 0.5,
        y: connector.y - (vh / scale) * 0.5,
        scale,
    };
}

/**
 * Scan all pages in `scene` for unpaired ("open") connectors whose `pairId`
 * currently appears only once across the entire document.
 */
export function findOpenConnectors(scene, seriesFilter = null) {
    if (!scene || !Array.isArray(scene.pages)) return [];
    const counts = new Map();
    const entries = [];

    for (let i = 0; i < scene.pages.length; i++) {
        const page = scene.pages[i];
        const list = Array.isArray(page.connectors) ? page.connectors : [];
        for (let j = 0; j < list.length; j++) {
            const c = list[j];
            counts.set(c.pairId, (counts.get(c.pairId) || 0) + 1);
            entries.push({ pageIndex: i, pageId: page.id, connector: c });
        }
    }

    const open = [];
    for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        if (counts.get(item.connector.pairId) !== 1) continue;
        if (seriesFilter && item.connector.series !== seriesFilter) continue;
        open.push({
            pairId: item.connector.pairId,
            series: item.connector.series,
            label: item.connector.label,
            color: item.connector.color,
            pageIndex: item.pageIndex,
            pageId: item.pageId,
            connector: item.connector,
        });
    }
    return open;
}

/**
 * Find the matching twin connector across all pages of `scene`.
 * Returns `{ pageIndex, pageId, connector }` or `null` if unpaired.
 */
export function findTwinConnector(scene, connector) {
    if (!scene || !connector || typeof scene.findMatchingConnectors !== 'function') {
        return null;
    }
    const matches = scene.findMatchingConnectors(connector.pairId);
    let fallback = null;
    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        if (m.connector.id === connector.id) continue;
        if (m.pageIndex !== scene.currentPageIndex) return m;
        if (!fallback) fallback = m;
    }
    return fallback;
}

/**
 * Determine which open connector pair should be linked next in `Collega` (`'link'`) mode.
 */
export function resolvePendingLinkTarget(scene, pendingPair = null, preferredSeries = null) {
    if (!scene) return null;
    if (pendingPair && pendingPair.pairId && typeof scene.findMatchingConnectors === 'function') {
        const matches = scene.findMatchingConnectors(pendingPair.pairId);
        if (matches.length === 1) {
            const m = matches[0];
            return {
                pairId: m.connector.pairId,
                series: m.connector.series,
                label: m.connector.label,
                color: m.connector.color,
                pageIndex: m.pageIndex,
                pageId: m.pageId,
                connector: m.connector,
            };
        }
    }

    const allOpen = findOpenConnectors(scene);
    if (allOpen.length === 0) return null;
    if (preferredSeries) {
        const sameSeries = allOpen.find((item) => item.series === preferredSeries);
        if (sameSeries) return sameSeries;
    }
    return allOpen[0];
}

/**
 * Pure scene + history placement transition for Nuovo (`'new'`) and Collega (`'link'`).
 */
export function placeConnectorInScene({
    scene,
    history = null,
    wx,
    wy,
    series = 'alpha',
    mode = 'new',
    color = 1,
    pendingPair = null,
}) {
    if (!scene || !scene.currentPage) {
        return { connector: null, nextMode: mode, nextPendingPair: pendingPair, openConnectors: [] };
    }

    const normSeries = series === 'num' ? 'num' : 'alpha';

    if (mode === 'link') {
        const target = resolvePendingLinkTarget(scene, pendingPair, normSeries);
        if (!target) {
            return {
                connector: null,
                nextMode: 'new',
                nextPendingPair: null,
                openConnectors: [],
            };
        }
        const connector = {
            id: nextConnectorId(),
            pairId: target.pairId,
            series: target.series,
            label: target.label,
            x: wx,
            y: wy,
            color: typeof target.color === 'number' ? target.color : 1,
        };
        scene.connectors.push(connector);
        if (history) history.push({ type: 'connector-add', connector });

        const remainingOpen = findOpenConnectors(scene);
        if (remainingOpen.length > 0) {
            const nextOpen = remainingOpen.find((o) => o.series === normSeries) || remainingOpen[0];
            return {
                connector,
                nextMode: 'link',
                nextPendingPair: {
                    pairId: nextOpen.pairId,
                    series: nextOpen.series,
                    label: nextOpen.label,
                    color: nextOpen.color,
                },
                openConnectors: remainingOpen,
            };
        }

        return {
            connector,
            nextMode: 'new',
            nextPendingPair: null,
            openConnectors: [],
        };
    }

    // Nuovo ('new'): create first marker and auto-arm Collega for its twin
    const label = scene.getNextConnectorLabel(normSeries);
    const pairId = nextPairId();
    const normColor = typeof color === 'number' ? color : 1;
    const connector = {
        id: nextConnectorId(),
        pairId,
        series: normSeries,
        label,
        x: wx,
        y: wy,
        color: normColor,
    };
    scene.connectors.push(connector);
    if (history) history.push({ type: 'connector-add', connector });

    return {
        connector,
        nextMode: 'link',
        nextPendingPair: { pairId, series: normSeries, label, color: normColor },
        openConnectors: findOpenConnectors(scene),
    };
}

/**
 * Pure removal helper for `HistoryStack` (`connector-remove`).
 */
export function removeConnectorFromScene({ scene, history = null, connectorId }) {
    if (!scene || !Array.isArray(scene.connectors)) return null;
    const index = scene.connectors.findIndex((c) => c.id === connectorId);
    if (index === -1) return null;
    const [removed] = scene.connectors.splice(index, 1);
    if (history) {
        history.push({ type: 'connector-remove', connector: removed, index });
    }
    return { removed, index };
}

/**
 * Pure move commit helper for `HistoryStack` (`connector-move`).
 */
export function moveConnectorInScene({ scene, history = null, connectorId, prevX, prevY, nextX, nextY }) {
    if (!scene || !Array.isArray(scene.connectors)) return null;
    const c = scene.connectors.find((item) => item.id === connectorId);
    if (!c) return null;
    c.x = nextX;
    c.y = nextY;
    if (history) {
        history.push({ type: 'connector-move', id: connectorId, prevX, prevY, nextX, nextY });
    }
    return c;
}

export class ConnectorManager {
    constructor({
        scene,
        history,
        overlay,
        surface,
        getTheme = () => 'light',
        getToolState = () => ({}),
        onSwitchToPage = null,
        onSceneMutated = null,
        onStateChange = null,
    }) {
        this.scene = scene;
        this.history = history;
        this.overlay = overlay;
        this.surface = surface;
        this.getTheme = getTheme;
        this.getToolState = getToolState;
        this.onSwitchToPage = onSwitchToPage;
        this.onSceneMutated = onSceneMutated;
        this.onStateChange = onStateChange;

        this.pendingPair = null; // { pairId, series, label, color } | null
        this.selectedId = null;

        this._badges = new Map(); // connectorId -> { el, connector }
        this._chipEl = null;
        this._ringState = null; // { el, connectorId, rafId, timerId }
        this._drag = null;
        this._longPressTimer = null;
        this._destroyed = false;

        this._onWindowMove = (e) => this._handleDragMove(e);
        this._onWindowUp = (e) => this._handleDragEnd(e);

        this._unsubCamera = this.overlay && typeof this.overlay.onCameraSync === 'function'
            ? this.overlay.onCameraSync((cam) => this._syncPositions(cam))
            : null;
    }

    getPendingPair() {
        return this.pendingPair;
    }

    getOpenConnectors() {
        return findOpenConnectors(this.scene);
    }

    armPair(pair, { activateTool = false } = {}) {
        this.pendingPair = pair
            ? {
                pairId: pair.pairId,
                series: pair.series,
                label: pair.label,
                color: pair.color,
            }
            : null;
        this.render();
        this._emitStateChange(this.pendingPair ? 'link' : 'new', null, activateTool);
    }

    clearPending() {
        if (!this.pendingPair) return;
        this.pendingPair = null;
        this.render();
        this._emitStateChange('new');
    }

    clearSelection() {
        if (this.selectedId === null && !this._chipEl) return;
        this.selectedId = null;
        if (this._chipEl) {
            this._chipEl.remove();
            this._chipEl = null;
        }
        for (const { el } of this._badges.values()) {
            el.classList.remove('is-selected');
        }
    }

    setTheme(theme) {
        const resolvedTheme = theme || this.getTheme();
        for (const { el, connector } of this._badges.values()) {
            el.style.setProperty('--conn-color', resolveInkColor(connector.color, resolvedTheme));
        }
        if (this._ringState && this._ringState.el) {
            const c = this.scene.connectors.find((item) => item.id === this._ringState.connectorId);
            if (c) {
                this._ringState.el.style.setProperty('--conn-color', resolveInkColor(c.color, resolvedTheme));
            }
        }
    }

    /**
     * Place a new connector (Nuovo) or twin (Collega) at world coordinates (wx, wy).
     */
    handlePlaceAt(wx, wy) {
        this.clearSelection();
        const toolState = this.getToolState() || {};
        const result = placeConnectorInScene({
            scene: this.scene,
            history: this.history,
            wx,
            wy,
            series: toolState.connectorSeries || 'alpha',
            mode: toolState.connectorMode || 'new',
            color: typeof toolState.penColor === 'number' ? toolState.penColor : 1,
            pendingPair: this.pendingPair,
        });

        this.pendingPair = result.nextPendingPair;
        if (result.connector) {
            this.render();
            this._emitStateChange(result.nextMode, result.openConnectors);
            if (this.onSceneMutated) this.onSceneMutated();
        } else {
            this._emitStateChange(result.nextMode, result.openConnectors);
        }
        return result.connector;
    }

    /**
     * Synchronize overlay DOM with `scene.currentPage.connectors` and validate pending state.
     */
    syncFromScene() {
        if (this.pendingPair) {
            const matches = this.scene.findMatchingConnectors(this.pendingPair.pairId);
            if (matches.length !== 1) {
                this.pendingPair = null;
            }
        }
        if (this.selectedId) {
            const stillHere = this.scene.connectors.some((c) => c.id === this.selectedId);
            if (!stillHere) this.clearSelection();
        }
        this.render();
        const open = findOpenConnectors(this.scene);
        const toolState = this.getToolState() || {};
        const mode = this.pendingPair
            ? 'link'
            : (toolState.connectorMode === 'link' && open.length === 0 ? 'new' : (toolState.connectorMode || 'new'));
        this._emitStateChange(mode, open);
    }

    render() {
        if (this._destroyed || !this.overlay || !this.overlay.connectorsLayer) return;

        const layer = this.overlay.connectorsLayer;
        const theme = this.getTheme();
        const list = this.scene.connectors || [];

        // Keep highlight ring if its target is still on the current page
        const ringEl = (this._ringState && list.some((c) => c.id === this._ringState.connectorId))
            ? this._ringState.el
            : null;
        if (!ringEl && this._ringState) this._clearHighlight();

        layer.innerHTML = '';
        this._badges.clear();

        if (ringEl) layer.appendChild(ringEl);

        for (let i = 0; i < list.length; i++) {
            const c = list[i];
            const matches = this.scene.findMatchingConnectors(c.pairId);
            const isPaired = matches.length >= 2;
            const el = this._createBadgeElement(c, isPaired, theme);
            layer.appendChild(el);
            this._badges.set(c.id, { el, connector: c });
        }

        this._renderSelectionChip();
        this._syncPositions(this.scene.camera);
    }

    _createBadgeElement(connector, isPaired, theme) {
        const el = document.createElement('div');
        el.className = 'board-connector';
        if (!isPaired) el.classList.add('is-unpaired');
        if (this.selectedId === connector.id) el.classList.add('is-selected');
        if (this.pendingPair && this.pendingPair.pairId === connector.pairId) {
            el.classList.add('is-pending');
        }
        el.dataset.connectorId = connector.id;
        el.dataset.pairId = connector.pairId;
        el.dataset.series = connector.series;
        el.dataset.label = connector.label;
        el.style.setProperty('--conn-color', resolveInkColor(connector.color, theme));
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.title = isPaired
            ? `Connettore ${connector.label} — tocca per andare al gemello (trascina per spostare)`
            : `Connettore ${connector.label} (non collegato — tocca per opzioni, trascina per spostare)`;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'board-connector-label';
        labelSpan.textContent = connector.label;

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'board-connector-del';
        delBtn.title = `Elimina connettore ${connector.label}`;
        delBtn.setAttribute('aria-label', `Elimina connettore ${connector.label}`);
        delBtn.textContent = '×';
        delBtn.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
        });
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteConnector(connector.id);
        });

        el.append(labelSpan, delBtn);

        el.addEventListener('pointerdown', (e) => this._onBadgePointerDown(e, connector, el));
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._selectConnector(connector.id);
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this._handleBadgeTap(connector);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                this.deleteConnector(connector.id);
            }
        });

        return el;
    }

    _onBadgePointerDown(e, connector, el) {
        if (e.button === 2) return;
        e.stopPropagation();
        e.preventDefault();

        this._cancelLongPress();
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }

        this._drag = {
            pointerId: e.pointerId,
            connector,
            el,
            startClientX: e.clientX,
            startClientY: e.clientY,
            origX: connector.x,
            origY: connector.y,
            moved: false,
            longPressed: false,
        };

        this._longPressTimer = setTimeout(() => {
            this._longPressTimer = null;
            if (this._drag && !this._drag.moved) {
                this._drag.longPressed = true;
                this._selectConnector(connector.id);
            }
        }, LONG_PRESS_MS);

        if (typeof window !== 'undefined') {
            window.addEventListener('pointermove', this._onWindowMove);
            window.addEventListener('pointerup', this._onWindowUp);
            window.addEventListener('pointercancel', this._onWindowUp);
        }
    }

    _handleDragMove(e) {
        const drag = this._drag;
        if (!drag || e.pointerId !== drag.pointerId) return;

        const dxPx = e.clientX - drag.startClientX;
        const dyPx = e.clientY - drag.startClientY;
        if (!drag.moved && Math.hypot(dxPx, dyPx) > DRAG_THRESHOLD_PX) {
            drag.moved = true;
            this._cancelLongPress();
        }
        if (!drag.moved) return;

        const scale = (this.scene.camera && this.scene.camera.scale) || 1;
        drag.connector.x = drag.origX + dxPx / scale;
        drag.connector.y = drag.origY + dyPx / scale;
        this._syncPositions(this.scene.camera);
    }

    _handleDragEnd(e) {
        const drag = this._drag;
        if (!drag || e.pointerId !== drag.pointerId) return;

        this._drag = null;
        this._cancelLongPress();
        if (typeof window !== 'undefined') {
            window.removeEventListener('pointermove', this._onWindowMove);
            window.removeEventListener('pointerup', this._onWindowUp);
            window.removeEventListener('pointercancel', this._onWindowUp);
        }

        if (drag.moved) {
            const c = drag.connector;
            if (c.x !== drag.origX || c.y !== drag.origY) {
                if (this.history) {
                    this.history.push({
                        type: 'connector-move',
                        id: c.id,
                        prevX: drag.origX,
                        prevY: drag.origY,
                        nextX: c.x,
                        nextY: c.y,
                    });
                }
                if (this.onSceneMutated) this.onSceneMutated();
            }
            this._selectConnector(c.id);
            return;
        }

        if (!drag.longPressed && e.type !== 'pointercancel') {
            this._handleBadgeTap(drag.connector);
        }
    }

    _handleBadgeTap(connector) {
        const jumped = this.jumpToTwin(connector);
        if (!jumped) {
            if (this.selectedId === connector.id) {
                this.clearSelection();
            } else {
                this._selectConnector(connector.id);
            }
        }
    }

    /**
     * Jump (or switch pages) to the matching twin and mark it with a static ring.
     * No camera glide: the board has no UI animations.
     */
    jumpToTwin(connector) {
        const twin = findTwinConnector(this.scene, connector);
        if (!twin) return false;

        this.clearSelection();
        const vw = (this.surface && this.surface.width) || this.scene.viewportW || 1280;
        const vh = (this.surface && this.surface.height) || this.scene.viewportH || 720;
        const targetCam = computeJumpCamera(twin.connector, this.scene.camera, vw, vh);

        if (twin.pageIndex !== this.scene.currentPageIndex) {
            if (this.onSwitchToPage) {
                this.onSwitchToPage(twin.pageIndex, targetCam);
            } else {
                this.scene.goToPage(twin.pageIndex);
                Object.assign(this.scene.camera, targetCam);
                this.syncFromScene();
            }
            this.highlightConnector(twin.connector.id);
        } else if (this.surface && typeof this.surface.animateCameraTo === 'function') {
            // A one-frame "animation" is an instant jump that still redraws everything.
            this.surface.animateCameraTo(targetCam, 1, () => {
                if (!this._destroyed) this.highlightConnector(twin.connector.id);
            });
        } else {
            Object.assign(this.scene.camera, targetCam);
            this._syncPositions(this.scene.camera);
            this.highlightConnector(twin.connector.id);
        }
        return true;
    }

    /**
     * Mark `connectorId` with a static square ring for a moment (no animation):
     * after a jump the eye finds the twin, then the ring goes away.
     */
    highlightConnector(connectorId, durationMs = HIGHLIGHT_MS) {
        if (this._destroyed || !this.overlay || !this.overlay.connectorsLayer) return;
        const c = (this.scene.connectors || []).find((item) => item.id === connectorId);
        if (!c) return;

        this._clearHighlight();

        const el = document.createElement('div');
        el.className = 'board-connector-ring';
        el.setAttribute('aria-hidden', 'true');
        el.style.setProperty('--conn-color', resolveInkColor(c.color, this.getTheme()));
        this.overlay.connectorsLayer.appendChild(el);

        const state = { el, connectorId, rafId: null, timerId: null };
        this._ringState = state;
        this._positionRing(el, c, this.scene.camera);
        state.timerId = setTimeout(() => {
            if (this._ringState === state) this._clearHighlight();
        }, durationMs);
    }

    deleteConnector(connectorId) {
        const res = removeConnectorFromScene({
            scene: this.scene,
            history: this.history,
            connectorId,
        });
        if (!res) return false;

        if (this.pendingPair && this.pendingPair.pairId === res.removed.pairId) {
            const matches = this.scene.findMatchingConnectors(res.removed.pairId);
            if (matches.length !== 1) this.pendingPair = null;
        }
        if (this.selectedId === connectorId) {
            this.clearSelection();
        }
        this.syncFromScene();
        if (this.onSceneMutated) this.onSceneMutated();
        return true;
    }

    _selectConnector(connectorId) {
        this.selectedId = connectorId;
        for (const [id, entry] of this._badges.entries()) {
            entry.el.classList.toggle('is-selected', id === connectorId);
        }
        this._renderSelectionChip();
        this._syncPositions(this.scene.camera);
    }

    _renderSelectionChip() {
        if (this._chipEl) {
            this._chipEl.remove();
            this._chipEl = null;
        }
        if (!this.selectedId || !this.overlay || !this.overlay.chromeLayer) return;

        const c = (this.scene.connectors || []).find((item) => item.id === this.selectedId);
        if (!c) return;

        const matches = this.scene.findMatchingConnectors(c.pairId);
        const isPaired = matches.length >= 2;

        const chip = document.createElement('div');
        chip.className = 'board-connector-chip board-overlay-interactive';
        chip.addEventListener('pointerdown', (e) => e.stopPropagation());

        const tag = document.createElement('span');
        tag.className = 'board-connector-chip-label';
        tag.textContent = c.label;
        chip.appendChild(tag);

        if (isPaired) {
            const jumpBtn = document.createElement('button');
            jumpBtn.type = 'button';
            jumpBtn.className = 'board-connector-chip-btn';
            jumpBtn.textContent = 'Vai al gemello';
            jumpBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.jumpToTwin(c);
            });
            chip.appendChild(jumpBtn);
        } else {
            const linkBtn = document.createElement('button');
            linkBtn.type = 'button';
            linkBtn.className = 'board-connector-chip-btn';
            linkBtn.textContent = 'Collega';
            linkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.armPair(c, { activateTool: true });
                this.clearSelection();
            });
            chip.appendChild(linkBtn);
        }

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'board-connector-chip-btn is-danger';
        delBtn.textContent = 'Elimina';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteConnector(c.id);
        });
        chip.appendChild(delBtn);

        this.overlay.chromeLayer.appendChild(chip);
        this._chipEl = chip;
    }

    _syncPositions(cam) {
        if (!cam || this._destroyed) return;

        for (const { el, connector } of this._badges.values()) {
            const pos = computeConnectorScreenPos(connector, cam);
            el.style.left = `${pos.x.toFixed(1)}px`;
            el.style.top = `${pos.y.toFixed(1)}px`;
        }

        if (this._chipEl && this.selectedId) {
            const c = (this.scene.connectors || []).find((item) => item.id === this.selectedId);
            if (c) {
                const pos = computeConnectorScreenPos(c, cam);
                this._chipEl.style.left = `${pos.x.toFixed(1)}px`;
                this._chipEl.style.top = `${Math.max(18, pos.y - 24).toFixed(1)}px`;
            }
        }

        if (this._ringState && this._ringState.el) {
            const c = (this.scene.connectors || []).find((item) => item.id === this._ringState.connectorId);
            if (c) this._positionRing(this._ringState.el, c, cam);
        }
    }

    _positionRing(el, connector, cam) {
        if (!cam) return;
        const pos = computeConnectorScreenPos(connector, cam);
        el.style.left = `${pos.x.toFixed(1)}px`;
        el.style.top = `${pos.y.toFixed(1)}px`;
    }

    _clearHighlight() {
        if (!this._ringState) return;
        if (this._ringState.rafId !== null && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(this._ringState.rafId);
        }
        if (this._ringState.timerId !== null) {
            clearTimeout(this._ringState.timerId);
        }
        if (this._ringState.el) this._ringState.el.remove();
        this._ringState = null;
    }

    _cancelLongPress() {
        if (this._longPressTimer !== null) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }
    }

    _emitStateChange(mode, openConnectors = null, activateTool = false) {
        if (!this.onStateChange) return;
        this.onStateChange({
            mode,
            pendingPair: this.pendingPair,
            openConnectors: openConnectors || findOpenConnectors(this.scene),
            activateTool,
        });
    }

    destroy() {
        this._destroyed = true;
        this._cancelLongPress();
        this._clearHighlight();
        this.clearSelection();
        if (this._unsubCamera) {
            this._unsubCamera();
            this._unsubCamera = null;
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('pointermove', this._onWindowMove);
            window.removeEventListener('pointerup', this._onWindowUp);
            window.removeEventListener('pointercancel', this._onWindowUp);
        }
        if (this.overlay && this.overlay.connectorsLayer) {
            this.overlay.connectorsLayer.innerHTML = '';
        }
        this._badges.clear();
    }
}
