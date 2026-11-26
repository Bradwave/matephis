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

        it('keeps what MathJax 3 SVG output sets inline', () => {
            // mjx-container with assistive MathML, and the svg's italic correction / display shift
            expect(sanitizeStyle('position: relative;')).toBe('position: relative;');
            expect(sanitizeStyle('vertical-align: -0.025ex; margin-left: -0.05ex; min-width: 12.3ex'))
                .toBe('vertical-align: -0.025ex; margin-left: -0.05ex; min-width: 12.3ex');
            expect(sanitizeStyle('margin-right: -0.4ex')).toBe('margin-right: -0.4ex');
        });

        it('keeps common table and diagram styles', () => {
            expect(sanitizeStyle('border: 1px solid #ccc; white-space: nowrap; background: #f5f5f5'))
                .toBe('border: 1px solid #ccc; white-space: nowrap; background: #f5f5f5');
            expect(sanitizeStyle('font-family: serif; stroke-dasharray: 4 2')).toBe('font-family: serif; stroke-dasharray: 4 2');
        });

        it('allows only position: relative', () => {
            for (const p of ['fixed', 'absolute', 'sticky']) expect(sanitizeStyle(`position: ${p}`)).toBe('');
        });

        it('rejects large or non-MathJax negative margins', () => {
            expect(sanitizeStyle('margin-top: -9999px')).toBe('');
            expect(sanitizeStyle('margin: 0 0 -50em 0')).toBe('');
            expect(sanitizeStyle('margin-left: -100%')).toBe('');
            expect(sanitizeStyle('margin-left: calc(0px - 100vh)')).toBe('');
            expect(sanitizeStyle('color: red; margin-top: -20vh')).toBe('color: red');
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
