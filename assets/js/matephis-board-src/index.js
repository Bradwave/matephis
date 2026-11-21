/**
 * Matephis Board (/board/) — Phase 1 entry point.
 */

import { HistoryStack } from './ink/history.js';
import { InkSurface } from './ink/surface.js';
import { InputController } from './ink/input.js';
import { BoardScene } from './model/scene.js';
import { BoardStorage } from './model/storage.js';
import { BoardToolbar } from './ui/toolbar.js';
import { OptionsMenu } from './ui/options.js';
import { PinnedStrip } from './ui/pinned-strip.js';
import { PerfHud } from './ui/perf-hud.js';

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
        undo(strokes) { return getCurrentHistory().undo(strokes); },
        redo(strokes) { return getCurrentHistory().redo(strokes); },
        clearAll() { pageHistories.clear(); },
    };

    const getTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    let perfHud = null;
    let pinnedStrip = null;
    let toolbar = null;
    let optionsMenu = null;

    const applyTheme = (nextTheme) => {
        const theme = nextTheme === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('matephis_theme', theme); } catch (_) { /* ignore */ }
        window.dispatchEvent(new CustomEvent('matephis-theme-change', { detail: { theme } }));
        surface.setTheme(theme);
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
            if (pinnedStrip) pinnedStrip.render();
            syncUI();
            storage.scheduleSave(scene, 400);
        }
    };

    const surface = new InkSurface(canvasHost, {
        scene,
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
        },
        onExportJSON: () => storage.exportJSONFile(scene),
        onImportJSON: (data) => {
            if (scene.loadJSON(data)) {
                historyProxy.clearAll();
                pinnedStrip.close();
                surface.renderCommittedNow();
                syncUI();
                storage.saveBoardNow(scene);
            }
        },
        onClearBoard: () => {
            if (scene.strokes.length === 0) return;
            const prev = scene.strokes.slice();
            scene.strokes.length = 0;
            historyProxy.push({ type: 'clear', strokes: prev });
            surface.renderCommittedNow();
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
                }
                surface.renderCommittedNow();
                pinnedStrip.render();
                syncUI();
                storage.saveBoardNow(scene);
            }
        },
    });

    toolbar = new BoardToolbar(root, {
        getTheme,
        onToolChange: () => { /* input reads state on demand */ },
        onUndo: () => {
            if (historyProxy.undo(scene.strokes)) {
                surface.renderCommittedNow();
                pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                syncUI();
                storage.scheduleSave(scene);
            }
        },
        onRedo: () => {
            if (historyProxy.redo(scene.strokes)) {
                surface.renderCommittedNow();
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
        onToggleTheme: (nextTheme) => applyTheme(nextTheme),
        onToggleOptions: (force) => {
            if (force === false) optionsMenu.hide();
            else optionsMenu.toggle();
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
            }
            scene.addPage(true);
            surface.renderCommittedNow();
            surface.renderActiveNow();
            pinnedStrip.render();
            syncUI();
            storage.saveBoardNow(scene);
        },
    });

    new InputController(surface, {
        scene,
        history: historyProxy,
        getToolState: () => toolbar.getToolState(),
        onCanvasTouch: () => {
            toolbar.closeTrays();
            optionsMenu.hide();
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
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        const mod = e.metaKey || e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                if (historyProxy.redo(scene.strokes)) {
                    surface.renderCommittedNow();
                    pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                    syncUI();
                    storage.scheduleSave(scene);
                }
            } else if (historyProxy.undo(scene.strokes)) {
                surface.renderCommittedNow();
                pinnedStrip.syncIfShowingPage(scene.currentPage.id);
                syncUI();
                storage.scheduleSave(scene);
            }
            return;
        }
        if (mod && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (historyProxy.redo(scene.strokes)) {
                surface.renderCommittedNow();
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
    }
    syncUI();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMatephisBoard);
} else {
    initMatephisBoard();
}
