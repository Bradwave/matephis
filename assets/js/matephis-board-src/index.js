/**
 * Matephis Board (/board/) — Entry point.
 */

import { HistoryStack } from './ink/history.js';
import { InkSurface } from './ink/surface.js';
import { InputController } from './ink/input.js';
import { BoardScene } from './model/scene.js';
import { BoardStorage } from './model/storage.js';
import { BoardToolbar } from './ui/toolbar.js';
import { OptionsMenu } from './ui/options.js';
import { FutureMenus } from './ui/future-menus.js';
import { PinnedStrip } from './ui/pinned-strip.js';
import { PerfHud } from './ui/perf-hud.js';
import { QuickMenu } from './ui/quick-menu.js';
import { BoardOverlay } from './ui/overlay.js';
import { EngineLoader } from './ui/engine-loader.js';
import { ConnectorManager } from './ui/connectors.js';

async function initMatephisBoard() {
    const root = document.getElementById('matephis-board');
    if (!root) return;

    const canvasHost = root.querySelector('.board-stage');
    const storage = new BoardStorage();
    const savedSettings = storage.loadSettings();

    const rect = canvasHost.getBoundingClientRect();
    const scene = new BoardScene(rect.width || window.innerWidth, rect.height || window.innerHeight, savedSettings);

    // Independent Undo/Redo history per page
    const pageHistories = new Map();
    const getCurrentHistory = () => {
        const pid = scene.currentPage.id;
        if (!pageHistories.has(pid)) {
            pageHistories.set(pid, new HistoryStack(150));
        }
        return pageHistories.get(pid);
    };
    const historyProxy = {
        get canUndo() { return getCurrentHistory().canUndo; },
        get canRedo() { return getCurrentHistory().canRedo; },
        push(cmd) { getCurrentHistory().push(cmd); },
        undo(target = scene.currentPage) { return getCurrentHistory().undo(target); },
        redo(target = scene.currentPage) { return getCurrentHistory().redo(target); },
        clearAll() { pageHistories.clear(); },
    };

    const getTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    const overlay = new BoardOverlay(canvasHost);
    const engineLoader = new EngineLoader();

    let perfHud = null;
    let pinnedStrip = null;
    let toolbar = null;
    let optionsMenu = null;
    let futureMenus = null;
    let quickMenu = null;
    let connectorManager = null;
    let lastDismissAt = 0;

    const applyTheme = (nextTheme) => {
        const theme = nextTheme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('matephis_theme', theme); } catch (_) { /* ignore */ }
        window.dispatchEvent(new CustomEvent('matephis-theme-change', { detail: { theme } }));
        surface.setTheme(theme);
        if (connectorManager) connectorManager.setTheme(theme);
        if (pinnedStrip) pinnedStrip.render();
        if (toolbar) toolbar.render();
        if (optionsMenu) optionsMenu.syncFromState();
    };

    const syncUI = () => {
        if (toolbar) {
            toolbar.setHistoryState(historyProxy.canUndo, historyProxy.canRedo);
            toolbar.setPageState(scene.currentPageIndex, scene.pageCount);
            toolbar.updateFootprint(scene.getFootprint());
            toolbar.updateZoom(scene.camera);
            toolbar.setOverviewActive(surface.overviewMode);
        }
        if (optionsMenu) optionsMenu.syncFromState();
        if (perfHud) perfHud.refreshSceneStats(surface.dpr);
    };

    const switchToPage = (targetIndex, targetCamera = null) => {
        if (surface.overviewMode) {
            surface.overviewMode = false;
            surface.savedCamera = null;
            overlay.setOverviewMode(false);
        }
        const changed = scene.goToPage(targetIndex);
        if (targetCamera) {
            scene.camera.x = targetCamera.x;
            scene.camera.y = targetCamera.y;
            scene.camera.scale = targetCamera.scale;
        }
        if (changed || targetCamera) {
            surface.renderCommittedNow();
            surface.renderActiveNow();
            if (connectorManager) connectorManager.syncFromScene();
            if (pinnedStrip) pinnedStrip.render();
            syncUI();
            storage.scheduleSave(scene, 400);
            engineLoader.ensureForPage(scene.currentPage);
        }
    };

    const surface = new InkSurface(canvasHost, {
        scene,
        overlay,
        onPerfSample: ({ committedRedrawMs }) => {
            if (perfHud) perfHud.recordCommittedRedraw(committedRedrawMs);
        },
        onCameraChange: (cam) => {
            if (toolbar) toolbar.updateZoom(cam);
            storage.scheduleSave(scene, 500);
        },
    });

    perfHud = new PerfHud(root, {
        scene,
        onStressTest: () => {
            const batch = scene.generateStressStrokes(200);
            for (const s of batch) scene.strokes.push(s);
            historyProxy.push({ type: 'batch-add', strokes: batch });
            surface.renderCommittedNow();
            if (pinnedStrip) pinnedStrip.syncIfShowingPage(scene.currentPage.id);
            syncUI();
            storage.scheduleSave(scene);
        },
    });

    pinnedStrip = new PinnedStrip(root, {
        surface,
        scene,
        onJumpToPage: (pageIndex, targetCam) => {
            if (pageIndex !== scene.currentPageIndex) {
                switchToPage(pageIndex, targetCam);
            } else {
                surface.animateCameraTo(targetCam, 180);
            }
        },
    });

    optionsMenu = new OptionsMenu(root, {
        scene,
        getTheme,
        onToggleTheme: (nextTheme) => applyTheme(nextTheme),
        onSettingChange: (key, value) => {
            storage.saveSettings(scene.settings);
            if (key === 'showCropMarks') {
                surface.requestCommittedRedraw();
                pinnedStrip.render();
            }
            if (key === 'lowDpr') {
                surface.resize();
                pinnedStrip.render();
                perfHud.refreshSceneStats(surface.dpr);
            }
            if (key === 'showHud') {
                perfHud.setVisible(value);
                perfHud.refreshSceneStats(surface.dpr);
            }
            if (key === 'uiSize' || key === 'toolbarLayout' || key === 'toolbarSide' || key === 'toolbarMinimal') {
                if (toolbar) toolbar.relayout();
            }
        },
        onPageBackgroundChange: () => {
            surface.requestCommittedRedraw();
            pinnedStrip.syncIfShowingPage(scene.currentPage.id);
            storage.scheduleSave(scene);
        },
        onExportJSON: () => storage.exportJSONFile(scene),
        onImportJSON: (data) => {
            if (scene.loadJSON(data)) {
                historyProxy.clearAll();
                pinnedStrip.close();
                surface.renderCommittedNow();
                if (connectorManager) connectorManager.syncFromScene();
                syncUI();
                storage.saveBoardNow(scene);
                engineLoader.ensureForPage(scene.currentPage);
            }
        },
        onClearBoard: () => {
            if (scene.isPageEmpty()) return;
            const prevStrokes = scene.strokes.slice();
            const prevWidgets = scene.widgets.slice();
            const prevConnectors = scene.connectors.slice();
            scene.strokes.length = 0;
            scene.widgets.length = 0;
            scene.connectors.length = 0;
            historyProxy.push({
                type: 'clear',
                strokes: prevStrokes,
                widgets: prevWidgets,
                connectors: prevConnectors,
            });
            surface.renderCommittedNow();
            if (connectorManager) connectorManager.syncFromScene();
            pinnedStrip.syncIfShowingPage(scene.currentPage.id);
            syncUI();
            storage.scheduleSave(scene);
        },
        onDeletePage: () => {
            const deletedId = scene.currentPage.id;
            if (scene.deleteCurrentPage()) {
                pageHistories.delete(deletedId);
                if (surface.overviewMode) {
                    surface.overviewMode = false;
                    surface.savedCamera = null;
                    overlay.setOverviewMode(false);
                }
                surface.renderCommittedNow();
                if (connectorManager) connectorManager.syncFromScene();
                pinnedStrip.render();
                syncUI();
                storage.saveBoardNow(scene);
            }
        },
    });

    futureMenus = new FutureMenus(root);

    connectorManager = new ConnectorManager({
        scene,
        history: historyProxy,
        overlay,
        surface,
        getTheme,
        getToolState: () => (toolbar ? toolbar.getToolState() : {}),
        onSwitchToPage: (pageIndex, targetCam) => switchToPage(pageIndex, targetCam),
        onSceneMutated: () => {
            pinnedStrip.syncIfShowingPage(scene.currentPage.id);
            syncUI();
            storage.scheduleSave(scene);
        },
        onStateChange: ({ mode, pendingPair, openConnectors, activateTool }) => {
            if (toolbar) {
                toolbar.setConnectorState({ mode, pendingPair, openConnectors, activateTool });
            }
        },
    });

    toolbar = new BoardToolbar(root, {
        getTheme,
        getSettings: () => scene.settings,
        onSettingChange: (key, value) => {
            scene.settings[key] = value;
            storage.saveSettings(scene.settings);
            optionsMenu.syncFromState();
        },
        onToolChange: (state) => {
            if (state.tool === 'connector' && state.connectorMode === 'new' && connectorManager) {
                connectorManager.clearPending();
            }
        },
        onSelectOpenConnector: (pair) => {
            if (connectorManager) connectorManager.armPair(pair, { activateTool: true });
        },
        onUndo: () => {
            if (historyProxy.undo(scene.currentPage)) {
                surface.renderCommittedNow();
                if (connectorManager) connectorManager.syncFromScene();
                pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                syncUI();
                storage.scheduleSave(scene);
            }
        },
        onRedo: () => {
            if (historyProxy.redo(scene.currentPage)) {
                surface.renderCommittedNow();
                if (connectorManager) connectorManager.syncFromScene();
                pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                syncUI();
                storage.scheduleSave(scene);
            }
        },
        onPinTop: () => pinnedStrip.pinAndContinue('top'),
        onPinLeft: () => pinnedStrip.pinAndContinue('left'),
        onToggleOverview: () => {
            surface.toggleOverview();
            syncUI();
        },
        onToggleOptions: (force) => {
            if (force === false) {
                if (optionsMenu.open) {
                    optionsMenu.hide();
                    toolbar.anchorPopover(null);
                }
            } else {
                futureMenus.hideAll();
                toolbar.setActiveFuturePopover(null);
                optionsMenu.toggle();
                toolbar.anchorPopover(optionsMenu.open ? optionsMenu.el : null, 'options');
            }
        },
        onToggleFuturePopover: (name) => {
            if (optionsMenu.open) {
                optionsMenu.hide();
                toolbar.anchorPopover(null);
            }
            if (!name) {
                if (futureMenus.activePopover) {
                    futureMenus.hideAll();
                    toolbar.anchorPopover(null);
                }
                toolbar.setActiveFuturePopover(null);
            } else {
                const opened = futureMenus.toggle(name);
                toolbar.setActiveFuturePopover(opened);
                toolbar.anchorPopover(opened ? futureMenus.popovers[opened] : null, opened);
            }
        },
        onResetZoom: () => {
            const baseScale = scene.camera.baseScale;
            const centerWx = scene.camera.x + (surface.width / scene.camera.scale) * 0.5;
            const centerWy = scene.camera.y + (surface.height / scene.camera.scale) * 0.5;
            surface.animateCameraTo({
                scale: baseScale,
                x: centerWx - (surface.width / baseScale) * 0.5,
                y: centerWy - (surface.height / baseScale) * 0.5,
            }, 180);
        },
        onPrevPage: () => switchToPage(scene.currentPageIndex - 1),
        onNextPage: () => switchToPage(scene.currentPageIndex + 1),
        onAddPage: () => {
            if (surface.overviewMode) {
                surface.overviewMode = false;
                surface.savedCamera = null;
                overlay.setOverviewMode(false);
            }
            scene.addPage(true);
            surface.renderCommittedNow();
            surface.renderActiveNow();
            if (connectorManager) connectorManager.syncFromScene();
            pinnedStrip.render();
            syncUI();
            storage.saveBoardNow(scene);
        },
    });

    quickMenu = new QuickMenu(root, {
        toolbar,
        getTheme,
        onUndo: () => toolbar.onUndo && toolbar.onUndo(),
    });

    new InputController(surface, {
        scene,
        history: historyProxy,
        overlay,
        getToolState: () => toolbar.getToolState(),
        onCanvasTouch: () => {
            const hadPopover = Boolean(optionsMenu.open || futureMenus.activePopover || quickMenu.isOpen);
            quickMenu.hide();
            toolbar.closeTrays();
            optionsMenu.hide();
            futureMenus.hideAll();
            toolbar.setActiveFuturePopover(null);
            toolbar.anchorPopover(null);
            if (connectorManager) connectorManager.clearSelection();
            // The second finger of a two-finger tap that closed a menu must not draw either.
            const now = performance.now();
            if (hadPopover) lastDismissAt = now;
            return hadPopover || now - lastDismissAt < 200;
        },
        onConnectorPlace: (wx, wy) => {
            if (connectorManager) connectorManager.handlePlaceAt(wx, wy);
        },
        onSceneMutated: () => {
            pinnedStrip.syncIfShowingPage(scene.currentPage.id);
            syncUI();
            storage.scheduleSave(scene);
        },
        onCameraChange: (cam) => {
            toolbar.updateZoom(cam);
            storage.scheduleSave(scene, 500);
        },
        onOverviewPick: () => syncUI(),
        onTelemetry: (info) => perfHud.recordTelemetry(info),
        onTwoFingerTap: (x, y) => {
            toolbar.closeTrays();
            optionsMenu.hide();
            futureMenus.hideAll();
            toolbar.setActiveFuturePopover(null);
            toolbar.anchorPopover(null);
            quickMenu.open(x, y);
        },
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        const mod = e.metaKey || e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                if (historyProxy.redo(scene.currentPage)) {
                    surface.renderCommittedNow();
                    if (connectorManager) connectorManager.syncFromScene();
                    pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                    syncUI();
                    storage.scheduleSave(scene);
                }
            } else if (historyProxy.undo(scene.currentPage)) {
                surface.renderCommittedNow();
                if (connectorManager) connectorManager.syncFromScene();
                pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                syncUI();
                storage.scheduleSave(scene);
            }
            return;
        }
        if (mod && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (historyProxy.redo(scene.currentPage)) {
                surface.renderCommittedNow();
                if (connectorManager) connectorManager.syncFromScene();
                pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                syncUI();
                storage.scheduleSave(scene);
            }
            return;
        }
        if (mod) return;

        if (e.key === 'PageUp' || (e.altKey && e.key === 'ArrowLeft')) {
            e.preventDefault();
            switchToPage(scene.currentPageIndex - 1);
            return;
        }
        if (e.key === 'PageDown' || (e.altKey && e.key === 'ArrowRight')) {
            e.preventDefault();
            switchToPage(scene.currentPageIndex + 1);
            return;
        }

        switch (e.key.toLowerCase()) {
            case 'p': toolbar.selectTool('pen'); break;
            case 'e': toolbar.selectTool('eraser', true); break;
            case 'h': toolbar.selectTool('highlighter'); break;
            case 'l': toolbar.selectTool('laser'); break;
            case 'o':
                surface.toggleOverview();
                syncUI();
                break;
            case 'escape':
                toolbar.closeTrays();
                optionsMenu.hide();
                futureMenus.hideAll();
                toolbar.setActiveFuturePopover(null);
                toolbar.anchorPopover(null);
                if (connectorManager) connectorManager.clearSelection();
                if (surface.overviewMode) {
                    surface.exitOverview();
                    syncUI();
                }
                break;
        }
    });

    // Resize & lifecycle autosave
    const ro = new ResizeObserver(() => {
        surface.resize();
        pinnedStrip.render();
        toolbar.updateZoom(scene.camera);
        toolbar.relayout();
        perfHud.refreshSceneStats(surface.dpr);
    });
    ro.observe(canvasHost);

    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') storage.saveBoardNow(scene);
    });
    window.addEventListener('pagehide', () => storage.saveBoardNow(scene));

    // Restore persisted board from IndexedDB if available
    const saved = await storage.loadBoard();
    if (saved) {
        scene.loadJSON(saved);
        surface.renderCommittedNow();
        engineLoader.ensureForPage(scene.currentPage);
    }
    if (connectorManager) connectorManager.syncFromScene();
    syncUI();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatephisBoard);
} else {
    initMatephisBoard();
}
