import { gradientVector, normalizeGradient } from "../model/shapePaint.js";
/*
 * Text as vector outlines, for the Adobe Illustrator export.
 *
 * The browser has already laid the text out: where every line breaks, where
 * every word starts, how the box aligns it. That layout is read back from the
 * DOM (see the export sheet's measureText) and kept — it is the editor's own,
 * so the file wraps exactly as the canvas does. What the browser cannot hand
 * over is the glyphs, so each word is shaped again with HarfBuzz, the same
 * shaper Chrome uses, against the same font file, and its glyph outlines are
 * placed where the browser put the word. Khmer comes out right because
 * HarfBuzz does the Khmer reordering and stacking; nothing here knows about it.
 *
 * Words are anchored one by one rather than a whole line from its first
 * letter, so a tab, a run of spaces or a justified gap can never push the rest
 * of a line out of place.
 *
 * Plain functions over a HarfBuzz module passed in, so node can test them with
 * the real font files.
 */

// A CSS weight as a number: "bold" and "normal" as the keywords mean, anything else as written.
export function cssWeight(value) {
  if (value === "bold") return 700;
  if (value === "normal" || value === undefined || value === null || value === "") return 400;
  const number = Number(value);
  return Number.isFinite(number) ? number : 400;
}

/*
 * The @font-face a family, weight and style resolve to, the way CSS picks one:
 * the right style first, then a face whose weight range holds the weight,
 * then the nearest weight — lighter first for 400 and below, heavier first
 * above 500 (CSS Fonts §5.2, simplified to what these faces need).
 *
 * `faces` is [{ family, url, style, min, max }]. Returns { face, weight,
 * syntheticBold, syntheticItalic } or null when the family has no face at all.
 * A synthetic style is one the browser fakes (a smeared bold, a slanted
 * roman); an outline cannot fake it the same way, so callers treat it as a
 * reason to keep that text as a picture.
 */
export function pickFace(faces, family, weight, italic) {
  const own = faces.filter((face) => face.family.toLowerCase() === String(family || "").toLowerCase());
  if (!own.length) return null;
  const styled = own.filter((face) => (face.style === "italic") === !!italic);
  const pool = styled.length ? styled : own;
  const within = pool.find((face) => weight >= face.min && weight <= face.max);
  const distance = (face) => (weight < face.min ? face.min - weight : weight - face.max);
  const preferLighter = weight <= 450;
  const face = within || [...pool].sort((a, b) => {
    const lighterA = a.max < weight, lighterB = b.max < weight;
    if (lighterA !== lighterB) return preferLighter ? (lighterA ? -1 : 1) : (lighterA ? 1 : -1);
    return distance(a) - distance(b);
  })[0];
  return {
    face,
    weight: Math.min(face.max, Math.max(face.min, weight)),
    // Chrome thickens a face that is 500 or lighter when 600 or more is asked for.
    syntheticBold: weight >= 600 && face.max <= 500,
    syntheticItalic: !!italic && face.style !== "italic",
  };
}

/*
 * A glyph path in font units (y up, from HarfBuzz) moved into page pixels:
 * scaled by `k`, flipped to y down, with its origin at (x, y).
 */
export function placePath(d, k, x, y) {
  const round = (value) => Math.round(value * 100) / 100;
  return d.replace(/(-?\d*\.?\d+(?:e[-+]?\d+)?),(-?\d*\.?\d+(?:e[-+]?\d+)?)/gi,
    (_, px, py) => `${round(x + Number(px) * k)},${round(y - Number(py) * k)}`);
}

/**
 * A HarfBuzz font for one face at the weight and size it is drawn at.
 *
 * Variable faces are set on their weight axis, and on the optical size axis
 * to the font size in pixels, which is what Chrome's `font-optical-sizing:
 * auto` does; HarfBuzz clamps both to what the face supports.
 */
export function makeFont(hb, data, { weight = 400, size = 16 } = {}) {
  const face = new hb.Face(new hb.Blob(data));
  const font = new hb.Font(face);
  const axes = face.getAxisInfos?.() || {};
  const variations = [];
  if ("wght" in axes) variations.push(new hb.Variation("wght", weight));
  if ("opsz" in axes) variations.push(new hb.Variation("opsz", size));
  if (variations.length) font.setVariations(variations);
  return { font, upem: face.upem };
}

