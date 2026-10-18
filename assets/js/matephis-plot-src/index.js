/**
 * Matephis Plot Library - Entry Point
 *
 * Exposes window.MatephisPlot and auto-renders plots on DOMContentLoaded
 * (after MathJax is ready, when the page loads it).
 */
import { MatephisPlot } from './core/plot.js';
import { MatephisPlotGroup } from './core/group.js';

function whenMathJaxReady(cb) {
    if (!document.getElementById('MathJax-script')) { cb(); return; }
    const started = Date.now();
    const check = () => {
        const mj = window.MathJax;
        if (mj && mj.startup && mj.startup.promise) { mj.startup.promise.then(cb, cb); return; }
        if (mj && mj.tex2svg) { cb(); return; }
        // Never block plots forever if MathJax fails to load
        if (Date.now() - started > 8000) { cb(); return; }
        setTimeout(check, 50);
    };
    check();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisPlot = MatephisPlot;
    window.MatephisPlotGroup = MatephisPlotGroup;

    // Hosts that render content themselves (Obsidian) set this before loading
    if (!window.MATEPHIS_NO_AUTO_INIT) {
        const start = () => whenMathJaxReady(() => MatephisPlot.init());
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}

export default MatephisPlot;
export { MatephisPlot, MatephisPlotGroup };
