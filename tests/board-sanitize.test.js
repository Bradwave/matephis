import { describe, it, expect } from 'vitest';
import { isSafeUrl, sanitizeStyle } from '../assets/js/matephis-board-src/model/sanitize-html.js';

describe('Board HTML sanitiser helpers', () => {
    describe('isSafeUrl', () => {
        it('allows safe link and image URLs', () => {
            expect(isSafeUrl('https://matephis.com/notes/x', 'link')).toBe(true);
            expect(isSafeUrl('/notes/x', 'link')).toBe(true);
            expect(isSafeUrl('mailto:info@matephis.com', 'link')).toBe(true);
            expect(isSafeUrl('/assets/img/foo.png', 'image')).toBe(true);
            expect(isSafeUrl('data:image/png;base64,AAAA', 'image')).toBe(true);
        });

        it('rejects script and non-image data URLs', () => {
            expect(isSafeUrl('javascript:alert(1)', 'link')).toBe(false);
            expect(isSafeUrl(' java\tscript:alert(1)', 'link')).toBe(false);
            expect(isSafeUrl('data:text/html,<script>alert(1)</script>', 'link')).toBe(false);
            expect(isSafeUrl('data:text/html,<script>alert(1)</script>', 'image')).toBe(false);
            expect(isSafeUrl('mailto:a@b.c', 'image')).toBe(false);
            expect(isSafeUrl('', 'link')).toBe(false);
        });
    });

    describe('sanitizeStyle', () => {
        it('keeps legitimate MathJax and table styles untouched', () => {
            expect(sanitizeStyle('vertical-align: -0.452ex;')).toBe('vertical-align: -0.452ex;');
            expect(sanitizeStyle('text-align: center')).toBe('text-align: center');
            expect(sanitizeStyle('min-width: 1.5em; color: #c00')).toBe('min-width: 1.5em; color: #c00');
        });

        it('strips overlay/positioning styles that could hijack the board UI', () => {
            expect(sanitizeStyle('position: fixed; inset: 0; z-index: 999999')).toBe('');
            expect(sanitizeStyle('text-align: left; position: fixed; z-index: 9999')).toBe('text-align: left');
        });

        it('rejects url(), expression() and backslash escapes', () => {
            expect(sanitizeStyle('background-color: url(https://evil.test/x)')).toBe('');
            expect(sanitizeStyle('color: expression(alert(1))')).toBe('');
            expect(sanitizeStyle('color: \\75rl(x)')).toBe('');
        });
    });
});
