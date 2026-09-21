/*
 * One source of truth for every font the editor can put into a saved design.
 * Keep the family names identical to the @font-face names in foundation.css:
 * they are persisted in JSON and later used by the image/PDF font embedder.
 */
const REGULAR = [400];
const STANDARD_WEIGHTS = [400, 500, 600, 700];

export const EDITOR_FONTS = [
  { value: "Poppins", label: "Poppins", weights: STANDARD_WEIGHTS },
  { value: "Freehand", label: "Freehand", weights: REGULAR, khmer: true },

  { value: "DM Sans", label: "DM Sans", weights: STANDARD_WEIGHTS },
  { value: "Inter", label: "Inter", weights: STANDARD_WEIGHTS },
  { value: "Open Sans", label: "Open Sans", weights: STANDARD_WEIGHTS },
  { value: "Oswald", label: "Oswald", weights: STANDARD_WEIGHTS },
  { value: "Roboto", label: "Roboto", weights: STANDARD_WEIGHTS },
  { value: "Tinos", label: "Tinos", weights: REGULAR },

  { value: "Acme", label: "Acme", weights: REGULAR },
  { value: "Allura", label: "Allura", weights: REGULAR },
  { value: "Carter One", label: "Carter One", weights: REGULAR },
  { value: "Caveat Brush", label: "Caveat Brush", weights: REGULAR },
  { value: "Cookie", label: "Cookie", weights: REGULAR },
  { value: "Courier Prime", label: "Courier Prime", weights: REGULAR },
  { value: "Great Vibes", label: "Great Vibes", weights: REGULAR },
  { value: "Lobster", label: "Lobster", weights: REGULAR },
  { value: "Lobster Two", label: "Lobster Two", weights: REGULAR },
  { value: "Luckiest Guy", label: "Luckiest Guy", weights: REGULAR },
  { value: "Merienda", label: "Merienda", weights: STANDARD_WEIGHTS },
  { value: "Pacifico", label: "Pacifico", weights: REGULAR },
  { value: "Pirata One", label: "Pirata One", weights: REGULAR },
  { value: "Playball", label: "Playball", weights: REGULAR },
  { value: "Press Start 2P", label: "Press Start 2P", weights: REGULAR },
  { value: "Reenie Beanie", label: "Reenie Beanie", weights: REGULAR },
  { value: "Righteous", label: "Righteous", weights: REGULAR },
  { value: "Signika", label: "Signika", weights: STANDARD_WEIGHTS },
  { value: "Tangerine", label: "Tangerine", weights: REGULAR },
  { value: "Yanone Kaffeesatz", label: "Yanone Kaffeesatz", weights: STANDARD_WEIGHTS },

  { value: "Battambang", label: "Battambang", weights: REGULAR, khmer: true },
  { value: "Bayon", label: "Bayon", weights: REGULAR, khmer: true },
  { value: "Bokor", label: "Bokor", weights: REGULAR, khmer: true },
  { value: "Content", label: "Content", weights: REGULAR, khmer: true },
  { value: "Hanuman", label: "Hanuman", weights: STANDARD_WEIGHTS, khmer: true },
  { value: "Khmer", label: "Khmer", weights: REGULAR, khmer: true },
  { value: "Koulen", label: "Koulen", weights: REGULAR, khmer: true },
  { value: "Moul", label: "Moul", weights: REGULAR, khmer: true },
  { value: "Suwannaphum", label: "Suwannaphum", weights: REGULAR, khmer: true },
];

const BY_FAMILY = new Map(EDITOR_FONTS.map((font) => [font.value, font]));
const WEIGHT_LABELS = { 400: "Regular", 500: "Medium", 600: "Semi bold", 700: "Bold" };

export const EDITOR_FONT_OPTIONS = EDITOR_FONTS.map(({ value, label }) => ({
  value,
  label,
  style: { fontFamily: value },
}));

export function fontSupportsKhmer(family) {
  return BY_FAMILY.get(family)?.khmer === true;
}

export function fontWeightOptions(family) {
  const weights = BY_FAMILY.get(family)?.weights || REGULAR;
  return weights.map((weight) => ({ value: String(weight), label: WEIGHT_LABELS[weight] || String(weight) }));
}

export function normalizeFontWeight(family, weight) {
  const weights = BY_FAMILY.get(family)?.weights || REGULAR;
  const numeric = Number(weight) || 400;
  return weights.reduce((closest, candidate) => (
    Math.abs(candidate - numeric) < Math.abs(closest - numeric) ? candidate : closest
  ), weights[0]);
}
