/**
 * Matephis Physics Library - Entry Point
 *
 * Exposes window.MatephisPhysics and auto-renders ```physics blocks on
 * DOMContentLoaded (after MathJax is ready, when the page loads it).
 */
import { MatephisPhysics } from './core/scene.js';
import { whenMathJaxReady } from '../matephis-plot-src/renderers/mathjax-bridge.js';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisPhysics = MatephisPhysics;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        const start = () => whenMathJaxReady(() => MatephisPhysics.init());
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisPhysics;
export { MatephisPhysics };
