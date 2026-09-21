import { useCallback, useEffect, useState } from "react";

/*
 * The colours someone mixed themselves, kept so they can be used again.
 *
 * The document-colour grid is a fixed palette; a colour chosen in the custom
 * picker is nowhere afterwards, so using the same one on a second element
 * means mixing it a second time and hoping it matches. Google Slides answers
 * this with a "Custom" row of recent colours, and so does this.
 *
 * They live in localStorage rather than in the document: a palette someone is
 * working in belongs to them, not to one file, and following them from one
 * backdrop to the next is the point. Nothing here is exported, so the JSON
 * stays exactly as it was.
 */

export const RECENT_COLOURS_KEY = "visora.editor.recentColours.v1";
// Enough to hold a scheme, few enough to stay one row under the grid.
export const MAX_RECENT_COLOURS = 8;

const HEX = /^#[0-9A-F]{6}$/i;
const clean = (value) => (HEX.test(String(value ?? "")) ? String(value).toUpperCase() : null);

export function readRecentColours(storage = globalThis.localStorage) {
  try {
    const list = JSON.parse(storage?.getItem(RECENT_COLOURS_KEY) || "[]");
    return Array.isArray(list) ? [...new Set(list.map(clean).filter(Boolean))].slice(0, MAX_RECENT_COLOURS) : [];
  } catch { return []; }
}

/** The list with `colour` at the front, unchanged when it is not a colour. */
export function withRecentColour(list, colour) {
  const hex = clean(colour);
  if (!hex) return list;
  return [hex, ...list.filter((item) => item !== hex)].slice(0, MAX_RECENT_COLOURS);
}

/* One event, so every open picker updates together: two swatch popovers can be
   on screen at once (the bar above the canvas and the Customize column), and a
   colour mixed in one should appear in the other. */
const CHANGED = "visora:recent-colours";

export function rememberColour(colour, storage = globalThis.localStorage) {
  const next = withRecentColour(readRecentColours(storage), colour);
  try { storage?.setItem(RECENT_COLOURS_KEY, JSON.stringify(next)); } catch { /* private mode; the row is simply empty */ }
  globalThis.dispatchEvent?.(new CustomEvent(CHANGED, { detail: next }));
  return next;
}

export function useRecentColours() {
  const [colours, setColours] = useState(readRecentColours);
  useEffect(() => {
    const onChanged = (event) => setColours(event.detail || readRecentColours());
    // `storage` covers the same design open in a second tab.
    const onStorage = (event) => { if (event.key === RECENT_COLOURS_KEY) setColours(readRecentColours()); };
    globalThis.addEventListener(CHANGED, onChanged);
    globalThis.addEventListener("storage", onStorage);
    return () => { globalThis.removeEventListener(CHANGED, onChanged); globalThis.removeEventListener("storage", onStorage); };
  }, []);
  return [colours, useCallback((colour) => rememberColour(colour), [])];
}
