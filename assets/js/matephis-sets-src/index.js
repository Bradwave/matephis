/**
 * Matephis Sets Library - Entry Point
 *
 * Exposes window.MatephisSets and auto-renders ```sets blocks on
 * DOMContentLoaded (after MathJax is ready, when the page loads it).
 */
import { MatephisSets } from './core/scene.js';
import { whenMathJaxReady } from '../matephis-plot-src/renderers/mathjax-bridge.js';
import { lazyEnabled } from '../matephis-plot-src/core/lazy-init.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisSets = MatephisSets;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        // Lazy: placeholders now, blocks built near the screen once MathJax is ready
        // (lazy-init.js); window.MATEPHIS_EAGER = true builds them all at once, as before
        const start = () => (lazyEnabled()
            ? MatephisSets.init(document, { lazy: true })
            : whenMathJaxReady(() => MatephisSets.init()));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisSets;
export { MatephisSets };
