import { describe, it, expect } from 'vitest';
import { globToRegExp, matchesTarget, plainLabel } from '../assets/js/matephis-physics-src/core/controls.js';

describe('Bersagli dei pulsanti "Mostra"', () => {
    it('confronta gli id con i caratteri jolly', () => {
        expect(globToRegExp('A.*').test('A.P')).toBe(true);
        expect(globToRegExp('A.*').test('AB.P')).toBe(false);
        expect(globToRegExp('*').test('qualsiasi')).toBe(true);
        expect(globToRegExp('N').test('N2')).toBe(false);
    });

    it('riconosce i bersagli per tipo', () => {
        expect(matchesTarget({ type: 'decompose' }, 'type:decompose')).toBe(true);
        expect(matchesTarget({ type: 'force', id: 'A.N' }, 'A.*')).toBe(true);
        expect(matchesTarget({ type: 'force' }, 'A.*')).toBe(false);
    });

    it('scrive le etichette dei corpi come testo semplice per i pulsanti', () => {
        expect(plainLabel('$M$')).toBe('M');
        expect(plainLabel('$m_1$')).toBe('m1');
        expect(plainLabel('\\vec F')).toBe('F');
        expect(plainLabel('blocco')).toBe('blocco');
    });
});
