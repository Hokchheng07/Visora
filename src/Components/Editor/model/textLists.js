/*
 * Bullet and numbered lists for text boxes. A list is a style on the whole
 * text box: every line of the text becomes one list item, the way Canva and
 * Google Slides treat a text box set to a list. The values are CSS
 * list-style-type names, so drawing them needs no counting code of our own.
 */

export const BULLET_STYLES = [
  { value: "disc", label: "Bullet", marker: "•" },
  { value: "circle", label: "Hollow bullet", marker: "◦" },
  { value: "square", label: "Square bullet", marker: "▪" },
];
export const NUMBER_STYLES = [
  { value: "decimal", label: "Numbers", marker: "1." },
  { value: "lower-alpha", label: "Lowercase letters", marker: "a." },
  { value: "upper-alpha", label: "Uppercase letters", marker: "A." },
  { value: "lower-roman", label: "Lowercase roman", marker: "i." },
  { value: "upper-roman", label: "Uppercase roman", marker: "I." },
];
export const LIST_STYLES = [...BULLET_STYLES, ...NUMBER_STYLES];

export function normalizeListStyle(value) {
  return LIST_STYLES.some((style) => style.value === value) ? value : null;
}

export const isOrderedList = (value) => NUMBER_STYLES.some((style) => style.value === value);

export function listLines(content) {
  return String(content ?? "").split("\n");
}
