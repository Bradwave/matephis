document.addEventListener('DOMContentLoaded', () => {
    // Patch Fancylessons smooth scrolling
    if (window.seamless) {
        window.seamless.polyfill();
    }

    const contentDiv = document.querySelector('.content');
    if (!contentDiv) return;

    let isSlideshowMode = false;
    let currentSlideIndex = 0;
    let slides = [];

    // Pull in page title to be part of the first slide
    const title = document.querySelector('h1.page-title');
    if (title) {
        contentDiv.insertBefore(title, contentDiv.firstChild);
    }

    // Parse content into slides based on <hr> 
    // In markdown, '---' becomes <hr>
    const childNodes = Array.from(contentDiv.childNodes);
    let currentSlide = document.createElement('div');
    currentSlide.className = 'slide';
    
    // Move elements into slides
    for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (node.tagName === 'HR') {
            contentDiv.insertBefore(currentSlide, node);
            contentDiv.removeChild(node);
            slides.push(currentSlide);
            currentSlide = document.createElement('div');
            currentSlide.className = 'slide';
        } else {
            currentSlide.appendChild(node);
        }
    }
    contentDiv.appendChild(currentSlide);
    slides.push(currentSlide);

    // Create slide indicator
    const indicator = document.createElement('div');
    indicator.id = 'slide-indicator';
    document.body.appendChild(indicator);

    // Init slideshow
    let isLargeTextMode = localStorage.getItem('presentation-large-text') === 'true';
    function initSlideshow() {
        let hash = location.hash;
        if (hash) {
            let parsed = parseInt(hash.replace(/[^0-9]/g, ''));
            currentSlideIndex = isNaN(parsed) ? 0 : parsed;
            if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) {
                currentSlideIndex = 0;
            }
            toggleSlideshow(true);
        }
    }

    function scrollToSlide(element, duration) {
        setTimeout(() => {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, duration || 0);
    }

    function toggleSlideshow(forceState) {
        if (typeof forceState === 'boolean') {
            isSlideshowMode = forceState;
        } else {
            isSlideshowMode = !isSlideshowMode;
        }

        const currentToggleBtn = document.getElementById('presentation-toggle');

        if (isSlideshowMode) {
            document.body.classList.add('presentation-mode');
            if (isLargeTextMode) document.documentElement.classList.add('large-text');
            updateSlides(0); // instant positioning
        } else {
            document.body.classList.remove('presentation-mode');
            document.documentElement.classList.remove('large-text');
            slides.forEach(slide => {
                slide.classList.remove('non-selected');
            });
            history.replaceState("", "", location.pathname + location.search);
        }
    }

    function updateSlides(timeout = 0) {
        history.replaceState(null, null, location.pathname.replace(/\/?$/, '/') + '#' + currentSlideIndex);

        for (let i = 0; i < slides.length; i++) {
            if (i === currentSlideIndex) {
                slides[i].classList.remove('non-selected');
            } else {
                slides[i].classList.add('non-selected');
            }
        }

        indicator.innerText = `${currentSlideIndex + 1} / ${slides.length}`;

        requestAnimationFrame(() => {
            if (slides[currentSlideIndex]) {
                scrollToSlide(slides[currentSlideIndex], timeout);
            }
        });
    }

    function nextSlide() {
        if (isSlideshowMode) {
            if (currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                updateSlides();
            }
        }
    }

    function previousSlide() {
        if (isSlideshowMode) {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                updateSlides();
            }
        }
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input (like search)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 's':
            case 'S':
                // Only toggle if not holding modifier keys
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    toggleSlideshow();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                previousSlide();
                break;
        }
    });

    const toggleBtn = document.getElementById('presentation-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            toggleSlideshow();
        });
    }

    const nextBtn = document.getElementById('next-slide-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
    }

    const prevBtn = document.getElementById('prev-slide-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            previousSlide();
        });
    }

    const textBtn = document.getElementById('text-size-toggle');
    if (textBtn) {
        textBtn.addEventListener('click', () => {
            isLargeTextMode = !isLargeTextMode;
            localStorage.setItem('presentation-large-text', isLargeTextMode);
            if (isSlideshowMode) {
                if (isLargeTextMode) {
                    document.documentElement.classList.add('large-text');
                } else {
                    document.documentElement.classList.remove('large-text');
                }
            }
        });
    }

    initSlideshow();
});
