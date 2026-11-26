/*
 * Matephis oral exam draw.
 *
 * Runs on notes whose front matter has an `exam:` block, e.g.
 *
 *   exam:
 *     pick: 2          # questions per student
 *     level: [EE, F]   # range for the average difficulty of the questions drawn
 *     cooldown: 1      # how many following students can't get the same question
 *
 * The questions are the top-level items of the page's numbered lists, numbered across the whole
 * page. Two questions under the same heading (the nearest h2/h3 above them) share a topic and are
 * never drawn together. The difficulty is the item's [E], [F+] ... tag (see scala-difficoltà.md).
 * The history of the session (draws and the students' names) is kept in localStorage, per page
 * and per device: it never leaves the browser.
 */
(function (root) {
    'use strict';

    // Ordinal value of each grade of the scale; + and - move a third of a grade.
    // The alpine scale is fixed, so this copy of it (also in _plugins/difficulty_styler.rb and
    // scala-difficoltà.md) is kept on purpose rather than shared.
    var GRADES = ['T', 'E', 'EE', 'EE/F', 'F', 'PD', 'AD', 'D', 'TD', 'ED', 'ABO'];
    var MAX_COMBINATIONS = 200000;

    /** "EE/F" → 4, "F+" → 5.33; null for anything else. */
    function levelValue(code) {
        if (code == null) return null;
        var m = String(code).trim().toUpperCase().match(/^(T|E|EE|EE\/F|F|PD|AD|D|TD|ED|ABO)([+\-]?)$/);
        if (!m) return null;
        var v = GRADES.indexOf(m[1]) + 1;
        if (m[2] === '+') v += 1 / 3;
        if (m[2] === '-') v -= 1 / 3;
        return v;
    }

    /** Reads and checks the front-matter options. Returns { pick, min, max, cooldown, errors }. */
    function normalizeOptions(raw) {
        raw = raw || {};
        var errors = [];
        var pick = raw.pick == null ? 2 : parseInt(raw.pick, 10);
        if (!(pick >= 1)) { errors.push('"pick" deve essere un numero intero positivo.'); pick = 1; }
        var cooldown = raw.cooldown == null ? 1 : parseInt(raw.cooldown, 10);
        if (!(cooldown >= 0)) { errors.push('"cooldown" deve essere un numero intero, 0 o più.'); cooldown = 0; }
        var min = -Infinity, max = Infinity;
        if (raw.level != null) {
            var range = Array.isArray(raw.level) ? raw.level : [raw.level, raw.level];
            var a = levelValue(range[0]), b = levelValue(range[1]);
            if (a == null || b == null || range.length !== 2) {
                errors.push('"level" deve essere una coppia di gradi, ad esempio [EE, F].');
            } else {
                min = Math.min(a, b); max = Math.max(a, b);
            }
        }
        return { pick: pick, min: min, max: max, cooldown: cooldown, errors: errors };
    }

    /** Short stable key for a question, from its text (a small edit gives a new key). */
    function hashText(text) {
        var s = String(text).replace(/\s+/g, ' ').trim().toLowerCase();
        var h = 2166136261;
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(36);
    }

    /** Whether a set of questions obeys the topic and level rules. */
    function isValidSet(set, opts) {
        var topics = {};
        var sum = 0;
        for (var i = 0; i < set.length; i++) {
            var q = set[i];
            if (topics[q.topic]) return false;
            topics[q.topic] = true;
            if (opts.min > -Infinity || opts.max < Infinity) {
                if (q.level == null) return false;
                sum += q.level;
            }
        }
        if (opts.min > -Infinity || opts.max < Infinity) {
            var mean = sum / set.length;
            var eps = 1e-9;
            if (mean < opts.min - eps || mean > opts.max + eps) return false;
        }
        return true;
    }

    /** Number of k-subsets of n items (capped above MAX_COMBINATIONS). */
    function choose(n, k) {
        if (k > n) return 0;
        var r = 1;
        for (var i = 1; i <= k; i++) {
            r = r * (n - k + i) / i;
            if (r > MAX_COMBINATIONS) return Infinity;
        }
        return Math.round(r);
    }

    /** Calls fn(set) for every k-subset of items. */
    function eachCombination(items, k, fn) {
        var idx = [];
        for (var i = 0; i < k; i++) idx.push(i);
        var n = items.length;
        if (k > n || k === 0) return;
        while (true) {
            fn(idx.map(function (j) { return items[j]; }));
            var p = k - 1;
            while (p >= 0 && idx[p] === n - k + p) p--;
            if (p < 0) return;
            idx[p]++;
            for (var q = p + 1; q < k; q++) idx[q] = idx[q - 1] + 1;
        }
    }

    /**
     * All valid draws from the questions not in `blocked` (a set of keys), or, when there would be
     * too many to list, null (the caller then samples).
     */
    function validDraws(questions, opts, blocked) {
        var pool = questions.filter(function (q) { return !(blocked && blocked[q.key]); });
        if (choose(pool.length, opts.pick) === Infinity) return null;
        var out = [];
        eachCombination(pool, opts.pick, function (set) {
            if (isValidSet(set, opts)) out.push(set);
        });
        return out;
    }

    /** Picks a random valid draw, or null when there is none. */
    function drawSet(questions, opts, blocked, rng) {
        rng = rng || Math.random;
        var all = validDraws(questions, opts, blocked);
        if (all) return all.length ? all[Math.floor(rng() * all.length)] : null;
        // Too many combinations to list: random tries.
        var pool = questions.filter(function (q) { return !(blocked && blocked[q.key]); });
        for (var t = 0; t < 20000; t++) {
            var copy = pool.slice(), set = [];
            for (var i = 0; i < opts.pick; i++) {
                var j = Math.floor(rng() * copy.length);
                set.push(copy.splice(j, 1)[0]);
            }
            if (isValidSet(set, opts)) return set;
        }
        return null;
    }

    /** Keys of the questions drawn by the last `cooldown` students. */
    function blockedKeys(history, cooldown) {
        var blocked = {};
        var recent = cooldown > 0 ? history.slice(-cooldown) : [];
        recent.forEach(function (draw) {
            draw.keys.forEach(function (k) { blocked[k] = true; });
        });
        return blocked;
    }

    var core = {
        levelValue: levelValue,
        normalizeOptions: normalizeOptions,
        hashText: hashText,
        isValidSet: isValidSet,
        validDraws: validDraws,
        drawSet: drawSet,
        blockedKeys: blockedKeys
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = core;
        return;
    }
    root.MatephisExam = core;

    // ---- Page ----------------------------------------------------------------------------

    /**
     * The text of a list item, for its key: without solutions, formulas and what the engines draw.
     * Formulas read differently before and after MathJax (TeX source, or typeset output on
     * prerendered pages) and plots and diagrams fill their box when they are built, so the key
     * would change from one load to the next.
     */
    var KEY_STRIP = '.solution-tag, .hints, .hint-tag, details.work, .difficulty-tag, .exam-mark, mjx-container, div, pre, figure, svg, canvas, button, input, select';
    // The first release (1.0) kept hints and working in the key: still read, to map saved draws
    var LEGACY_KEY_STRIP = '.solution-tag, .difficulty-tag, .exam-mark, mjx-container, div, pre, figure, svg, canvas, button, input, select';

    function questionText(li, strip) {
        var clone = li.cloneNode(true);
        clone.querySelectorAll(strip || KEY_STRIP)
            .forEach(function (n) { n.remove(); });
        return clone.textContent
            .replace(/\$\$[\s\S]*?\$\$/g, ' ')
            .replace(/\$[^$]*\$/g, ' ')
            .replace(/\\\([\s\S]*?\\\)/g, ' ')
            .replace(/\\\[[\s\S]*?\\\]/g, ' ');
    }

    /**
     * Collects the questions of the page: top-level items of the lists in the content.
     * They are numbered across the whole page: each list starts where the previous one ended.
     */
    function collectQuestions(content) {
        var questions = [];
        var topic = null, topicIndex = 0, untitled = 0;
        var seen = {}, seenLegacy = {};
        Array.prototype.forEach.call(content.children, function (el) {
            var tag = el.tagName;
            if (tag === 'H2' || tag === 'H3') {
                topic = el.textContent.trim();
                topicIndex++;
                return;
            }
            if (tag !== 'OL') return;
            el.start = questions.length + 1;
            Array.prototype.forEach.call(el.children, function (li) {
                if (li.tagName !== 'LI') return;
                var diffEl = null;
                var first = li.firstElementChild;
                // Loose lists (items separated by a blank line or containing block elements) wrap text in <p>.
                if (first && first.tagName === 'P') first = first.firstElementChild;
                if (first && first.tagName === 'STRONG') diffEl = first.querySelector('.difficulty-tag');
                var code = diffEl ? diffEl.textContent.trim() : null;
                var key = hashText(questionText(li));
                while (seen[key]) key += '_';
                seen[key] = true;
                var legacyKey = hashText(questionText(li, LEGACY_KEY_STRIP));
                while (seenLegacy[legacyKey]) legacyKey += '_';
                seenLegacy[legacyKey] = true;
                questions.push({
                    key: key,
                    legacyKey: legacyKey,
                    el: li,
                    number: questions.length + 1,
                    // Items before any heading are each a topic of their own.
                    topic: topic == null ? '\u0000' + (untitled++) : topicIndex + ':' + topic,
                    topicLabel: topic || '',
                    code: code,
                    level: levelValue(code)
                });
            });
        });
        return questions;
    }

    function storageKey() {
        var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
        return 'matephis-exam:' + path;
    }

    /** Where 1.0 saved the session: the path as it was, trailing slash included. */
    function legacyStorageKey() {
        return 'matephis-exam:' + location.pathname;
    }

    /**
     * The saved session: { draws, removed }.
     * Each draw is { n, name?, keys, at }: `n` is the student's number, fixed when drawn, so
     * deleting a draw doesn't renumber the others.
     * `removed` is what can still be put back with "Ripristina", even after a reload, until the
     * next draw: { kind: 'delete', items: [{ entry, index }] } (deletions in a row add up), or
     * { kind: 'reset', draws } for a new session.
     */
    function loadState() {
        try {
            var raw = localStorage.getItem(storageKey());
            var migrated = false;
            if (raw == null && legacyStorageKey() !== storageKey()) {
                raw = localStorage.getItem(legacyStorageKey());
                migrated = raw != null;
            }
            var data = raw ? JSON.parse(raw) : null;
            var draws = data && Array.isArray(data.draws) ? data.draws : [];
            draws.forEach(function (d, i) { if (!d.n) d.n = i + 1; });
            var r = data && data.removed;
            var removed = r && ((r.kind === 'delete' && Array.isArray(r.items)) || (r.kind === 'reset' && Array.isArray(r.draws))) ? r : null;
            return { draws: draws, removed: removed, migrated: migrated };
        } catch (e) {
            return { draws: [], removed: null };
        }
    }

    function saveState(draws, removed) {
        try {
            localStorage.setItem(storageKey(), JSON.stringify({ draws: draws, removed: removed }));
            if (legacyStorageKey() !== storageKey()) localStorage.removeItem(legacyStorageKey());
        } catch (e) { /* private mode: the session lasts as long as the page */ }
    }

    function make(tag, cls, text) {
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text != null) el.textContent = text;
        return el;
    }

    function plural(n, one, many) {
        return n + ' ' + (n === 1 ? one : many);
    }

    // Line icons, 24×24, drawn with currentColor (same style as the site's sidebar toggle).
    var ICONS = {
        shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
        undo: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
        list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
        trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
    };

    function icon(name) {
        var span = document.createElement('span');
        span.className = 'exam-svg';
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
        return span;
    }

    /** A button with an icon; `label` is its tooltip and accessible name, `text` its visible text. */
    function iconButton(cls, iconName, label, text) {
        var b = make('button', cls);
        b.type = 'button';
        b.title = label;
        b.setAttribute('aria-label', label);
        b.appendChild(icon(iconName));
        if (text) b.appendChild(make('span', null, text));
        return b;
    }

    /** "Rossi", or "Studente 3" when no name was given. */
    function studentLabel(draw) {
        return draw.name || 'Studente ' + draw.n;
    }

    /** The number for the next student: one more than the highest so far. */
    function nextNumber(history) {
        var max = 0;
        history.forEach(function (d) { if (d.n > max) max = d.n; });
        return max + 1;
    }

    /**
     * Draws saved by 1.0 name questions by their old key: renamed to the current one, so the
     * cooldown and the list of past draws still know them. Returns true if anything changed.
     */
    function migrateKeys(questions, draws, removed) {
        var current = {}, map = {};
        questions.forEach(function (q) { current[q.key] = true; });
        questions.forEach(function (q) {
            if (q.legacyKey !== q.key && !current[q.legacyKey]) map[q.legacyKey] = q.key;
        });
        var changed = false;
        function fix(entry) {
            if (!entry || !Array.isArray(entry.keys)) return;
            entry.keys = entry.keys.map(function (k) {
                if (map[k]) { changed = true; return map[k]; }
                return k;
            });
        }
        draws.forEach(fix);
        if (removed && removed.kind === 'reset') removed.draws.forEach(fix);
        if (removed && removed.kind === 'delete') removed.items.forEach(function (it) { fix(it && it.entry); });
        return changed;
    }

    function init() {
        var content = document.querySelector('.content');
        if (!content || !root.MatephisExamOptions) return;
        var opts = normalizeOptions(root.MatephisExamOptions);
        var questions = collectQuestions(content);
        var byKey = {};
        questions.forEach(function (q) { byKey[q.key] = q; });
        var state = loadState();
        var history = state.draws;
        var removed = state.removed;
        function save() { saveState(history, removed); }
        if (migrateKeys(questions, history, removed) || state.migrated) save();

        var panel = make('div', 'exam-panel');
        var actions = make('div', 'exam-actions');
        var nameInput = make('input', 'exam-name');
        nameInput.type = 'text';
        nameInput.setAttribute('aria-label', 'Nome dello studente (facoltativo)');
        nameInput.autocomplete = 'off';
        nameInput.spellcheck = false;
        var drawBtn = iconButton('btn exam-draw', 'shuffle', 'Estrai le domande', 'Estrai');
        var undoBtn = iconButton('exam-icon', 'undo', 'Annulla l’ultima estrazione');
        var logBtn = iconButton('exam-icon exam-log-toggle', 'list', 'Mostra le estrazioni', '');
        var logCount = make('span', 'exam-count');
        logBtn.appendChild(logCount);
        logBtn.setAttribute('aria-expanded', 'false');
        var resetBtn = iconButton('exam-icon', 'trash', 'Nuova sessione: cancella le estrazioni e i nomi (si può ripristinare)');
        [nameInput, drawBtn, undoBtn, logBtn, resetBtn].forEach(function (b) { actions.appendChild(b); });
        var notice = make('p', 'exam-notice');
        var noticeText = make('span');
        var restoreBtn = make('button', 'exam-link', 'Ripristina');
        restoreBtn.type = 'button';
        notice.appendChild(noticeText);
        notice.appendChild(document.createTextNode(' '));
        notice.appendChild(restoreBtn);
        var info = make('p', 'exam-info');
        var log = make('ol', 'exam-log');
        log.hidden = true;
        logBtn.addEventListener('click', function () {
            log.hidden = !log.hidden;
            logBtn.setAttribute('aria-expanded', String(!log.hidden));
        });
        panel.appendChild(actions);
        panel.appendChild(notice);
        panel.appendChild(info);
        panel.appendChild(log);

        // Before the first heading or list, after the introduction.
        var anchor = null;
        Array.prototype.some.call(content.children, function (el) {
            if (/^(H2|H3|OL)$/.test(el.tagName)) { anchor = el; return true; }
            return false;
        });
        content.insertBefore(panel, anchor);

        var overlay = make('div', 'exam-overlay');
        overlay.hidden = true;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'exam-dialog-title');
        var card = make('div', 'exam-card');
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // The questions on show are the page's own nodes, moved into the overlay, so plots,
        // diagrams and sliders keep working (a copy would be static, or empty). Closing puts
        // them back.
        var moved = [];
        function restoreQuestions() {
            moved.forEach(function (m) {
                while (m.wrap.firstChild) m.li.appendChild(m.wrap.firstChild);
            });
            moved = [];
        }

        // While the questions are on show, the page behind can't take focus (Tab stays in here).
        var pageRoot = document.querySelector('.container');
        function setPageInert(on) {
            if (pageRoot) pageRoot.inert = on;
        }

        function closeOverlay() {
            if (overlay.hidden) return;
            restoreQuestions();
            overlay.hidden = true;
            // Back on the page, figures redraw at their page width.
            try { root.dispatchEvent(new Event('resize')); } catch (e) { /* old browsers */ }
            document.documentElement.classList.remove('exam-open');
            setPageInert(false);
            // Ready for the next student; without scrolling the page back to the panel.
            nameInput.focus({ preventScroll: true });
        }
        // Only the × (or Esc) closes it: a stray tap on the board must not hide the questions.
        overlay.addEventListener('click', function (e) {
            if (e.target.closest('.exam-close')) closeOverlay();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
        });

        /** Figures grow with the text: the draw view's font size over the page's. */
        function setFigureZoom() {
            var f = parseFloat(getComputedStyle(card).fontSize) / parseFloat(getComputedStyle(content).fontSize);
            card.style.setProperty('--exam-zoom', isFinite(f) && f > 0 ? f.toFixed(3) : '1');
        }
        root.addEventListener('resize', function () {
            if (!overlay.hidden) setFigureZoom();
        });

        function showDraw(draw) {
            restoreQuestions();
            card.innerHTML = '';
            var head = make('div', 'exam-card-head');
            var heading = make('h2', null, studentLabel(draw));
            heading.id = 'exam-dialog-title';
            head.appendChild(heading);
            var close = iconButton('exam-icon exam-close', 'close', 'Chiudi (Esc)');
            head.appendChild(close);
            card.appendChild(head);
            draw.keys.forEach(function (k) {
                var q = byKey[k];
                var item = make('section', 'exam-question');
                if (q) {
                    item.appendChild(make('p', 'exam-topic',
                        'Domanda ' + q.number + (q.topicLabel ? ' · ' + q.topicLabel : '')));
                    var wrap = make('div', 'exam-question-body');
                    while (q.el.firstChild) wrap.appendChild(q.el.firstChild);
                    moved.push({ li: q.el, wrap: wrap });
                    item.appendChild(wrap);
                } else {
                    item.appendChild(make('p', null, 'Domanda non più presente nella pagina.'));
                }
                card.appendChild(item);
            });
            overlay.hidden = false;
            overlay.scrollTop = 0;
            document.documentElement.classList.add('exam-open');
            setPageInert(true);
            close.focus();
            setFigureZoom();
            // Engines that size themselves on resize (plots) adapt to the new width.
            try { root.dispatchEvent(new Event('resize')); } catch (e) { /* old browsers */ }
            // Opened before MathJax had typeset the page: typeset the questions now.
            var mj = root.MathJax;
            if (mj && mj.typesetPromise && /\$|\\\(/.test(card.textContent)) mj.typesetPromise([card]).catch(function () {});
        }

        /** A row of the list: the student, then each question with grade, number and topic. */
        function logEntry(draw, index) {
            var li = make('li', 'exam-entry');
            var open = make('button', 'exam-entry-open');
            open.type = 'button';
            open.title = 'Mostra le domande';
            open.appendChild(make('span', 'exam-entry-name', studentLabel(draw)));
            var qs = make('span', 'exam-entry-qs');
            draw.keys.forEach(function (k) {
                var q = byKey[k];
                var chip = make('span', 'exam-chip');
                if (q) {
                    var tag = q.el.querySelector('.difficulty-tag');
                    if (tag) chip.appendChild(tag.cloneNode(true));
                    chip.appendChild(make('span', 'exam-chip-n', String(q.number)));
                    if (q.topicLabel) chip.appendChild(make('span', 'exam-chip-topic', q.topicLabel));
                } else {
                    chip.appendChild(make('span', 'exam-chip-topic', 'domanda rimossa dalla pagina'));
                }
                qs.appendChild(chip);
            });
            open.appendChild(qs);
            open.addEventListener('click', function () { showDraw(draw); });
            var del = iconButton('exam-icon exam-entry-delete', 'close', 'Elimina l\u2019estrazione di ' + studentLabel(draw));
            del.addEventListener('click', function () { deleteDraw(index); });
            li.appendChild(open);
            li.appendChild(del);
            return li;
        }

        var drawFailed = false;

        function render() {
            var blocked = blockedKeys(history, opts.cooldown);
            var all = validDraws(questions, opts, null);
            var now = validDraws(questions, opts, blocked);
            var topicCount = {};
            questions.forEach(function (q) { topicCount[q.topic] = true; });
            var parts = [
                plural(questions.length, 'domanda', 'domande'),
                plural(Object.keys(topicCount).length, 'argomento', 'argomenti')
            ];
            if (all) parts.push(plural(all.length, 'estrazione valida', 'estrazioni valide'));
            if (opts.min > -Infinity) {
                var untagged = questions.filter(function (q) { return q.level == null; }).length;
                if (untagged) parts.push(plural(untagged, 'domanda senza difficoltà esclusa', 'domande senza difficoltà escluse'));
            }
            var msg = parts.join(' · ') + '.';
            if (opts.errors.length) msg += ' ' + opts.errors.join(' ');
            if (now && now.length === 0) {
                msg += all && all.length
                    ? ' Con le domande appena uscite non resta nessuna estrazione valida: aggiungi domande o riduci "cooldown".'
                    : ' Nessuna estrazione rispetta le regole: aggiungi domande o allarga "level".';
            } else if (drawFailed) {
                msg += ' Nessuna estrazione valida trovata con queste regole: aggiungi domande, allarga "level" o riduci "cooldown".';
            }
            info.textContent = msg;
            notice.hidden = !removed;
            if (removed) {
                noticeText.textContent = removed.kind === 'reset'
                    ? 'Sessione cancellata (' + plural(removed.draws.length, 'estrazione', 'estrazioni') + ').'
                    : removed.items.length > 1
                        ? 'Eliminate ' + removed.items.length + ' estrazioni.'
                        : 'Eliminata l\u2019estrazione di ' + studentLabel(removed.items[0].entry) + '.';
            }
            drawBtn.disabled = !!(now && now.length === 0);
            nameInput.placeholder = 'Studente ' + nextNumber(history) + ' \u00b7 nome facoltativo';
            undoBtn.disabled = resetBtn.disabled = logBtn.disabled = history.length === 0;
            logCount.textContent = history.length ? String(history.length) : '';
            if (!history.length) {
                log.hidden = true;
                logBtn.setAttribute('aria-expanded', 'false');
            }
            log.innerHTML = '';
            // Newest first: the draw just made is on top.
            for (var i = history.length - 1; i >= 0; i--) log.appendChild(logEntry(history[i], i));

            // Marks on the page: who got each question, and the questions resting.
            questions.forEach(function (q) {
                q.el.classList.toggle('exam-blocked', !!blocked[q.key]);
                var who = [];
                history.forEach(function (d, i) { if (d.keys.indexOf(q.key) >= 0) who.push(studentLabel(d)); });
                var mark = q.el.querySelector(':scope > .exam-mark');
                if (who.length) {
                    // At the end of the question, under any plot, sub-items and solution.
                    if (!mark) {
                        mark = make('span', 'exam-mark');
                        mark.appendChild(icon('user'));
                        mark.appendChild(make('span', 'exam-who'));
                    }
                    q.el.appendChild(mark);
                    mark.lastChild.textContent = who.join(', ');
                    mark.title = who.length === 1 ? 'Uscita a ' + who[0] : 'Uscita a ' + who.join(', ');
                    q.el.classList.add('exam-drawn');
                } else {
                    if (mark) mark.remove();
                    q.el.classList.remove('exam-drawn');
                }
            });
        }

        function draw() {
            var set = drawSet(questions, opts, blockedKeys(history, opts.cooldown));
            if (!set) { drawFailed = true; render(); return; }
            drawFailed = false;
            var entry = { n: nextNumber(history), at: Date.now(), keys: set.map(function (q) { return q.key; }) };
            var name = nameInput.value.trim();
            if (name) entry.name = name;
            nameInput.value = '';
            history.push(entry);
            removed = null; // a new draw makes the last undo final
            save();
            render();
            showDraw(entry);
        }

        drawBtn.addEventListener('click', draw);
        nameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !drawBtn.disabled) draw();
        });
        // No confirmation dialogs: undo and "new session" act at once and can be put back.
        /** Deletes one draw; deletions in a row add up, so Ripristina brings all of them back. */
        function deleteDraw(index) {
            var entry = history.splice(index, 1)[0];
            if (!entry) return;
            drawFailed = false;
            var item = { entry: entry, index: index };
            removed = removed && removed.kind === 'delete'
                ? { kind: 'delete', items: removed.items.concat([item]) }
                : { kind: 'delete', items: [item] };
            save();
            render();
        }

        undoBtn.addEventListener('click', function () {
            if (history.length) deleteDraw(history.length - 1);
        });
        resetBtn.addEventListener('click', function () {
            if (!history.length) return;
            drawFailed = false;
            removed = { kind: 'reset', draws: history };
            history = [];
            save();
            render();
        });
        restoreBtn.addEventListener('click', function () {
            if (!removed) return;
            drawFailed = false;
            if (removed.kind === 'reset') {
                history = removed.draws;
            } else {
                // Back in reverse order, each where it was.
                removed.items.slice().reverse().forEach(function (it) {
                    history.splice(Math.min(it.index, history.length), 0, it.entry);
                });
            }
            removed = null;
            save();
            render();
        });

        render();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})(typeof window !== 'undefined' ? window : this);
