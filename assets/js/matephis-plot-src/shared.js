/**
 * Modules of the plot engine that the physics and sets engines use. Their bundles do not carry
 * their own copies: they read these from the plot bundle at run time (window.MatephisPlotModules,
 * see tools/build/engines.mjs), so a page or the board loads and parses this code once.
 * matephis-plot.js must therefore load first, as Post.html and the board's engine loader do.
 * The build fails if physics or sets import a module that is not listed here.
 */
import * as config from './core/config.js';
import * as coordinateSystem from './core/coordinate-system.js';
import * as lazyInit from './core/lazy-init.js';
import * as expressionParser from './parser/expression-parser.js';
import * as notAfter from './parser/not-after.js';
import * as gridRenderer from './renderers/grid-renderer.js';
import * as mathjaxBridge from './renderers/mathjax-bridge.js';
import * as svgFactory from './renderers/svg-factory.js';
import * as icons from './ui/icons.js';
import * as lightboxBridge from './ui/lightbox-bridge.js';
import * as sliderManager from './ui/slider-manager.js';
import * as warnings from './ui/warnings.js';

export const SHARED_MODULES = {
    'core/config.js': config,
    'core/coordinate-system.js': coordinateSystem,
    'core/lazy-init.js': lazyInit,
    'parser/expression-parser.js': expressionParser,
    'parser/not-after.js': notAfter,
    'renderers/grid-renderer.js': gridRenderer,
    'renderers/mathjax-bridge.js': mathjaxBridge,
    'renderers/svg-factory.js': svgFactory,
    'ui/icons.js': icons,
    'ui/lightbox-bridge.js': lightboxBridge,
    'ui/slider-manager.js': sliderManager,
    'ui/warnings.js': warnings,
};
