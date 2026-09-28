import { defaultGradient, gradientCss, normalizeGradient } from "./shapePaint.js";

/*
 * Page paint uses the same gradient object as shape fills. Keeping one paint
 * model means a ramp has the same angle, stop ordering and opacity everywhere
 * in the editor, while `value` remains the solid fallback older clients and
 * the server can still understand.
 */

export const DEFAULT_PAGE_BACKGROUND = "#FFFFFF";
const HEX = /^#[0-9A-F]{6}$/i;

const colour = (value, fallback = DEFAULT_PAGE_BACKGROUND) => (
  HEX.test(String(value || "")) ? String(value) : fallback
);

export function normalizePageBackground(raw) {
  if (!raw || typeof raw !== "object") return { type: "COLOR", value: DEFAULT_PAGE_BACKGROUND };
  const gradient = normalizeGradient(raw.gradient || (typeof raw.value === "object" ? raw.value : null));
  if ((raw.type === "GRADIENT" || raw.type === "LINEAR") && gradient) {
    return { type: "GRADIENT", value: colour(raw.value, gradient.stops[0].color), gradient };
  }
  return { type: "COLOR", value: colour(raw.value) };
}

export function pageBackgroundCss(raw) {
  const background = normalizePageBackground(raw);
  return background.type === "GRADIENT" ? gradientCss(background.gradient) : background.value;
}

export function pageBackgroundColor(raw) {
  const background = normalizePageBackground(raw);
  return background.type === "GRADIENT" ? background.gradient.stops[0].color : background.value;
}

export function solidPageBackground(value) {
  return { type: "COLOR", value: colour(value) };
}

export function gradientPageBackground(gradient, fallback) {
  const paint = normalizeGradient(gradient) || defaultGradient(colour(fallback), "#705AE0");
  return { type: "GRADIENT", value: colour(fallback, paint.stops[0].color), gradient: paint };
}
