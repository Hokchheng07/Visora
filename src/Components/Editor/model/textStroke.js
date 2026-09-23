/*
 * Outline for text and timer digits. A shape strokes an SVG path and can align
 * the stroke inside, centre or outside; a glyph has no path to align to, so the
 * outline is a -webkit-text-stroke sitting on the letter edge, drawn *behind*
 * the fill (paint-order: stroke fill) so the letters keep their shape.
 *
 * The width doubles, as a shape's inside stroke does, because half of a centred
 * text-stroke is hidden under the fill — doubling makes `strokeWidth` read as
 * the visible outer thickness, matching the shape control. Width is in cqw
 * (1cqw = 19.2 design px), the unit the type itself uses, so it scales with the
 * sheet on every surface.
 */

const STROKE_BASE = 19.2;

function hexToRgba(hex, opacity) {
  const match = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(String(hex).trim());
  if (!match) return hex;
  const full = match[1].length === 3 ? match[1].split("").map((c) => c + c).join("") : match[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** The inline style that draws the outline, or null when there is none. */
export function textStrokeStyle(element) {
  const width = element.strokeWidth || 0;
  const on = !!element.stroke && element.stroke !== "transparent" && element.strokeVisible !== false && width > 0;
  if (!on) return null;
  const opacity = element.strokeOpacity ?? 1;
  const color = opacity < 1 ? hexToRgba(element.stroke, opacity) : element.stroke;
  return { WebkitTextStroke: `${(width * 2) / STROKE_BASE}cqw ${color}`, paintOrder: "stroke fill" };
}