/**
 * Outlines for words the browser has placed.
 *
 * `runs` is [{ text, x, baseline }] in pixels, one per word (or per piece of a
 * word broken across lines). `size` is the font size in pixels and
 * `letterSpacing` the extra pixels after every character, as CSS adds it.
 *
 * Returns { d, missing } — one SVG path for all of them, and whether any
 * character had no glyph in this font (the browser would have borrowed one
 * from another font, which an outline from this file cannot match).
 */
export function outlineRuns(hb, { font, upem }, runs, { size, letterSpacing = 0 }) {
  const k = size / upem;
  let d = "", missing = false;
  for (const run of runs) {
    const buffer = new hb.Buffer();
    buffer.addText(run.text);
    buffer.guessSegmentProperties();
    hb.shape(font, buffer);
    const infos = buffer.getGlyphInfos(), positions = buffer.getGlyphPositions();
    let pen = run.x;
    infos.forEach((info, index) => {
      if (info.codepoint === 0) missing = true;
      const position = positions[index];
      const path = font.glyphToPath(info.codepoint);
      if (path) d += placePath(path, k, pen + position.xOffset * k, run.baseline - position.yOffset * k);
      pen += position.xAdvance * k;
      // Letter spacing follows each character, which HarfBuzz marks as the end of a cluster.
      if (letterSpacing && infos[index + 1]?.cluster !== info.cluster) pen += letterSpacing;
    });
  }
  return { d, missing };
}

/*
 * Underlines, one per line, from the first word to the end of the last, as
 * the browser draws `text-decoration: underline` across the spaces between.
 * `offset` and `thickness` are the font's own underline metrics in pixels,
 * offset measured down from the baseline.
 */
export function underlineRects(runs, { offset, thickness }) {
  const lines = new Map();
  for (const run of runs) {
    const key = Math.round(run.baseline);
    const line = lines.get(key);
    if (line) { line.left = Math.min(line.left, run.x); line.right = Math.max(line.right, run.right); }
    else lines.set(key, { baseline: run.baseline, left: run.x, right: run.right });
  }
  return [...lines.values()].map((line) => ({ x: line.left, y: line.baseline + offset, width: line.right - line.left, height: thickness }));
}

const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rounded = (value) => Math.round(value * 100) / 100;

/**
 * The markup for a text box's outlines: an outline stroke behind the letters
 * when the element has one (the canvas draws -webkit-text-stroke at twice the
 * width with the fill painted over it, see textStroke.js), then the letters,
 * then any underlines in the letters' colour.
 */
export function textMarkup(element, d, underlines = []) {
  const fill = element.fill || "#000000";
  const width = element.strokeWidth || 0;
  const stroked = !!element.stroke && element.stroke !== "transparent" && element.strokeVisible !== false && width > 0;
  let body = "";
  if (stroked && d) {
    body += `<path d="${esc(d)}" fill="none" stroke="${esc(element.stroke)}" stroke-opacity="${rounded(element.strokeOpacity ?? 1)}" stroke-width="${rounded(width * 2)}" stroke-linejoin="miter"/>`;
  }
  /* A gradient spans the whole text box (as on the canvas), not just the
     letters' own bounds, so it is laid out in the box's coordinates. */
  const gradient = normalizeGradient(element.gradient);
  let paint = esc(fill);
  if (gradient) {
    const id = `text-fill-${esc(element.id || "t")}`;
    const w = element.w || 0, h = element.h || 0;
    const v = gradientVector(gradient.angle);
    const stops = gradient.stops.map((stop) => `<stop offset="${stop.offset}" stop-color="${esc(stop.color)}" stop-opacity="${stop.opacity}"/>`).join("");
    body += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${rounded(v.x1 * w)}" y1="${rounded(v.y1 * h)}" x2="${rounded(v.x2 * w)}" y2="${rounded(v.y2 * h)}">${stops}</linearGradient></defs>`;
    paint = `url(#${id})`;
  }
  if (d) body += `<path d="${esc(d)}" fill="${paint}"/>`;
  for (const line of underlines) {
    body += `<rect x="${rounded(line.x)}" y="${rounded(line.y)}" width="${rounded(line.width)}" height="${rounded(line.height)}" fill="${paint}"/>`;
  }
  return body;
}
