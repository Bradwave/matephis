/**
 * Semantic ink palette for Matephis Board.
 * Each color slot defines a Light-mode hex and a high-contrast Dark-mode hex
 * so toggling [data-theme="dark"] immediately preserves classroom legibility.
 */

export const PEN_COLORS = [
    // Primary 5 quick-dock colors (always 1 tap away)
    { id: 0, name: 'Inchiostro', light: '#111111', dark: '#f0f0f0', quick: true },
    { id: 1, name: 'Rosso',      light: '#B01A00', dark: '#ff523d', quick: true },
    { id: 2, name: 'Blu',        light: '#1d4ed8', dark: '#60a5fa', quick: true },
    { id: 3, name: 'Verde',      light: '#15803d', dark: '#4ade80', quick: true },
    { id: 4, name: 'Arancione',  light: '#c2410c', dark: '#fb923c', quick: true },
    // Extended colors (1 tap inside the Pen tray)
    { id: 5, name: 'Viola',      light: '#7e22ce', dark: '#c084fc', quick: false },
    { id: 6, name: 'Ottanio',    light: '#0f766e', dark: '#2dd4bf', quick: false },
    { id: 7, name: 'Ocra',       light: '#a16207', dark: '#facc15', quick: false },
    { id: 8, name: 'Magenta',    light: '#be185d', dark: '#f472b6', quick: false },
    { id: 9, name: 'Grigio',     light: '#52525b', dark: '#a1a1aa', quick: false },
];

export const HIGHLIGHTER_COLORS = [
    { id: 'h0', name: 'Giallo', light: 'rgba(253, 224, 71, 0.48)',  dark: 'rgba(250, 204, 21, 0.30)' },
    { id: 'h1', name: 'Ciano',  light: 'rgba(103, 232, 249, 0.44)', dark: 'rgba(34, 211, 238, 0.28)' },
    { id: 'h2', name: 'Verde',  light: 'rgba(134, 239, 172, 0.44)', dark: 'rgba(74, 222, 128, 0.28)' },
    { id: 'h3', name: 'Rosa',   light: 'rgba(249, 168, 212, 0.44)', dark: 'rgba(244, 114, 182, 0.28)' },
];

// World-space widths in millimeters (landscape A4 = 297 x 210 mm)
export const PEN_SIZES = [
    { id: 'xs', label: 'Sottile', width: 0.30 },
    { id: 'sm', label: 'Fine',    width: 0.45 },
    { id: 'md', label: 'Medio',   width: 0.70 },
    { id: 'lg', label: 'Spesso',  width: 1.05 },
];

export const HIGHLIGHTER_SIZES = [
    { id: 'sm', label: 'Sottile', width: 4.5 },
    { id: 'md', label: 'Medio',   width: 7.0 },
    { id: 'lg', label: 'Largo',   width: 10.5 },
];

export const ERASER_SIZES = [
    { id: 'xs', label: 'Fine',   radius: 3.0 },
    { id: 'sm', label: 'Media',  radius: 6.5 },
    { id: 'md', label: 'Grande', radius: 12.5 },
    { id: 'lg', label: 'Ampia',  radius: 22.0 },
];

export const PEN_STYLES = [
    { id: 'solid',  label: 'Continua' },
    { id: 'dashed', label: 'Tratteggiata' },
    { id: 'dotted', label: 'Punteggiata' },
];

const PEN_COLOR_MAP = new Map(PEN_COLORS.map((c) => [c.id, c]));
const HIGHLIGHTER_COLOR_MAP = new Map(HIGHLIGHTER_COLORS.map((c) => [c.id, c]));

export function resolveInkColor(colorId, theme = 'light') {
    const mode = theme === 'dark' ? 'dark' : 'light';
    if (typeof colorId === 'number' && PEN_COLOR_MAP.has(colorId)) {
        return PEN_COLOR_MAP.get(colorId)[mode];
    }
    if (typeof colorId === 'string' && HIGHLIGHTER_COLOR_MAP.has(colorId)) {
        return HIGHLIGHTER_COLOR_MAP.get(colorId)[mode];
    }
    if (typeof colorId === 'string' && (colorId.startsWith('#') || colorId.startsWith('rgb'))) {
        return colorId;
    }
    return PEN_COLORS[0][mode];
}
