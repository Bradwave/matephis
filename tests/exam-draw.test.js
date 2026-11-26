import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const exam = require('../assets/js/matephis-exam.js');

const q = (key, topic, code) => ({ key, topic, code, level: exam.levelValue(code) });

describe('Estrazione per le interrogazioni', () => {
    it('converte i gradi della scala in numeri ordinati', () => {
        expect(exam.levelValue('T')).toBe(1);
        expect(exam.levelValue('EE/F')).toBe(4);
        expect(exam.levelValue('F+')).toBeCloseTo(5 + 1 / 3);
        expect(exam.levelValue('PD-')).toBeCloseTo(6 - 1 / 3);
        expect(exam.levelValue('ee')).toBe(3);
        expect(exam.levelValue('X')).toBeNull();
        expect(exam.levelValue(null)).toBeNull();
    });

    it('legge le opzioni e segnala quelle sbagliate', () => {
        const o = exam.normalizeOptions({ pick: 3, level: ['F', 'EE'], cooldown: 2 });
        expect(o).toMatchObject({ pick: 3, min: 3, max: 5, cooldown: 2, errors: [] });
        expect(exam.normalizeOptions({}).pick).toBe(2);
        expect(exam.normalizeOptions({}).cooldown).toBe(1);
        expect(exam.normalizeOptions({ level: ['EE', 'X'] }).errors.length).toBe(1);
    });

    it('non mette insieme due domande dello stesso argomento', () => {
        const opts = exam.normalizeOptions({ pick: 2 });
        expect(exam.isValidSet([q('a', 'dom', 'E'), q('b', 'dom', 'F')], opts)).toBe(false);
        expect(exam.isValidSet([q('a', 'dom', 'E'), q('b', 'inv', 'F')], opts)).toBe(true);
    });

    it('tiene la difficoltà media nell’intervallo', () => {
        const opts = exam.normalizeOptions({ pick: 2, level: ['EE', 'F'] });
        expect(exam.isValidSet([q('a', '1', 'E'), q('b', '2', 'PD')], opts)).toBe(true); // media 4
        expect(exam.isValidSet([q('a', '1', 'E'), q('b', '2', 'E')], opts)).toBe(false); // troppo facili
        expect(exam.isValidSet([q('a', '1', 'PD'), q('b', '2', 'PD')], opts)).toBe(false); // troppo difficili
        expect(exam.isValidSet([q('a', '1', null), q('b', '2', 'F')], opts)).toBe(false); // senza grado
    });

    it('elenca tutte e sole le estrazioni valide', () => {
        const qs = [q('a', '1', 'E'), q('b', '1', 'F'), q('c', '2', 'EE'), q('d', '3', 'PD')];
        const opts = exam.normalizeOptions({ pick: 2, level: ['EE', 'F'] });
        const keys = exam.validDraws(qs, opts, null).map((s) => s.map((x) => x.key).join('')).sort();
        // ab: same topic; ac: mean 2.5; ad: 4; bc: 4; bd: 5.5; cd: 4.5
        expect(keys).toEqual(['ad', 'bc', 'cd']);
    });

    it('esclude le domande uscite agli ultimi studenti', () => {
        const history = [{ keys: ['a', 'b'] }, { keys: ['c', 'd'] }];
        expect(Object.keys(exam.blockedKeys(history, 1)).sort()).toEqual(['c', 'd']);
        expect(Object.keys(exam.blockedKeys(history, 2)).sort()).toEqual(['a', 'b', 'c', 'd']);
        expect(exam.blockedKeys(history, 0)).toEqual({});
    });

    it('due studenti di fila non hanno domande in comune', () => {
        const qs = [];
        for (let i = 0; i < 8; i++) qs.push(q('q' + i, 't' + (i % 4), ['E', 'EE', 'F', 'PD'][i % 4]));
        const opts = exam.normalizeOptions({ pick: 2, level: ['EE', 'F'], cooldown: 1 });
        const history = [];
        let seed = 1;
        const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        for (let s = 0; s < 30; s++) {
            const set = exam.drawSet(qs, opts, exam.blockedKeys(history, opts.cooldown), rng);
            expect(set).not.toBeNull();
            const keys = set.map((x) => x.key);
            if (history.length) for (const k of keys) expect(history[history.length - 1].keys).not.toContain(k);
            expect(exam.isValidSet(set, opts)).toBe(true);
            history.push({ keys });
        }
    });

    it('restituisce null quando nessuna estrazione è possibile', () => {
        const qs = [q('a', '1', 'E'), q('b', '2', 'E')];
        const opts = exam.normalizeOptions({ pick: 2, level: ['F', 'PD'] });
        expect(exam.drawSet(qs, opts, null)).toBeNull();
    });

    it('con troppe combinazioni estrae a caso, sempre rispettando le regole', () => {
        const qs = [];
        for (let i = 0; i < 120; i++) qs.push(q('q' + i, 't' + (i % 30), ['E', 'EE', 'F', 'PD'][i % 4]));
        const opts = exam.normalizeOptions({ pick: 4, level: ['EE', 'F'] });
        expect(exam.validDraws(qs, opts, null)).toBeNull();
        const set = exam.drawSet(qs, opts, null);
        expect(exam.isValidSet(set, opts)).toBe(true);
    });

    it('la chiave dipende dal testo, non dagli spazi o dalle maiuscole', () => {
        expect(exam.hashText('Cos’è il  dominio?')).toBe(exam.hashText('cos’è il dominio? '));
        expect(exam.hashText('Cos’è il dominio?')).not.toBe(exam.hashText('Cos’è l’immagine?'));
    });
});
