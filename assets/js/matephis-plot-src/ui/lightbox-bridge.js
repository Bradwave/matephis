/**
 * Lightbox Bridge with Reparenting to Preserve Dynamic Interactions
 */

export class LightboxBridge {
    constructor(plot) {
        this.plot = plot;
        this.isOpen = false;
        this.placeholder = null;
        this.originalParent = null;
        this.originalWidth = null;
        this.originalHeight = null;
    }

    open() {
        const lb = document.getElementById('lightbox');
        const img = document.getElementById('lightbox-img');
        const svgContainer = document.getElementById('lightbox-svg');
        const caption = document.getElementById('lightbox-caption');

        if (!lb || !svgContainer) return;

        this.isOpen = true;
        this.originalParent = this.plot.wrapper.parentNode;
        this.placeholder = document.createComment("matephis-plot-placeholder");
        this.originalParent.insertBefore(this.placeholder, this.plot.wrapper);

        this.originalWidth = this.plot.wrapper.style.width;
        this.originalMaxWidth = this.plot.wrapper.style.maxWidth;

        // Setup container
        svgContainer.innerHTML = "";
        if (img) img.style.display = "none";
        svgContainer.style.display = "flex";
        svgContainer.style.flexDirection = "column";
        svgContainer.style.alignItems = "center";
        svgContainer.style.justifyContent = "center";
        svgContainer.style.width = "auto";
        svgContainer.style.height = "auto";
        svgContainer.style.maxWidth = "95vw";
        svgContainer.style.maxHeight = "90vh";
        svgContainer.style.overflow = "auto";
        svgContainer.style.padding = "10px";

        // Move active wrapper into lightbox
        svgContainer.appendChild(this.plot.wrapper);
        this.plot.wrapper.classList.add('matephis-in-lightbox');
        this.plot.wrapper.style.width = "auto";
        this.plot.wrapper.style.maxWidth = "100%";

        lb.style.display = "flex";
        if (caption) caption.innerHTML = "";

        // Safe close listeners
        this.closeHandler = (e) => {
            if (e.target === lb || e.target.classList.contains('lightbox-close') || e.target.closest('.lightbox-close')) {
                e.stopPropagation();
                this.close();
            }
        };

        this.keyHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };

        // Remove old click listeners if any and add safe listener
        lb.removeEventListener('click', lb._oldClickHandler);
        lb.addEventListener('click', this.closeHandler);
        document.addEventListener('keydown', this.keyHandler);

        // Notify plot of resize
        window.dispatchEvent(new Event('resize'));
    }

    close() {
        if (!this.isOpen) return;
        const lb = document.getElementById('lightbox');

        // Restore wrapper to original place in DOM
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.insertBefore(this.plot.wrapper, this.placeholder);
            this.placeholder.remove();
            this.placeholder = null;
        }

        this.plot.wrapper.classList.remove('matephis-in-lightbox');
        this.plot.wrapper.style.width = this.originalWidth || "";
        this.plot.wrapper.style.maxWidth = this.originalMaxWidth || "";

        if (lb) {
            lb.style.display = "none";
            lb.removeEventListener('click', this.closeHandler);
        }
        document.removeEventListener('keydown', this.keyHandler);
        this.isOpen = false;

        // Notify plot of resize
        window.dispatchEvent(new Event('resize'));
    }
}
