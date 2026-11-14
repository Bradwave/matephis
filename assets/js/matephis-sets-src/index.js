/**
 * Matephis Sets Library - Entry Point
 *
 * Exposes window.MatephisSets and auto-renders ```sets blocks on
 * DOMContentLoaded (after MathJax is ready, when the page loads it).
 */
import { MatephisSets } from './core/scene.js';
import { whenMathJaxReady } from '../matephis-plot-src/renderers/mathjax-bridge.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisSets = MatephisSets;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        const start = () => whenMathJaxReady(() => MatephisSets.init());
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisSets;
export { MatephisSets };
