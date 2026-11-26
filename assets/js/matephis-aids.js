/*
 * Hints and solutions in the notes (markup from _plugins/solution_styler.rb).
 * A solution reveals on tap and stays until tapped again. A group of hints gets one button that
 * reveals the next hint; tapping a revealed hint hides it and the ones after it.
 */
(function () {
    function update(group) {
        var hints = group.querySelectorAll('.hint-tag');
        var shown = group.querySelectorAll('.hint-tag.is-revealed').length;
        var button = group.nextElementSibling;
        var count = button.querySelector('.hint-count');
        button.hidden = shown === hints.length;
        if (count) count.textContent = (shown + 1) + '/' + hints.length;
    }

    function revealNext(button) {
        var group = button.previousElementSibling;
        group.querySelector('.hint-tag:not(.is-revealed)').classList.add('is-revealed');
        update(group);
    }

    function hideFrom(hint) {
        for (var el = hint; el; el = el.nextElementSibling) el.classList.remove('is-revealed');
        update(hint.parentElement);
    }

    // Links and text selection inside revealed text are left alone
    function isReading(e) {
        return e.target.closest('a') || String(window.getSelection());
    }

    document.addEventListener('click', function (e) {
        var next = e.target.closest('.hint-next');
        if (next) return revealNext(next);
        if (isReading(e)) return;
        var hint = e.target.closest('.hints .hint-tag.is-revealed');
        if (hint) return hideFrom(hint);
        var solution = e.target.closest('.solution-tag');
        if (solution) solution.classList.toggle('is-revealed');
    });

    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('solution-text')) {
            e.preventDefault();
            e.target.parentElement.classList.toggle('is-revealed');
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.content .hints').forEach(function (group) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'hint-next';
            button.innerHTML = '<span class="aid-label">Suggerimento</span>'
                + (group.children.length > 1 ? ' <span class="hint-count"></span>' : '');
            group.after(button);
            update(group);
        });
    });
})();
