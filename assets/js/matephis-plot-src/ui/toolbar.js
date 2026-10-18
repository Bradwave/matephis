/**
 * Toolbar buttons for Matephis Plot
 */
import { MatephisIcons } from './icons.js';

export { MatephisIcons };

/**
 * Creates a toolbar button.
 * @param {string} icon - icon name from MatephisIcons, or raw "<svg ...>" markup
 * @param {string} title - tooltip and accessible label
 * @param {(e: MouseEvent) => void} onClick
 * @param {object} [opts]
 * @param {boolean} [opts.toggle] - exposes aria-pressed for on/off buttons
 */
export function createButton(icon, title, onClick, opts = {}) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "matephis-plot-btn";
    b.title = title;
    b.setAttribute("aria-label", title);
    if (opts.toggle) b.setAttribute("aria-pressed", "false");

    const markup = MatephisIcons[icon] || (typeof icon === 'string' && icon.trim().startsWith('<svg') ? icon : null);
    if (markup) {
        b.innerHTML = markup;
        const svg = b.querySelector("svg");
        if (svg) svg.setAttribute("aria-hidden", "true");
    } else {
        b.textContent = title.charAt(0);
    }

    b.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick(e);
    });
    return b;
}

/** Sets the visual and accessible "pressed" state of a toggle button. */
export function setActive(button, active) {
    if (!button) return;
    button.classList.toggle('active', !!active);
    if (button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', active ? 'true' : 'false');
}

export function createSeparator() {
    const sep = document.createElement("div");
    sep.className = "matephis-plot-separator";
    sep.setAttribute("role", "separator");
    return sep;
}
