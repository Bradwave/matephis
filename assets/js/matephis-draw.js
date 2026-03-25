document.addEventListener('DOMContentLoaded', () => {
    const drawCanvasContainer = document.getElementById('draw-canvas-container');
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const stylusBtn = document.getElementById('stylus-btn');
    const drawToolbar = document.getElementById('draw-toolbar');
    const eraserBtn = document.getElementById('eraser-btn');
    const pen3Btn = document.getElementById('pen3-btn');
    const pen4Btn = document.getElementById('pen4-btn');
    const paletteBtn = document.getElementById('palette-btn');
    const clearBtn = document.getElementById('clear-btn');
    const lockBtn = document.getElementById('lock-btn');
    const cursorPreview = document.getElementById('draw-cursor-preview');

    let isDrawing = false;
    let isEraser = false;
    let penSize = 3;
    let eraserSize = 20;
    let isScrollLocked = true;
    let drawingEnabled = false;

    const colors = ["#000000", "#B01A00", "#2e4a9e", "#257fbe", "#0dacc2", "#d1b854", "#ff912a", "#4ebf62"];
    let currentColorIndex = 0;

    function updateCursorPreview(e) {
        if (!drawingEnabled || !cursorPreview) return;
        
        const size = isEraser ? eraserSize : penSize;
        cursorPreview.style.width = `${size}px`;
        cursorPreview.style.height = `${size}px`;
        cursorPreview.style.backgroundColor = isEraser ? 'rgba(255, 255, 255, 0.5)' : colors[currentColorIndex];
        
        if (e) {
            const pos = getPos(e);
            cursorPreview.style.left = `${pos.x}px`;
            cursorPreview.style.top = `${pos.y}px`;
        }
    }

    // Set canvas dimensions
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const newWidth = Math.round(window.innerWidth * dpr);
        const newHeight = Math.round(window.innerHeight * dpr);
        
        // Only resize (and thus clear) if dimensions actually changed
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Toggle Drawing Mode / Tool
    stylusBtn.addEventListener('click', () => {
        if (!drawingEnabled) {
            // Enter Draw Mode
            drawingEnabled = true;
            isEraser = false;
            ctx.globalCompositeOperation = 'source-over';
            
            drawToolbar.classList.add('visible');
            drawCanvasContainer.classList.add('active');
            
            // Resize check (won't clear if same size)
            resizeCanvas();
        } else if (isEraser) {
            // Switch from Eraser to Pen
            isEraser = false;
            ctx.globalCompositeOperation = 'source-over';
        } else {
            // Already in Pen mode, turn OFF Draw Mode
            drawingEnabled = false;
            drawToolbar.classList.remove('visible');
            drawCanvasContainer.classList.remove('active');
        }
        
        updateUIState();
        updateCursorPreview();
        // Update scrollPos to CURRENT position before locking
        if (drawingEnabled) scrollPos = window.pageYOffset;
        updateScrollLock(drawingEnabled ? isScrollLocked : false);
    });

    function updateUIState() {
        if (drawingEnabled) {
            stylusBtn.classList.toggle('active', !isEraser);
            eraserBtn.classList.toggle('active', isEraser);
        } else {
            stylusBtn.classList.remove('active');
            eraserBtn.classList.remove('active');
        }
    }

    // Tool switching
    eraserBtn.addEventListener('click', () => {
        if (!drawingEnabled) return;
        isEraser = !isEraser;
        
        if (isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
        updateUIState();
        updateCursorPreview();
    });

    // Palette color cycling
    paletteBtn.addEventListener('click', () => {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        const newColor = colors[currentColorIndex];
        paletteBtn.style.color = newColor;
        
        if (isEraser) {
            // Switch back to pen if they change color
            isEraser = false;
            ctx.globalCompositeOperation = 'source-over';
            updateUIState();
        }
        updateCursorPreview();
    });

    // Clear canvas
    clearBtn.addEventListener('click', () => {
        if (!drawingEnabled) return;
        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    });

    // Pen/Eraser sizing
    pen3Btn.addEventListener('click', () => {
        if (isEraser) {
            eraserSize = Math.max(5, eraserSize - 5);
        } else {
            penSize = Math.max(1, penSize - 1);
        }
        updateCursorPreview();
    });

    pen4Btn.addEventListener('click', () => {
        if (isEraser) {
            eraserSize = Math.min(100, eraserSize + 5);
        } else {
            penSize = Math.min(50, penSize + 2);
        }
        updateCursorPreview();
    });

    // Scroll Lock Toggle
    lockBtn.addEventListener('click', () => {
        isScrollLocked = !isScrollLocked;
        updateScrollLock(isScrollLocked);
    });

    let scrollPos = 0;
    function updateScrollLock(lock) {
        isScrollLocked = lock;
        const lockIcon = lockBtn.querySelector('.icon-lock');
        const unlockIcon = lockBtn.querySelector('.icon-lock-open');

        if (lock && drawingEnabled) {
            document.body.style.top = `-${scrollPos}px`;
            document.body.classList.add('draw-scroll-lock');
            document.documentElement.classList.add('draw-scroll-lock');
            
            lockBtn.classList.add('active');
            if (lockIcon) lockIcon.style.display = 'block';
            if (unlockIcon) unlockIcon.style.display = 'none';
        } else {
            // Prevent smooth scroll flashing
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'auto';
            
            document.body.classList.remove('draw-scroll-lock');
            document.documentElement.classList.remove('draw-scroll-lock');
            document.body.style.top = '';
            window.scrollTo(0, scrollPos);
            
            document.documentElement.style.scrollBehavior = originalScrollBehavior;

            lockBtn.classList.remove('active');
            if (lockIcon) lockIcon.style.display = 'none';
            if (unlockIcon) unlockIcon.style.display = 'block';
        }
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'Escape':
                if (drawingEnabled) {
                    stylusBtn.click();
                }
                break;
            case 'd':
            case 'D':
                if (!drawingEnabled) {
                    stylusBtn.click();
                } else if (isEraser) {
                    eraserBtn.click();
                }
                break;
            case 'e':
            case 'E':
                if (!drawingEnabled) {
                    stylusBtn.click();
                    if (!isEraser) eraserBtn.click();
                } else if (!isEraser) {
                    eraserBtn.click();
                }
                break;
        }
    });

    // Drawing Logic
    function getPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function startDrawing(e) {
        if (!drawingEnabled) return;
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        e.preventDefault();
    }

    function draw(e) {
        if (!isDrawing || !drawingEnabled) {
            updateCursorPreview(e);
            return;
        }
        const pos = getPos(e);
        
        ctx.lineWidth = isEraser ? eraserSize : penSize;
        ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : colors[currentColorIndex];
        
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        updateCursorPreview(e);
        e.preventDefault();
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.closePath();
    }

    window.addEventListener('mousemove', (e) => {
        if (drawingEnabled) updateCursorPreview(e);
    });

    window.addEventListener('touchmove', (e) => {
        if (drawingEnabled) updateCursorPreview(e);
    }, { passive: false });

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDrawing);
});
