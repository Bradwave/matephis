import { describe, it, expect, vi } from 'vitest';
import { BoardScene } from '../assets/js/matephis-board-src/model/scene.js';
import { HistoryStack } from '../assets/js/matephis-board-src/ink/history.js';
import {
    ConnectorManager,
    computeConnectorScreenPos,
    computeJumpCamera,
    findOpenConnectors,
    findTwinConnector,
    moveConnectorInScene,
    placeConnectorInScene,
    removeConnectorFromScene,
    resolvePendingLinkTarget,
} from '../assets/js/matephis-board-src/ui/connectors.js';

function createMockElement(tag = 'div') {
    const classes = new Set();
    const listeners = new Map();
    const children = [];
    const el = {
        tagName: tag.toUpperCase(),
        style: {
            props: {},
            setProperty(k, v) { this.props[k] = v; },
            getPropertyValue(k) { return this.props[k] || ''; },
        },
        dataset: {},
        attrs: {},
        children,
        parentNode: null,
        _innerHTML: '',
        _textContent: '',
        classList: {
            add(...names) { names.forEach((n) => classes.add(n)); },
            remove(...names) { names.forEach((n) => classes.delete(n)); },
            toggle(name, force) {
                if (force === undefined) {
                    if (classes.has(name)) { classes.delete(name); return false; }
                    classes.add(name); return true;
                }
                if (force) classes.add(name);
                else classes.delete(name);
                return Boolean(force);
            },
            contains(name) { return classes.has(name); },
        },
        set className(val) {
            classes.clear();
            String(val || '').split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
        },
        get className() {
            return Array.from(classes).join(' ');
        },
        set innerHTML(val) {
            this._innerHTML = val;
            if (val === '') children.length = 0;
        },
        get innerHTML() { return this._innerHTML; },
        set textContent(val) { this._textContent = String(val); },
        get textContent() { return this._textContent; },
        setAttribute(k, v) { this.attrs[k] = String(v); },
        getAttribute(k) { return this.attrs[k]; },
        append(...nodes) {
            for (const n of nodes) {
                n.parentNode = this;
                children.push(n);
            }
        },
        appendChild(node) {
            node.parentNode = this;
            children.push(node);
            return node;
        },
        remove() {
            if (!this.parentNode) return;
            const idx = this.parentNode.children.indexOf(this);
            if (idx !== -1) this.parentNode.children.splice(idx, 1);
            this.parentNode = null;
        },
        addEventListener(type, fn) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(fn);
        },
        removeEventListener(type, fn) {
            const list = listeners.get(type);
            if (!list) return;
            const idx = list.indexOf(fn);
            if (idx !== -1) list.splice(idx, 1);
        },
        dispatchEvent(ev) {
            const list = listeners.get(ev.type) || [];
            for (const fn of list) fn(ev);
        },
    };
    return el;
}

