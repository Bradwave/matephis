/**
 * UI shell popovers for planned Phase 2 & Phase 4 features:
 * - Quick Cartesian Axes / Matephis Plot
 * - Matephis Diagrams (physics / sets / circuit / future LaTeX text)
 * - Exercise Picker (search + topic/section browse)
 * - Cloud Session & QR Sync (Cloudflare Worker + R2)
 *
 * All unimplemented action buttons carry `.is-stub` (semi-transparent) so the
 * full UI surface can be styled and reviewed before wiring backend/engine logic.
 */

import { BoardIcons } from './icons.js';

export class FutureMenus {
    constructor(hostEl) {
        this.hostEl = hostEl;
        this.activePopover = null; // null | 'plot' | 'diagrams' | 'exercises' | 'cloud'
        this.popovers = {
            plot: this._buildPlotPopover(),
            diagrams: this._buildDiagramsPopover(),
            exercises: this._buildExercisesPopover(),
            cloud: this._buildCloudPopover(),
        };

        for (const el of Object.values(this.popovers)) {
            el.addEventListener('pointerdown', (e) => e.stopPropagation());
            this.hostEl.appendChild(el);
        }
    }

    toggle(name) {
        if (this.activePopover === name) {
            this.hideAll();
            return null;
        }
        this.show(name);
        return name;
    }

    show(name) {
        this.activePopover = this.popovers[name] ? name : null;
        for (const [key, el] of Object.entries(this.popovers)) {
            el.hidden = key !== this.activePopover;
        }
    }

    hideAll() {
        this.activePopover = null;
        for (const el of Object.values(this.popovers)) {
            el.hidden = true;
        }
    }

    _buildPlotPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-plot-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Assi cartesiani e grafici</span>
                <span class="board-stub-tag">Anteprima UI</span>
            </div>
            <div class="board-tab-row">
                <button type="button" class="board-tab-btn active is-stub">Assi rapidi</button>
                <button type="button" class="board-tab-btn is-stub">Funzioni / JSON</button>
            </div>
            <div class="board-limits-grid">
                <label class="board-field">
                    <span>x min</span>
                    <input type="text" value="-5" readonly class="is-stub" />
                </label>
                <label class="board-field">
                    <span>x max</span>
                    <input type="text" value="5" readonly class="is-stub" />
                </label>
                <label class="board-field">
                    <span>y min</span>
                    <input type="text" value="-4" readonly class="is-stub" />
                </label>
                <label class="board-field">
                    <span>y max</span>
                    <input type="text" value="4" readonly class="is-stub" />
                </label>
            </div>
            <label class="board-field board-field-full">
                <span>Funzione (opzionale)</span>
                <input type="text" placeholder="es. sin(x), x^2 - 2x" readonly class="is-stub" />
            </label>
            <div class="board-popover-footer">
                <button type="button" class="board-action-btn board-action-primary is-stub">
                    ${BoardIcons.axes}<span>Inserisci assi</span>
                </button>
            </div>
        `;
        return el;
    }

    _buildDiagramsPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-diagrams-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Blocchi Matephis</span>
                <span class="board-stub-tag">Anteprima UI</span>
            </div>
            <div class="board-engine-grid">
                <button type="button" class="board-engine-card is-stub">
                    <strong>Fisica</strong>
                    <span>matephis-physics</span>
                </button>
                <button type="button" class="board-engine-card is-stub">
                    <strong>Insiemi</strong>
                    <span>matephis-sets</span>
                </button>
                <button type="button" class="board-engine-card is-stub">
                    <strong>Circuiti</strong>
                    <span>matephis-circuit</span>
                </button>
                <button type="button" class="board-engine-card is-stub">
                    <strong>Testo / LaTeX</strong>
                    <span>nota o formula</span>
                </button>
            </div>
            <div class="board-chip-section">
                <div class="board-micro-label">Preset rapidi</div>
                <div class="board-chip-row">
                    <button type="button" class="board-chip is-stub">Piano inclinato</button>
                    <button type="button" class="board-chip is-stub">Forze</button>
                    <button type="button" class="board-chip is-stub">Circuito RC</button>
                    <button type="button" class="board-chip is-stub">Venn</button>
                </div>
            </div>
        `;
        return el;
    }

    _buildExercisesPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-sheet board-exercises-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Inserisci esercizio</span>
                <span class="board-stub-tag">Anteprima UI</span>
            </div>
            <div class="board-search-box is-stub">
                ${BoardIcons.search}
                <input type="text" placeholder="dinamica quesiti 4 · limiti 2.7 · parole..." readonly />
            </div>
            <div class="board-chip-section">
                <div class="board-micro-label">Argomento</div>
                <div class="board-chip-row">
                    <button type="button" class="board-chip is-stub">Dinamica</button>
                    <button type="button" class="board-chip is-stub">Limiti</button>
                    <button type="button" class="board-chip is-stub">Elettrostatica</button>
                    <button type="button" class="board-chip is-stub">Onde</button>
                    <button type="button" class="board-chip is-stub">Ottica</button>
                </div>
            </div>
            <div class="board-chip-section">
                <div class="board-micro-label">Sezione</div>
                <div class="board-chip-row">
                    <button type="button" class="board-chip is-stub">Quesiti</button>
                    <button type="button" class="board-chip is-stub">Quiz</button>
                    <button type="button" class="board-chip is-stub">Problemi</button>
                </div>
            </div>
            <div class="board-ex-preview is-stub">
                <div class="board-ex-preview-meta">Dinamica · Quesiti #4</div>
                <div class="board-ex-preview-body">Anteprima testo esercizio con MathJax e soluzione nascosta…</div>
            </div>
            <div class="board-popover-footer">
                <label class="board-inline-check is-stub">
                    <input type="checkbox" checked disabled />
                    <span>Nascondi soluzione</span>
                </label>
                <button type="button" class="board-action-btn board-action-primary is-stub">
                    ${BoardIcons.add}<span>Inserisci</span>
                </button>
            </div>
        `;
        return el;
    }

    _buildCloudPopover() {
        const el = document.createElement('div');
        el.className = 'board-popover board-cloud-popover';
        el.hidden = true;
        el.innerHTML = `
            <div class="board-popover-title">
                <span>Sessione cloud</span>
                <span class="board-cloud-status">Locale</span>
            </div>
            <div class="board-qr-box is-stub">
                <div class="board-qr-icon">${BoardIcons.qr}</div>
                <div class="board-qr-meta">
                    <strong>Associa da smartphone</strong>
                    <span>Scansiona il QR per autorizzare il salvataggio automatico su R2 (2h).</span>
                    <span class="board-qr-code">Codice: ----</span>
                </div>
            </div>
            <div class="board-options-actions">
                <button type="button" class="board-action-btn board-action-primary is-stub">
                    ${BoardIcons.cloud}<span>Avvia sessione</span>
                </button>
                <button type="button" class="board-action-btn is-stub">
                    ${BoardIcons.upload}<span>Carica passata</span>
                </button>
                <button type="button" class="board-action-btn is-stub">
                    ${BoardIcons.jump}<span>Archivio PC</span>
                </button>
                <button type="button" class="board-action-btn is-stub">
                    ${BoardIcons.qr}<span>Condividi</span>
                </button>
                <button type="button" class="board-action-btn is-danger is-stub board-action-full">
                    ${BoardIcons.close}<span>Termina sessione</span>
                </button>
            </div>
        `;
        return el;
    }
}
