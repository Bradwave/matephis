/**
 * Matephis Plot Library - Entry Point
 *
 * Exposes window.MatephisPlot and auto-renders plots on DOMContentLoaded
 * (after MathJax is ready, when the page loads it).
 */
import { MatephisPlot } from './core/plot.js';
import { MatephisPlotGroup } from './core/group.js';
import { whenMathJaxReady } from './renderers/mathjax-bridge.js';
import { lazyEnabled } from './core/lazy-init.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisPlot = MatephisPlot;
    window.MatephisPlotGroup = MatephisPlotGroup;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        // Lazy: placeholders now, blocks built near the screen once MathJax is ready
        // (lazy-init.js); window.MATEPHIS_EAGER = true builds them all at once, as before
        const start = () => (lazyEnabled()
            ? MatephisPlot.init(document, { lazy: true })
            : whenMathJaxReady(() => MatephisPlot.init()));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisPlot;
export { MatephisPlot, MatephisPlotGroup };