describe('Track 2B — Explanation Connectors pure logic', () => {
    it('generates sequential alpha and num labels and auto-arms Collega across pages', () => {
        const scene = new BoardScene(1280, 720);
        const h0 = new HistoryStack();
        const h1 = new HistoryStack();

        // Page 0: Nuovo in alpha -> places 'A' and auto-arms Collega for 'A'
        const first = placeConnectorInScene({
            scene,
            history: h0,
            wx: 45,
            wy: 60,
            series: 'alpha',
            mode: 'new',
            color: 2,
        });

        expect(first.connector).toBeTruthy();
        expect(first.connector.label).toBe('A');
        expect(first.connector.series).toBe('alpha');
        expect(first.connector.color).toBe(2);
        expect(first.nextMode).toBe('link');
        expect(first.nextPendingPair).toEqual({
            pairId: first.connector.pairId,
            series: 'alpha',
            label: 'A',
            color: 2,
        });
        expect(h0.undoStack).toHaveLength(1);
        expect(h0.undoStack[0].type).toBe('connector-add');

        // Switch to page 1 and place twin in armed Collega mode
        scene.addPage(true);
        const twin = placeConnectorInScene({
            scene,
            history: h1,
            wx: 120,
            wy: 90,
            series: 'alpha',
            mode: first.nextMode,
            color: 0, // ignored when linking; inherits original pair color
            pendingPair: first.nextPendingPair,
        });

        expect(twin.connector).toBeTruthy();
        expect(twin.connector.pairId).toBe(first.connector.pairId);
        expect(twin.connector.label).toBe('A');
        expect(twin.connector.color).toBe(2);
        expect(twin.nextMode).toBe('new');
        expect(twin.nextPendingPair).toBeNull();
        expect(twin.openConnectors).toEqual([]);

        // Next alpha pair gets 'B', numeric series starts independently at '1'
        const secondAlpha = placeConnectorInScene({
            scene,
            history: h1,
            wx: 150,
            wy: 110,
            series: 'alpha',
            mode: 'new',
            color: 1,
        });
        expect(secondAlpha.connector.label).toBe('B');

        const firstNum = placeConnectorInScene({
            scene,
            history: h1,
            wx: 180,
            wy: 110,
            series: 'num',
            mode: 'new',
            color: 3,
        });
        expect(firstNum.connector.label).toBe('1');
        expect(firstNum.connector.series).toBe('num');
    });

    it('discovers open unpaired connectors across pages and advances through multiple open pairs', () => {
        const scene = new BoardScene(1280, 720);
        // Place A on page 0 without linking
        const pA = placeConnectorInScene({
            scene,
            wx: 20,
            wy: 30,
            series: 'alpha',
            mode: 'new',
            color: 1,
        });
        // Place 1 on page 1 without linking
        scene.addPage(true);
        const p1 = placeConnectorInScene({
            scene,
            wx: 60,
            wy: 70,
            series: 'num',
            mode: 'new',
            color: 4,
        });

        const openAll = findOpenConnectors(scene);
        expect(openAll.map((o) => `${o.label}@p${o.pageIndex}`)).toEqual(['A@p0', '1@p1']);
        expect(findOpenConnectors(scene, 'alpha')).toHaveLength(1);
        expect(findOpenConnectors(scene, 'num')).toHaveLength(1);

        // Linking with no manually armed pendingPair picks matching series first
        const resolvedNum = resolvePendingLinkTarget(scene, null, 'num');
        expect(resolvedNum.label).toBe('1');

        // Link '1' on page 1 -> advances pendingPair to remaining open 'A'
        const link1 = placeConnectorInScene({
            scene,
            wx: 90,
            wy: 100,
            series: 'num',
            mode: 'link',
            pendingPair: p1.nextPendingPair,
        });
        expect(link1.connector.label).toBe('1');
        expect(link1.nextMode).toBe('link');
        expect(link1.nextPendingPair.label).toBe('A');
        expect(link1.openConnectors).toHaveLength(1);

        // Link 'A' -> no open pairs remain, resets cleanly to 'new'
        const linkA = placeConnectorInScene({
            scene,
            wx: 110,
            wy: 120,
            series: 'alpha',
            mode: link1.nextMode,
            pendingPair: link1.nextPendingPair,
        });
        expect(linkA.connector.label).toBe('A');
        expect(linkA.connector.pairId).toBe(pA.connector.pairId);
        expect(linkA.nextMode).toBe('new');
        expect(linkA.nextPendingPair).toBeNull();

        // Linking when zero open pairs exist returns null and stays 'new'
        const emptyLink = placeConnectorInScene({
            scene,
            wx: 10,
            wy: 10,
            series: 'alpha',
            mode: 'link',
            pendingPair: null,
        });
        expect(emptyLink.connector).toBeNull();
        expect(emptyLink.nextMode).toBe('new');
    });

    it('finds twins across pages, projects world->screen, and centers jump camera on twin', () => {
        const scene = new BoardScene(1280, 720);
        const c1 = placeConnectorInScene({ scene, wx: 40, wy: 50, series: 'alpha', mode: 'new', color: 0 }).connector;
        scene.addPage(true);
        const c2 = placeConnectorInScene({
            scene,
            wx: 210,
            wy: 145,
            series: 'alpha',
            mode: 'link',
            pendingPair: { pairId: c1.pairId, series: 'alpha', label: 'A', color: 0 },
        }).connector;

        // From page 1, twin is c1 on page 0
        const twinFromP1 = findTwinConnector(scene, c2);
        expect(twinFromP1).toBeTruthy();
        expect(twinFromP1.pageIndex).toBe(0);
        expect(twinFromP1.connector.id).toBe(c1.id);

        // Unpaired connector has no twin
        const orphan = placeConnectorInScene({ scene, wx: 10, wy: 10, series: 'num', mode: 'new', color: 1 }).connector;
        expect(findTwinConnector(scene, orphan)).toBeNull();

        // Screen-space projection & jump camera centering
        const cam = { x: -10, y: 5, scale: 5 };
        const screenPos = computeConnectorScreenPos(c2, cam);
        expect(screenPos).toEqual({ x: (210 - (-10)) * 5, y: (145 - 5) * 5 });

        const targetCam = computeJumpCamera(c1, cam, 1000, 600);
        expect(targetCam.scale).toBe(5);
        // Projecting c1 under targetCam places it at the exact viewport center (500, 300)
        const centered = computeConnectorScreenPos(c1, targetCam);
        expect(centered.x).toBeCloseTo(500, 6);
        expect(centered.y).toBeCloseTo(300, 6);
    });

    it('undoes and redoes connector-add, connector-move, and connector-remove via HistoryStack', () => {
        const scene = new BoardScene(1280, 720);
        const page = scene.currentPage;
        const history = new HistoryStack();

        const first = placeConnectorInScene({
            scene,
            history,
            wx: 25,
            wy: 35,
            series: 'alpha',
            mode: 'new',
            color: 0, // ensures color 0 (black/white ink) is preserved, not coerced to 1
        }).connector;
        expect(first.color).toBe(0);

        const moved = moveConnectorInScene({
            scene,
            history,
            connectorId: first.id,
            prevX: 25,
            prevY: 35,
            nextX: 85,
            nextY: 95,
        });
        expect(moved.x).toBe(85);
        expect(moved.y).toBe(95);

        const removed = removeConnectorFromScene({
            scene,
            history,
            connectorId: first.id,
        });
        expect(removed.index).toBe(0);
        expect(page.connectors).toHaveLength(0);

        // Undo remove -> restores at (85, 95)
        expect(history.undo(page)).toBe(true);
        expect(page.connectors).toHaveLength(1);
        expect(page.connectors[0].x).toBe(85);
        expect(page.connectors[0].y).toBe(95);

        // Undo move -> restores at (25, 35)
        expect(history.undo(page)).toBe(true);
        expect(page.connectors[0].x).toBe(25);
        expect(page.connectors[0].y).toBe(35);

        // Undo add -> empty
        expect(history.undo(page)).toBe(true);
        expect(page.connectors).toHaveLength(0);

        // Redo all 3 commands back to removed state
        expect(history.redo(page)).toBe(true);
        expect(page.connectors).toHaveLength(1);
        expect(history.redo(page)).toBe(true);
        expect(page.connectors[0].x).toBe(85);
        expect(history.redo(page)).toBe(true);
        expect(page.connectors).toHaveLength(0);
    });
});

