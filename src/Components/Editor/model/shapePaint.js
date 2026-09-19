/*
 * Paint: gradient fills and stroke styles.
 *
 * A gradient lives beside the solid `fill`, never in place of it: `fill` stays
 * the colour an older client (or a thumbnail that cannot resolve a definition)
 * falls back to, and `gradient` paints the shape when it is there. One type so
 * far, LINEAR, with the list left open for RADIAL.
 *
 * Angles are degrees with 0 pointing right and 90 pointing down, the direction
 * the canvas's y axis grows, so 90° reads as top-to-bottom on screen.
 *
 * Dashes are described the way SVG draws them: a dash length and a gap in
 * canvas pixels. The presets derive both from the stroke width, so a dashed
 * hairline and a dashed thick border look like the same idea.
 */

export const GRADIENT_TYPES = ["LINEAR"];
export const STROKE_STYLES = ["solid", "dashed", "dotted"];
export const STROKE_JOINS = ["miter", "round", "bevel"];
export const MAX_STOPS = 8;
export const MITER_ANGLE = { min: 1, max: 180, default: 28.96 };

const HEX = /^#[0-9A-F]{6}$/i;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const round = (value, places = 4) => Math.round(value * 10 ** places) / 10 ** places;
const colour = (value, fallback) => (HEX.test(value) ? value.toUpperCase() : fallback);

export const normalizeAngle = (value) => ((Math.round(finite(value, 90)) % 360) + 360) % 360;

function normalizeStop(raw, fallbackOffset) {
  if (!raw || typeof raw !== "object") return null;
  return {
    offset: round(clamp(finite(raw.offset, fallbackOffset), 0, 1)),
    color: colour(raw.color, "#FFFFFF"),
    opacity: round(clamp(finite(raw.opacity, 1), 0, 1)),
  };
}

/* A gradient from a document, or null when there is none to draw. Stops are
   sorted, because SVG draws them in the order given and a stop dragged past
   its neighbour would otherwise flip the ramp. */
export function normalizeGradient(raw) {
  if (!raw || typeof raw !== "object" || !GRADIENT_TYPES.includes(raw.type) || !Array.isArray(raw.stops)) return null;
  const stops = raw.stops.map((stop, index) => normalizeStop(stop, index / Math.max(1, raw.stops.length - 1)))
    .filter(Boolean).slice(0, MAX_STOPS).sort((a, b) => a.offset - b.offset);
  if (stops.length < 2) return null;
  return { type: raw.type, angle: normalizeAngle(raw.angle), stops };
}

export const defaultGradient = (from = "#D9D9D9", to = "#737373") => ({
  type: "LINEAR", angle: 90, stops: [{ offset: 0, color: from, opacity: 1 }, { offset: 1, color: to, opacity: 1 }],
});

/* The gradient's line across the shape's own box, for SVG's
   gradientUnits="objectBoundingBox": the ramp runs corner to corner through
   the middle, so every angle fills the whole box. */
export function gradientVector(angle) {
  const radians = normalizeAngle(angle) * Math.PI / 180;
  const dx = Math.cos(radians) / 2, dy = Math.sin(radians) / 2;
  return { x1: round(0.5 - dx), y1: round(0.5 - dy), x2: round(0.5 + dx), y2: round(0.5 + dy) };
}

/* The same ramp as a CSS gradient, for swatches and the editor's preview bar.
   CSS measures its angle from "up" and turns clockwise, so it is our angle
   plus 90°. */
export function gradientCss(gradient) {
  const paint = normalizeGradient(gradient);
  if (!paint) return null;
  const stops = paint.stops.map((stop) => `${withAlpha(stop.color, stop.opacity)} ${round(stop.offset * 100, 2)}%`);
  return `linear-gradient(${normalizeAngle(paint.angle + 90)}deg, ${stops.join(", ")})`;
}

// #RRGGBB plus an opacity, as #RRGGBBAA, so one CSS colour carries both.
export function withAlpha(value, opacity = 1) {
  const safe = colour(value, "#000000");
  const alpha = Math.round(clamp(finite(opacity, 1), 0, 1) * 255).toString(16).padStart(2, "0");
  return alpha === "ff" ? safe : `${safe}${alpha.toUpperCase()}`;
}

export const strokeStyleOf = (value) => (STROKE_STYLES.includes(value) ? value : "solid");
export const strokeJoinOf = (value) => (STROKE_JOINS.includes(value) ? value : "miter");
export const miterAngleOf = (value) => round(clamp(finite(value, MITER_ANGLE.default), MITER_ANGLE.min, MITER_ANGLE.max), 2);

/* SVG's miter limit is a ratio, but the number people recognise from Figma is
   the angle below which a corner gives up and is cut off. */
export const miterLimitFor = (angle) => round(1 / Math.sin(miterAngleOf(angle) * Math.PI / 360), 3);

/* Dash and gap in canvas pixels. A custom `strokeDash` pair wins; otherwise the
   preset is derived from the stroke's own width. A dotted line is drawn as
   zero-length dashes with round caps, which is how SVG makes a dot. */
export function strokeDashOf(element) {
  const style = strokeStyleOf(element?.strokeStyle);
  if (style === "solid") return null;
  const width = Math.max(0.5, finite(element?.strokeWidth, 1));
  const custom = Array.isArray(element?.strokeDash) && element.strokeDash.length === 2
    && element.strokeDash.every((value) => Number.isFinite(Number(value)) && Number(value) >= 0)
    ? element.strokeDash.map((value) => round(Math.max(0, Number(value)), 2)) : null;
  if (custom) return { style, dash: custom[0], gap: custom[1], cap: style === "dotted" ? "round" : "butt" };
  return style === "dotted"
    ? { style, dash: 0, gap: round(width * 2), cap: "round" }
    : { style, dash: round(width * 3), gap: round(width * 2), cap: "butt" };
}

// What the SVG path needs: stroke-dasharray, stroke-linecap, stroke-linejoin, stroke-miterlimit.
export function strokePaint(element) {
  const dash = strokeDashOf(element);
  const join = strokeJoinOf(element?.strokeJoin);
  return {
    strokeDasharray: dash ? `${dash.dash} ${dash.gap}` : undefined,
    strokeLinecap: dash?.cap === "round" ? "round" : undefined,
    strokeLinejoin: join === "miter" ? undefined : join,
    strokeMiterlimit: join === "miter" ? miterLimitFor(element?.miterAngle) : undefined,
  };
}
