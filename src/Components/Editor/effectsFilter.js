/*
 * Drop and inner shadows as SVG filters.
 *
 * Plain CSS cannot do this job: text-shadow and drop-shadow() have no inner
 * shadow and no spread. So every element with effects gets one <filter>, and
 * the element's effects wrapper points at it with CSS `filter: url(#id)`.
 *
 * primitiveUnits="objectBoundingBox" makes every number a fraction of the
 * element's own box. One definition is then correct at every size the
 * element is drawn — the canvas at any zoom, a page thumbnail, display mode —
 * with no resize listeners. Horizontal values are divided by the element's
 * width and vertical ones by its height, independently: dividing both by the
 * width would squash shadows on tall elements.
 *
 * This file only describes the filter. EditorEffectDefs.jsx renders it.
 */

export const MAX_EFFECTS = 4;
export const EFFECT_TYPES = ["DROP_SHADOW", "INNER_SHADOW"];
export const EFFECT_LIMITS = { x: [-400, 400], y: [-400, 400], blur: [0, 200], spread: [0, 100], opacity: [0, 1] };

const HEX = /^#[0-9A-F]{6}$/i;
const clamp = (value, [min, max]) => Math.min(max, Math.max(min, value));
const finite = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const fraction = (value) => Math.round(value * 1e6) / 1e6;

export function normalizeEffect(raw) {
  if (!raw || typeof raw !== "object" || !EFFECT_TYPES.includes(raw.type)) return null;
  return {
    type: raw.type,
    visible: raw.visible !== false,
    x: clamp(finite(raw.x, 0), EFFECT_LIMITS.x),
    y: clamp(finite(raw.y, 0), EFFECT_LIMITS.y),
    blur: clamp(finite(raw.blur, 0), EFFECT_LIMITS.blur),
    spread: clamp(finite(raw.spread, 0), EFFECT_LIMITS.spread),
    color: HEX.test(raw.color) ? raw.color.toUpperCase() : "#000000",
    opacity: clamp(finite(raw.opacity, 0.25), EFFECT_LIMITS.opacity),
  };
}

// Hidden effects are kept and count toward the limit; extras past it are dropped from the end.
export function normalizeEffects(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeEffect).filter(Boolean).slice(0, MAX_EFFECTS);
}

export const filterId = (elementId) => `fx-${String(elementId).replace(/[^A-Za-z0-9_-]/g, "_")}`;

/* How far past the element box the filter must reach, as fractions of the box.
   A Gaussian blur fades out at about three standard deviations, and blur is
   stored as two of them, so 1.5 × blur covers it. Inner shadows need the room
   too: they are made by shifting the *outside* of the element inwards, and
   there is no outside to shift unless the region extends past the box.
   `extra` is canvas pixels for anything else drawn past the box, such as an
   outline. */
export function filterRegion(effects, width, height, extra = 0) {
  let left = extra, right = extra, top = extra, bottom = extra;
  for (const effect of effects) {
    const reach = effect.blur * 1.5 + effect.spread + extra;
    left = Math.max(left, reach + Math.max(0, -effect.x));
    right = Math.max(right, reach + Math.max(0, effect.x));
    top = Math.max(top, reach + Math.max(0, -effect.y));
    bottom = Math.max(bottom, reach + Math.max(0, effect.y));
  }
  const w = Math.max(width, 1), h = Math.max(height, 1);
  return {
    x: fraction(-left / w),
    y: fraction(-top / h),
    width: fraction(1 + (left + right) / w),
    height: fraction(1 + (top + bottom) / h),
  };
}

/* The primitives for one element, as plain objects with React prop names, so
   this stays testable without rendering. Returns null when there is nothing
   to draw, and the element then gets no filter at all.

   `outline` ({ color, width } in canvas pixels) draws an outline by growing
   the element's silhouette. Phase 0 test for text: -webkit-text-stroke puts
   sharp spikes on script fonts such as Freehand, because HTML text strokes
   always use mitred corners. When an outline is present, drop shadows are
   cast by the outlined silhouette, as they would be in Figma. */
export function effectFilter(elementId, effects, width, height, { extra = 0, outline = null } = {}) {
  const visible = normalizeEffects(effects).filter((effect) => effect.visible);
  const hasOutline = !!(outline && outline.width > 0 && HEX.test(outline.color));
  if (!visible.length && !hasOutline) return null;
  const w = Math.max(width, 1), h = Math.max(height, 1);
  const primitives = [], drops = [], inners = [];
  let silhouette = "SourceAlpha";

  if (hasOutline) {
    primitives.push(
      { tag: "feMorphology", in: "SourceAlpha", operator: "dilate",
        radius: `${fraction(outline.width / w)} ${fraction(outline.width / h)}`, result: "outlineAlpha" },
      { tag: "feFlood", floodColor: outline.color.toUpperCase(), floodOpacity: 1, result: "outlineColour" },
      { tag: "feComposite", in: "outlineColour", in2: "outlineAlpha", operator: "in", result: "outline" },
    );
    silhouette = "outlineAlpha";
  }

  visible.forEach((effect, index) => {
    const inner = effect.type === "INNER_SHADOW";
    let source = inner ? "SourceAlpha" : silhouette;
    if (inner) {
      primitives.push({ tag: "feComponentTransfer", in: "SourceAlpha", result: `inverse${index}`,
        children: [{ tag: "feFuncA", type: "table", tableValues: "1 0" }] });
      source = `inverse${index}`;
    }
    // A radius or deviation of 0 is skipped rather than written: older engines
    // treat a zero as "disable", which can blank the result instead of passing it through.
    if (effect.spread > 0) {
      primitives.push({ tag: "feMorphology", in: source, operator: "dilate",
        radius: `${fraction(effect.spread / w)} ${fraction(effect.spread / h)}`, result: `spread${index}` });
      source = `spread${index}`;
    }
    primitives.push({ tag: "feOffset", in: source, dx: fraction(effect.x / w), dy: fraction(effect.y / h), result: `offset${index}` });
    source = `offset${index}`;
    if (effect.blur > 0) {
      primitives.push({ tag: "feGaussianBlur", in: source,
        stdDeviation: `${fraction(effect.blur / 2 / w)} ${fraction(effect.blur / 2 / h)}`, result: `blur${index}` });
      source = `blur${index}`;
    }
    primitives.push({ tag: "feFlood", floodColor: effect.color, floodOpacity: effect.opacity, result: `colour${index}` });
    primitives.push({ tag: "feComposite", in: `colour${index}`, in2: source, operator: "in", result: inner ? `tinted${index}` : `effect${index}` });
    if (inner) {
      primitives.push({ tag: "feComposite", in: `tinted${index}`, in2: "SourceAlpha", operator: "in", result: `effect${index}` });
      inners.push(`effect${index}`);
    } else {
      drops.push(`effect${index}`);
    }
  });

  // Drop shadows under the element, inner shadows over it. Within each kind the
  // earlier effect in the list is painted last, so the top row is on top.
  const stack = [...drops.reverse(), ...(hasOutline ? ["outline"] : []), "SourceGraphic", ...inners.reverse()];
  primitives.push({ tag: "feMerge", children: stack.map((input) => ({ tag: "feMergeNode", in: input })) });

  const room = extra + (hasOutline ? outline.width : 0);
  return { id: filterId(elementId), region: filterRegion(visible, w, h, room), primitives };
}
