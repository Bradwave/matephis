/**
 * Toolbar icon registry.
 *
 * Each icon is a plain .svg file in ./icons (Material Symbols, fill="currentColor").
 * esbuild inlines them as strings at build time (--loader:.svg=text), so the
 * bundle stays self-contained (no runtime fetches: works in Obsidian too).
 * To add an icon: drop the .svg file in ./icons and add one import line here.
 */
import add from './icons/add.svg';
import remove from './icons/remove.svg';
import reset from './icons/reset.svg';
import fullscreen from './icons/fullscreen.svg';
import chart from './icons/chart.svg';
import point from './icons/point.svg';
import slope from './icons/slope.svg';
import tangent from './icons/tangent.svg';
import trace from './icons/trace.svg';
import eraser from './icons/eraser.svg';
import play from './icons/play.svg';
import pause from './icons/pause.svg';
import replay from './icons/replay.svg';
import snap from './icons/snap.svg';
import close from './icons/close.svg';
import download from './icons/download.svg';

export const MatephisIcons = {
    add, remove, reset, fullscreen, chart, point, slope, tangent, trace, eraser, play, pause, replay, snap, close, download
};
