// The Customize column's width limits, and the width a person chose, kept per browser.
export const INSPECTOR_WIDTH = { min: 260, max: 480, initial: 300 };
export const clampWidth = (width) => Math.round(Math.min(INSPECTOR_WIDTH.max, Math.max(INSPECTOR_WIDTH.min, width)));
const STORAGE_KEY = "visora.editor.inspectorWidth";

// The chosen width is a per-browser convenience, so it lives in localStorage and every read and write may fail.
export function readInspectorWidth() {
  try { const saved = Number(localStorage.getItem(STORAGE_KEY)); return saved ? clampWidth(saved) : INSPECTOR_WIDTH.initial; }
  catch { return INSPECTOR_WIDTH.initial; }
}
export function saveInspectorWidth(width) {
  try { localStorage.setItem(STORAGE_KEY, String(width)); } catch { /* storage unavailable: the width lasts this session */ }
}
