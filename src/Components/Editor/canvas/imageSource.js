import { createContext } from "react";
import { getStorageUrl } from "../../API/storageApi";
import { LIBRARY_PREFIX, resolveLibrarySrc } from "../model/khmerElements.js";

/*
 * Where an image element's picture comes from.
 *
 * An element stores only what it was given — a built-in library id, an
 * uploaded file name, or a whole link — and the address is built when it is
 * drawn, so a saved document never holds a server address that could go stale.
 */
export function imageUrlFor(src) {
  if (!src) return "";
  // Built-in library elements ("library:<id>") resolve to a bundled file.
  if (src.startsWith(LIBRARY_PREFIX)) return resolveLibrarySrc(src) || "";
  return /^(https?:|data:|blob:)/.test(src) ? src : getStorageUrl(src);
}

/*
 * A map of picture address -> data URL, for surfaces that must not depend on
 * the network while they are drawn.
 *
 * PDF export is the one that needs it. Its pages are captured into an SVG,
 * and an <img> inside that SVG pointing at the storage server is a
 * cross-origin fetch that the capture cannot wait on or retry — so every
 * picture is downloaded once, up front, and handed over as data instead.
 * Anywhere else this is null and the address is used as it is.
 */
export const InlinedImages = createContext(null);
