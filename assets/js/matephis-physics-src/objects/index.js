/**
 * Object type registry.
 *
 * Each type declares its own keys (validated on top of the common ones), the
 * layer it is drawn in, and:
 *   resolve(obj, r) -> state                 world geometry; r is the Resolver
 *   anchor(state, name, arg, r, obj) -> point named anchors ("top", "surface(0.6)")
 *   anchorNames                              listed in warnings and in debug mode
 *   render(obj, state, ctx, group)           SVG for that state
 *
 * A state has at least `pos` (world point). Bodies add `angle`, `frame`
 * ({t, n, labels}) and `com`; surfaces add `surface(u)` and `surfaceLength`;
 * vectors add `vec` (physical components) and `kind`.
 */
import { ENVIRONMENT_TYPES } from './environment.js';
import { BODY_TYPES } from './bodies.js';
import { CONNECTION_TYPES } from './connections.js';
import { ANNOTATION_TYPES } from './annotations.js';
import { MOTION_TYPES } from './motion.js';
import { ENERGY_TYPES } from './energy.js';

/** Draw order, bottom to top. */
export const LAYERS = ['environment', 'bodies', 'connections', 'annotations'];

export const OBJECT_TYPES = { ...ENVIRONMENT_TYPES, ...BODY_TYPES, ...CONNECTION_TYPES, ...ANNOTATION_TYPES, ...MOTION_TYPES, ...ENERGY_TYPES };
