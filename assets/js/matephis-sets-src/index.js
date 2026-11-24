/**
 * Matephis Sets Library - Entry Point
 *
 * Exposes window.MatephisSets and auto-renders ```sets blocks on
 * DOMContentLoaded (blocks with TeX once MathJax, loaded on demand, is ready).
 */
import { MatephisSets } from './core/scene.js';
import { loadMathJax } from '../matephis-plot-src/renderers/mathjax-bridge.js';
import { lazyEnabled } from '../matephis-plot-src/core/lazy-init.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisSets = MatephisSets;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        // Lazy: placeholders now, blocks built near the screen (those with TeX once MathJax is ready)
        // (lazy-init.js); window.MATEPHIS_EAGER = true builds them all at once, as before
        const start = () => (lazyEnabled()
            ? MatephisSets.init(document, { lazy: true })
            : loadMathJax().then(() => MatephisSets.init()));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisSets;
export { MatephisSets };
