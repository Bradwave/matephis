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
    const history = new HistoryStack(150);

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
        if (pinnedStrip) pinnedStrip.rerenderForTheme();
        if (toolbar) toolbar.render();
        if (optionsMenu) optionsMenu.syncFromState();
    };

    const syncUI = () => {
        if (toolbar) {
            toolbar.setHistoryState(history.canUndo, history.canRedo);
            toolbar.updateFootprint(scene.getFootprint());
            toolbar.updateZoom(scene.camera);
            toolbar.setOverviewActive(surface.overviewMode);
        }
        if (perfHud) perfHud.refreshSceneStats(surface.dpr);
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
            history.push({ type: 'batch-add', strokes: batch });
            surface.renderCommittedNow();
            syncUI();
            storage.scheduleSave(scene);
        },
    });

    pinnedStrip = new PinnedStrip(root, {
        surface,
        scene,
        onCameraChange: (cam) => { if (toolbar) toolbar.updateZoom(cam); },
    });

    optionsMenu = new OptionsMenu(root, {
        scene,
        getTheme,
        onToggleTheme: (nextTheme) => applyTheme(nextTheme),
        onSettingChange: (key, value) => {
            storage.saveSettings(scene.settings);
            if (key === 'showCropMarks') surface.requestCommittedRedraw();
            if (key === 'lowDpr') {
                surface.resize();
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
                history.clear();
                surface.renderCommittedNow();
                syncUI();
                storage.saveBoardNow(scene);
            }
        },
        onClearBoard: () => {
            if (scene.strokes.length === 0) return;
            const prev = scene.strokes.slice();
            scene.strokes.length = 0;
            history.push({ type: 'clear', strokes: prev });
            surface.renderCommittedNow();
            syncUI();
            storage.scheduleSave(scene);
        },
    });

    toolbar = new BoardToolbar(root, {
        getTheme,
        onToolChange: () => { /* input reads state on demand */ },
        onUndo: () => {
            if (history.undo(scene.strokes)) {
                surface.renderCommittedNow();
                syncUI();
                storage.scheduleSave(scene);
            }
        },
        onRedo: () => {
            if (history.redo(scene.strokes)) {
                surface.renderCommittedNow();
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
    });

    new InputController(surface, {
        scene,
        history,
        getToolState: () => toolbar.getToolState(),
        onCanvasTouch: () => {
            toolbar.closeTrays();
            optionsMenu.hide();
        },
        onSceneMutated: () => {
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
                if (history.redo(scene.strokes)) {
                    surface.renderCommittedNow();
                    syncUI();
                    storage.scheduleSave(scene);
                }
            } else if (history.undo(scene.strokes)) {
                surface.renderCommittedNow();
                syncUI();
                storage.scheduleSave(scene);
            }
            return;
        }
        if (mod && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (history.redo(scene.strokes)) {
                surface.renderCommittedNow();
                syncUI();
                storage.scheduleSave(scene);
            }
            return;
        }
        if (mod) return;

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
