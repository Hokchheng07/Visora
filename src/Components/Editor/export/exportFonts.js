/*
 * The web fonts a design needs, gathered once as CSS with the font files
 * embedded in it.
 *
 * html-to-image can do this per capture, and doing it per capture is wrong
 * twice over. It reads the fonts from the node it is given, and it only keeps
 * the families that node actually uses — so a page set in Poppins would export
 * without Freehand, and the page after it, the one in Freehand, would come out
 * in whatever the browser substituted. It also base64s the font files again
 * for every page, which on a long document is the slowest step in the export
 * and the same few hundred kilobytes each time.
 *
 * So the families are read from the document's own elements, all of them, and
 * a small hidden probe using exactly those families is what the fonts are
 * gathered from. The result is handed to every capture unchanged.
 */

// What a text or timer element is set in when it does not say.
const DEFAULT_FAMILY = "Poppins";

/** Every font family the pages' text and timers are set in. */
export function fontFamilies(pages) {
  const families = new Set();
  for (const page of pages || []) {
    for (const element of page?.elements || []) {
      if (element?.type !== "text" && element?.type !== "timer") continue;
      families.add(element.fontFamily || DEFAULT_FAMILY);
    }
  }
  // A design with no text at all still gets the default, so an added caption
  // never depends on which page it landed on.
  if (!families.size) families.add(DEFAULT_FAMILY);
  return [...families];
}

/**
 * CSS holding every @font-face the pages need, with the font files embedded.
 *
 * Returns "" when the fonts cannot be read — the export goes ahead in the
 * browser's own fallback rather than stopping over typography.
 */
export async function fontEmbedCssFor(pages, getFontEmbedCSS) {
  const probe = document.createElement("div");
  probe.style.cssText = "position: fixed; left: -20000px; top: 0; pointer-events: none;";
  /* One line per family, because the fonts are picked by what the node is
     drawn in. The text is arbitrary; only the family matters. */
  for (const family of fontFamilies(pages)) {
    const line = document.createElement("span");
    line.style.fontFamily = family;
    line.textContent = "Aa";
    probe.appendChild(line);
  }
  document.body.appendChild(probe);
  try { return await getFontEmbedCSS(probe); }
  catch { return ""; }
  finally { probe.remove(); }
}