describe('Track 2B — ConnectorManager overlay & lifecycle', () => {
    it('renders badges into connectorsLayer, syncs on camera changes, jumps cross-page with highlight ring, and clears stale pending on undo', () => {
        const prevDoc = globalThis.document;
        globalThis.document = {
            createElement: (tag) => createMockElement(tag),
        };

        try {
            const scene = new BoardScene(1000, 600);
            const history = new HistoryStack();
            const cameraListeners = new Set();
            const overlay = {
                connectorsLayer: createMockElement('div'),
                chromeLayer: createMockElement('div'),
                onCameraSync(fn) {
                    cameraListeners.add(fn);
                    return () => cameraListeners.delete(fn);
                },
                emitCamera(cam) {
                    for (const fn of cameraListeners) fn(cam);
                },
            };

            const animateCalls = [];
            const surface = {
                width: 1000,
                height: 600,
                animateCameraTo(targetCam, ms, onDone) {
                    animateCalls.push({ targetCam, ms });
                    Object.assign(scene.camera, targetCam);
                    overlay.emitCamera(scene.camera);
                    if (onDone) onDone();
                },
            };

            let toolState = { tool: 'connector', connectorSeries: 'alpha', connectorMode: 'new', penColor: 2 };
            const stateChanges = [];
            const switchedPages = [];

            const mgr = new ConnectorManager({
                scene,
                history,
                overlay,
                surface,
                getTheme: () => 'light',
                getToolState: () => toolState,
                onSwitchToPage: (pageIndex, targetCam) => {
                    switchedPages.push({ pageIndex, targetCam });
                    scene.goToPage(pageIndex);
                    Object.assign(scene.camera, targetCam);
                    mgr.syncFromScene();
                },
                onStateChange: (st) => {
                    stateChanges.push(st);
                    toolState = { ...toolState, connectorMode: st.mode };
                },
            });

            // 1. Place 'A' on page 0 -> auto-arms 'link' mode
            const cA = mgr.handlePlaceAt(50, 40);
            expect(cA.label).toBe('A');
            expect(toolState.connectorMode).toBe('link');
            expect(mgr.getPendingPair()?.label).toBe('A');
            expect(overlay.connectorsLayer.children).toHaveLength(1);
            const badgeA = overlay.connectorsLayer.children[0];
            expect(badgeA.classList.contains('is-unpaired')).toBe(true);

            // Camera sync repositions badge in screen space
            scene.camera.x = 10;
            scene.camera.y = 10;
            scene.camera.scale = 4;
            overlay.emitCamera(scene.camera);
            expect(badgeA.style.left).toBe('160.0px');
            expect(badgeA.style.top).toBe('120.0px');

            // 2. Switch to page 1 and place twin 'A'
            scene.addPage(true);
            mgr.syncFromScene();
            expect(overlay.connectorsLayer.children).toHaveLength(0);

            const cA2 = mgr.handlePlaceAt(200, 100);
            expect(cA2.label).toBe('A');
            expect(cA2.pairId).toBe(cA.pairId);
            expect(toolState.connectorMode).toBe('new');
            expect(mgr.getPendingPair()).toBeNull();
            expect(overlay.connectorsLayer.children[0].classList.contains('is-unpaired')).toBe(false);

            // 3. Jump from page 1 twin back to page 0 original -> switches page and adds highlight ring
            const jumped = mgr.jumpToTwin(cA2);
            expect(jumped).toBe(true);
            expect(switchedPages).toHaveLength(1);
            expect(switchedPages[0].pageIndex).toBe(0);
            expect(scene.currentPageIndex).toBe(0);
            const hasRing = overlay.connectorsLayer.children.some((el) => el.classList.contains('board-connector-ring'));
            expect(hasRing).toBe(true);

            // 4. Same-page twin jump calls surface.animateCameraTo
            const cSame1 = mgr.handlePlaceAt(20, 20);
            const cSame2 = mgr.handlePlaceAt(140, 110);
            expect(mgr.jumpToTwin(cSame1)).toBe(true);
            expect(animateCalls).toHaveLength(1);
            expect(animateCalls[0].ms).toBe(220);

            // 5. Undo clears stale pendingPair on syncFromScene
            const cOpen = mgr.handlePlaceAt(30, 30);
            expect(mgr.getPendingPair()?.pairId).toBe(cOpen.pairId);
            history.undo(scene.currentPage);
            mgr.syncFromScene();
            expect(mgr.getPendingPair()).toBeNull();

            // 6. Delete removes connector and pushes connector-remove
            const beforeCount = scene.connectors.length;
            expect(mgr.deleteConnector(cSame2.id)).toBe(true);
            expect(scene.connectors).toHaveLength(beforeCount - 1);

            // 7. Theme update updates CSS custom property
            mgr.setTheme('dark');
            expect(overlay.connectorsLayer.children[0].style.getPropertyValue('--conn-color')).toBeTruthy();

            mgr.destroy();
            expect(overlay.connectorsLayer.children).toHaveLength(0);
        } finally {
            globalThis.document = prevDoc;
        }
    });
});
