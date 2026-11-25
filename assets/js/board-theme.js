// Applies the saved dark theme before the board paints. A file rather than an inline
// script, so the board's Content-Security-Policy can forbid inline scripts altogether.
(function () {
    try {
        if (localStorage.getItem('matephis_theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    } catch (e) {}
})();
