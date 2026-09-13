/**
 * Matephis Plot Library - Entry Point
 */
import { MatephisPlot } from './core/plot.js';

// Auto-initialize on DOM ready
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.MatephisPlot = MatephisPlot;

    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById('MathJax-script')) {
            const checkMathJax = () => {
                if (window.MathJax && (window.MathJax.tex2svg || (window.MathJax.startup && window.MathJax.startup.promise))) {
                    if (window.MathJax.startup && window.MathJax.startup.promise) {
                        window.MathJax.startup.promise.then(() => MatephisPlot.init());
                    } else {
                        MatephisPlot.init();
                    }
                } else {
                    setTimeout(checkMathJax, 50);
                }
            };
            checkMathJax();
        } else {
            MatephisPlot.init();
        }
    });
}

export default MatephisPlot;
export { MatephisPlot };
