/**
 * Toggleable Performance & Input Telemetry HUD for school smartboard testing.
 * Displays live FPS, input->paint ms, committed redraw ms, stroke/point counts,
 * estimated JSON KB, exact board file size raw / gzip-compressed, live PointerEvent telemetry (pointerType, width x height,
 * touch count, coalesced count), and a 200-stroke stress test button.
 */

export class PerfHud {
    constructor(hostEl, { scene, onStressTest }) {
        this.hostEl = hostEl;
        this.scene = scene;
        this.onStressTest = onStressTest;

        this.visible = Boolean(scene.settings.showHud);
        this.frameTimes = [];
        this.paintSamples = [];
        this.lastCommittedMs = 0;
        this.lastInput = null;
        this._rafId = null;
        this._lastFrameTs = 0;

        this.el = document.createElement('div');
        this.el.className = 'board-perf-hud';
        this.el.hidden = !this.visible;
        this.el.innerHTML = `
            <div class="board-hud-head">
                <span>DEBUG / LAG HUD</span>
                <button type="button" class="board-hud-stress">+200 tratti</button>
            </div>
            <div class="board-hud-grid">
                <div>FPS: <strong data-hud="fps">--</strong></div>
                <div>Paint: <strong data-hud="paint">--</strong></div>
                <div>Redraw: <strong data-hud="redraw">--</strong></div>
                <div>DPR: <strong data-hud="dpr">--</strong></div>
                <div>Tratti: <strong data-hud="strokes">0</strong></div>
                <div>Punti: <strong data-hud="points">0</strong></div>
                <div>JSON: <strong data-hud="kb">0 KB</strong></div>
                <div>Ptr: <strong data-hud="ptr">--</strong></div>
                <div class="board-hud-wide" title="Intera lavagna (tutte le pagine): JSON salvato / compresso gzip">File: <button type="button" class="board-hud-file-btn">Calcola</button> <strong data-hud="file"></strong></div>
                <div class="board-hud-wide">Area: <strong data-hud="area">--</strong></div>
            </div>
        `;

        this.fields = {};
        for (const el of this.el.querySelectorAll('[data-hud]')) {
            this.fields[el.dataset.hud] = el;
        }

        this.el.querySelector('.board-hud-file-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this._measureFileSize();
        });

        this.el.querySelector('.board-hud-stress').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.onStressTest) this.onStressTest();
        });

        this.hostEl.appendChild(this.el);
        if (this.visible) this._startLoop();
    }

    setVisible(visible) {
        this.visible = Boolean(visible);
        this.el.hidden = !this.visible;
        if (this.visible) {
            this._startLoop();
            this.refreshSceneStats();
        } else {
            this._stopLoop();
        }
    }

    recordCommittedRedraw(ms) {
        this.lastCommittedMs = ms;
        if (this.visible) {
            this.fields.redraw.textContent = `${ms.toFixed(1)} ms`;
        }
    }

    recordTelemetry(info) {
        this.lastInput = info;
        if (typeof info.paintMs === 'number') {
            this.paintSamples.push(info.paintMs);
            if (this.paintSamples.length > 40) this.paintSamples.shift();
        }
        if (!this.visible) return;

        if (this.paintSamples.length > 0) {
            const avg = this.paintSamples.reduce((a, b) => a + b, 0) / this.paintSamples.length;
            this.fields.paint.textContent = `${avg.toFixed(2)} ms`;
        }
        this.fields.ptr.textContent = `${info.pointerType} (×${info.coalescedCount})`;
        const palmTag = info.palmDetected ? ' [PALM]' : '';
        this.fields.area.textContent = `${info.width}×${info.height}px · tocchi:${info.touchCount} · p:${info.pressure}${palmTag}`;
    }

    refreshSceneStats(dpr = window.devicePixelRatio || 1) {
        if (!this.visible) return;
        const strokes = this.scene.strokes.length;
        const points = this.scene.getPointCount();
        // Fast approximate byte size (delta-encoded JSON averages ~5.2 bytes/pt + 48 bytes/stroke)
        const estBytes = strokes * 48 + points * 5.2;
        this.fields.strokes.textContent = String(strokes);
        this.fields.points.textContent = String(points);
        this.fields.kb.textContent = `${(estBytes / 1024).toFixed(1)} KB`;
        this.fields.dpr.textContent = `${dpr}×`;
        // The measured file size is now out of date: dim it until "Calcola" is pressed again.
        this.fields.file.classList.add('is-stale');
    }

    /*
     * Exact size of the whole board file (all pages), raw JSON and gzip-compressed, on demand
     * ("Calcola"). The JSON is built on the main thread (a few ms); compression runs in a
     * worker so it never blocks drawing.
     */

    _getGzipWorker() {
        if (this._gzipWorker !== undefined) return this._gzipWorker;
        this._gzipWorker = null;
        if (typeof Worker !== 'function' || typeof CompressionStream !== 'function') return null;
        try {
            const src = `onmessage = async (e) => {
                try {
                    const s = new Blob([e.data]).stream().pipeThrough(new CompressionStream('gzip'));
                    postMessage((await new Response(s).arrayBuffer()).byteLength);
                } catch (_) { postMessage(-1); }
            };`;
            this._gzipWorker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
        } catch (_) {
            this._gzipWorker = null;
        }
        return this._gzipWorker;
    }

    _measureFileSize() {
        if (!this.visible) return;
        const bytes = new TextEncoder().encode(JSON.stringify(this.scene.toJSON()));
        const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
        const raw = kb(bytes.length);
        this.fields.file.classList.remove('is-stale');
        this.fields.file.textContent = `${raw} · gzip …`;
        const worker = this._getGzipWorker();
        if (!worker) {
            this.fields.file.textContent = `${raw} · gzip n/d`;
            return;
        }
        const rawLen = bytes.length;
        worker.onmessage = (e) => {
            if (!this.visible) return;
            const gz = e.data;
            this.fields.file.textContent = gz > 0
                ? `${raw} · gzip ${kb(gz)} (÷${(rawLen / gz).toFixed(1)})`
                : `${raw} · gzip n/d`;
        };
        worker.postMessage(bytes.buffer, [bytes.buffer]);
    }

    _startLoop() {
        if (this._rafId) return;
        this._lastFrameTs = performance.now();
        let lastLabelUpdate = 0;

        const tick = (now) => {
            if (!this.visible) {
                this._rafId = null;
                return;
            }
            const dt = now - this._lastFrameTs;
            this._lastFrameTs = now;
            if (dt > 0 && dt < 500) {
                this.frameTimes.push(dt);
                if (this.frameTimes.length > 30) this.frameTimes.shift();
            }
            if (now - lastLabelUpdate > 250 && this.frameTimes.length > 0) {
                lastLabelUpdate = now;
                const avgDt = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
                this.fields.fps.textContent = `${Math.round(1000 / avgDt)}`;
            }
            this._rafId = requestAnimationFrame(tick);
        };
        this._rafId = requestAnimationFrame(tick);
    }

    _stopLoop() {
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }
}
