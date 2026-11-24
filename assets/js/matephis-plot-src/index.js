/**
 * Matephis Plot Library - Entry Point
 *
 * Exposes window.MatephisPlot and auto-renders plots on DOMContentLoaded
 * (blocks with TeX once MathJax, loaded on demand, is ready).
 */
import { MatephisPlot } from './core/plot.js';
import { MatephisPlotGroup } from './core/group.js';
import { loadMathJax } from './renderers/mathjax-bridge.js';
import { lazyEnabled } from './core/lazy-init.js';
import { SHARED_MODULES } from './shared.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisPlot = MatephisPlot;
    window.MatephisPlotGroup = MatephisPlotGroup;
    // For the physics and sets bundles, which import these instead of carrying copies (shared.js)
    window.MatephisPlotModules = SHARED_MODULES;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        // Lazy: placeholders now, blocks built near the screen (those with TeX once MathJax is ready)
        // (lazy-init.js); window.MATEPHIS_EAGER = true builds them all at once, as before
        const start = () => (lazyEnabled()
            ? MatephisPlot.init(document, { lazy: true })
            : loadMathJax().then(() => MatephisPlot.init()));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisPlot;
export { MatephisPlot, MatephisPlotGroup };
