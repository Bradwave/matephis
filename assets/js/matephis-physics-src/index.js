/**
 * Matephis Physics Library - Entry Point
 *
 * Exposes window.MatephisPhysics and auto-renders ```physics blocks on
 * DOMContentLoaded (blocks with TeX once MathJax, loaded on demand, is ready).
 */
import { MatephisPhysics } from './core/scene.js';
import { loadMathJax } from '../matephis-plot-src/renderers/mathjax-bridge.js';
import { lazyEnabled } from '../matephis-plot-src/core/lazy-init.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisPhysics = MatephisPhysics;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        // Lazy: placeholders now, blocks built near the screen (those with TeX once MathJax is ready)
        // (lazy-init.js); window.MATEPHIS_EAGER = true builds them all at once, as before
        const start = () => (lazyEnabled()
            ? MatephisPhysics.init(document, { lazy: true })
            : loadMathJax().then(() => MatephisPhysics.init()));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisPhysics;
export { MatephisPhysics };
