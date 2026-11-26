/*
 * Hints and solutions in the notes (markup from _plugins/solution_styler.rb).
 * A solution reveals on tap and stays until tapped again. A group of hints gets one button that
 * reveals the next hint; tapping a revealed hint hides it and the ones after it.
 */
(function () {
    function update(group) {
        if (!group) return;
        var hints = group.querySelectorAll('.hint-tag');
        var shown = group.querySelectorAll('.hint-tag.is-revealed').length;
        // A revealed hint is a button: Enter, Space or a tap hides it (and the ones after it)
        hints.forEach(function (h) {
            if (h.classList.contains('is-revealed')) {
                h.setAttribute('tabindex', '0');
                h.setAttribute('role', 'button');
                h.setAttribute('aria-expanded', 'true');
            } else {
                h.removeAttribute('tabindex');
                h.removeAttribute('role');
                h.removeAttribute('aria-expanded');
            }
        });
        var button = group.nextElementSibling;
        if (!button || !button.classList.contains('hint-next')) return;
        var count = button.querySelector('.hint-count');
        button.hidden = shown === hints.length;
        if (count) count.textContent = (shown + 1) + '/' + hints.length;
    }

    function revealNext(button) {
        var group = button.previousElementSibling;
        if (!group || !group.classList.contains('hints')) return;
        var nextHint = group.querySelector('.hint-tag:not(.is-revealed)');
        if (nextHint) nextHint.classList.add('is-revealed');
        update(group);
    }

    function hideFrom(hint) {
        for (var el = hint; el; el = el.nextElementSibling) el.classList.remove('is-revealed');
        update(hint.parentElement);
    }

    function toggleSolution(solution) {
        var revealed = solution.classList.toggle('is-revealed');
        var text = solution.querySelector('.solution-text');
        if (text) text.setAttribute('aria-expanded', String(revealed));
    }

    // Links and text selected inside the clicked aid are left alone.
    // Checking containment prevents an unrelated selection elsewhere on the page
    // from blocking clicks on blurred .solution-text (user-select: none).
    function isReading(e, scope) {
        if (e.target.closest('a')) return true;
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed) return false;
        return Boolean(scope && ((sel.anchorNode && scope.contains(sel.anchorNode))
            || (sel.focusNode && scope.contains(sel.focusNode))));
    }

    document.addEventListener('click', function (e) {
        if (!(e.target instanceof Element)) return;
        var next = e.target.closest('.hint-next');
        if (next) return revealNext(next);
        var hint = e.target.closest('.hints .hint-tag.is-revealed');
        if (hint) {
            if (isReading(e, hint)) return;
            return hideFrom(hint);
        }
        var solution = e.target.closest('.solution-tag');
        if (solution) {
            if (isReading(e, solution)) return;
            toggleSolution(solution);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (!(e.target instanceof Element)) return;
        if (e.target.classList.contains('solution-text')) {
            var sol = e.target.closest('.solution-tag');
            if (!sol) return;
            e.preventDefault();
            toggleSolution(sol);
        } else if (e.target.matches('.hints .hint-tag.is-revealed')) {
            e.preventDefault();
            var group = e.target.parentElement;
            hideFrom(e.target);
            // The hint is gone: keep the keyboard on the button that shows it again
            var next = group && group.nextElementSibling;
            if (next && next.classList.contains('hint-next')) next.focus();
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
