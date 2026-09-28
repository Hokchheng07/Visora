import { normalizeEffects } from "../model/effectsFilter.js";
import { isLibrarySrc } from "../model/libraryRef.js";
import { KHMER_GOLD, libraryElement } from "../model/khmerElements.js";
import { normalizePageSize, orientationOf, pdfPageFormat } from "../model/pageSize.js";
import { imageUrlFor } from "../canvas/imageSource.js";
import { createSheet } from "./editorPdf.jsx";
import { fontEmbedCssFor } from "./exportFonts.js";
import { exportBlockedReason } from "./exportRules.js";
import { inlineImages } from "./inlineImages.js";
import { librarySvg, pageSvg, rasterElements } from "./pageSvg.js";
import { cssWeight, makeFont, outlineRuns, pickFace, textMarkup, underlineRects } from "./textOutline.js";

/*
 * Adobe Illustrator export.
 *
 * A modern .ai file is a PDF with Illustrator's own private data inside, and
 * Illustrator opens a plain PDF carrying the .ai name just as well. That
 * private data is not something a browser can write, so this writes the PDF:
 * but a vector one, not the photographed pages of the PDF export. Each page is
 * drawn again from the model as SVG (pageSvg) and svg2pdf turns that into PDF
 * paths, so shapes, gradients, strokes and library ornaments open in
 * Illustrator as objects that can be picked up and edited.
 *
 * Text is outlined: the browser's own layout, shaped again with HarfBuzz
 * against the same font files (textOutline.js), so Khmer and Latin both
 * arrive as paths. A text box that cannot be outlined faithfully — a list,
 * whose markers cannot be measured; a style the browser fakes (a bold or
 * italic the font does not have); a character the font has no glyph for —
 * is placed as a picture of itself instead, so nothing goes missing.
 *
 * Said plainly by the caller rather than discovered: how many text boxes
 * became pictures, and how many layers lost shadows (a PDF path has no
 * filter).
 *
 * Timers block the export exactly as they block PDF (exportRules).
 */

export const aiFileName = (editor) => `${(editor?.title || "visora-design").replace(/[^a-z0-9-_]+/gi, "-")}.ai`;

async function fetchText(address) {
  const response = await fetch(address);
  if (!response.ok) throw new Error(`${response.status}`);
  return response.text();
}

// A bitmap's own size, which covering a frame needs.
function naturalSize(href) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("unreadable image"));
    image.src = href;
  });
}

/*
 * Every picture the pages show — image elements and shapes' image fills — as
 * something pageSvg can draw, keyed by the element's `src`.
 *
 * Library artwork is bundled SVG, so it is read as markup and drawn inline:
 * a traced Khmer ornament then arrives in Illustrator as the paths it is made
 * of. Uploads are photos, embedded as the data inlineImages already fetched.
 * A picture that cannot be read is left out; pageSvg draws the editor's grey
 * placeholder in its place and the caller counts it as missing.
 */
async function loadPictures(pages) {
  const sources = new Set();
  for (const page of pages) {
    for (const element of page?.elements || []) {
      if (element?.type === "image" && element.src) sources.add(element.src);
      if (element?.fillImage) sources.add(element.fillImage);
    }
  }
  /* inlineImages collects image elements only, so the fills are handed to it
     dressed as image elements — the one place photos are fetched stays one. */
  const uploads = [...sources].filter((src) => !isLibrarySrc(src));
  const { images } = await inlineImages([{ elements: uploads.map((src) => ({ type: "image", src })) }]);

  const pictures = new Map();
  await Promise.allSettled([...sources].map(async (src) => {
    if (isLibrarySrc(src)) {
      const entry = libraryElement(src);
      if (!entry) return;
      if (/\.svg(\?|$)/i.test(entry.src)) {
        const text = await fetchText(entry.src);
        if (librarySvg(text)) pictures.set(src, { library: entry, text });
        return;
      }
      const { images: bundled } = await inlineImages([{ elements: [{ type: "image", src }] }]);
      const href = bundled.get(imageUrlFor(src));
      if (href) pictures.set(src, { library: entry, href, ...(await naturalSize(href)) });
      return;
    }
    // A picture already stored as data has nothing to fetch, and inlineImages skips it.
    const address = imageUrlFor(src);
    const href = address.startsWith("data:") ? address : images.get(address);
    if (!href) return;
    /* An uploaded SVG is drawn inline like library artwork: svg2pdf cannot
       place an SVG as an <image>, and inline it stays vector anyway. */
    if (href.startsWith("data:image/svg+xml")) {
      const text = await fetchText(href);
      if (librarySvg(text)) pictures.set(src, { text });
      return;
    }
    pictures.set(src, { href, ...(await naturalSize(href)) });
  }));
  // Anything not loaded, upload or library alike, is drawn as the placeholder.
  return { pictures, missing: [...sources].filter((src) => !pictures.has(src)).length };
}

// What pageSvg draws for one element's picture, recoloured when the canvas recolours it.
function pictureFor(pictures, element) {
  const loaded = pictures.get(element.src);
  if (!loaded) return null;
  const tint = loaded.library?.recolour && element.type === "image" ? element.fill || loaded.library.color || KHMER_GOLD : null;
  if (loaded.text) return { svg: librarySvg(loaded.text, tint), tint: !!tint };
  return { href: loaded.href, width: loaded.width, height: loaded.height, tint: false };
}

/*
 * Room around a text box's measured layout for what layout does not report:
 * glyph ink past the line box (italics, Khmer vowels above and below the
 * line), its outline, and its shadows.
 */
function inkPad(element) {
  const reach = normalizeEffects(element.effects).filter((effect) => effect.visible)
    .reduce((most, effect) => Math.max(most, effect.blur * 1.5 + effect.spread + Math.max(Math.abs(effect.x), Math.abs(effect.y))), 0);
  return (element.fontSize || 16) * 0.5 + (element.strokeWidth || 0) + reach;
}

/*
 * Every @font-face the page's stylesheets declare, as pickFace wants them.
 * Read from the stylesheets rather than listed again here, so a font added
 * to the editor is outlined without anyone remembering this file.
 */
function fontFaces() {
  const faces = [];
  const visit = (rules, base) => {
    for (const rule of rules) {
      if (rule.cssRules) { visit(rule.cssRules, base); continue; }
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      const family = rule.style.getPropertyValue("font-family").trim().replace(/^["']|["']$/g, "");
      const url = /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(rule.style.getPropertyValue("src"))?.[1];
      if (!family || !url) continue;
      const weights = rule.style.getPropertyValue("font-weight").trim().split(/\s+/).map(cssWeight);
      const style = rule.style.getPropertyValue("font-style").trim() === "italic" ? "italic" : "normal";
      faces.push({ family, url: new URL(url, base).href, style, min: Math.min(...weights), max: Math.max(...weights) });
    }
  };
  for (const sheet of document.styleSheets) {
    // A stylesheet from another origin cannot be read, and holds none of the editor's fonts.
    try { visit(sheet.cssRules, sheet.href || document.baseURI); } catch { /* skipped */ }
  }
  return faces;
}

/*
 * Fonts for outlining, each file fetched once and each face, weight and size
 * built once, however many text boxes use them.
 */
function createFonts(hb) {
  const faces = fontFaces();
  const files = new Map(), built = new Map();
  const file = (url) => {
    if (!files.has(url)) files.set(url, fetch(url).then((response) => (response.ok ? response.arrayBuffer() : null)).catch(() => null));
    return files.get(url);
  };
  return {
    faces,
    async font(face, weight, size) {
      const key = `${face.url}|${weight}|${size}`;
      if (!built.has(key)) {
        const data = await file(face.url);
        built.set(key, data ? makeFont(hb, data, { weight, size }) : null);
      }
      return built.get(key);
    },
  };
}

/*
 * A text box as outline markup in its own pixels, or null when it has to be
 * a picture instead (see the header). An empty box is "" — nothing to draw,
 * and nothing wrong.
 */
async function outlineText(hb, fonts, sheet, page, element) {
  if (element.type !== "text") return null;
  const layout = await sheet.measureText(page, element);
  if (!layout) return null;
  if (!layout.runs.length) return "";
  const pick = pickFace(fonts.faces, layout.fontFamily || "Poppins", cssWeight(layout.fontWeight), layout.italic);
  if (!pick || pick.syntheticBold || pick.syntheticItalic) return null;
  const font = await fonts.font(pick.face, pick.weight, layout.fontSize);
  if (!font) return null;
  const { d, missing } = outlineRuns(hb, font, layout.runs, { size: layout.fontSize, letterSpacing: layout.letterSpacing });
  if (missing) return null;
  let underlines = [];
  if (element.textDecoration === "underline") {
    const k = layout.fontSize / font.upem;
    const metric = (tag) => font.font.getMetricPositionWithFallback(hb.MetricsTag[tag]) * k;
    underlines = underlineRects(layout.runs, { offset: -metric("UNDERLINE_OFFSET"), thickness: Math.max(1, metric("UNDERLINE_SIZE")) });
  }
  return textMarkup(element, d, underlines);
}

/*
 * Exports the whole backdrop as an .ai file, one page per design page, in the
 * order the page strip shows them.
 *
 * `onProgress(page, total)` is called as each page starts. Throws when the
 * design holds a timer. Returns { missingImages, droppedEffects, textPictures }
 * for the caller to report; the file is saved either way.
 */
export async function exportAi(editor, onProgress) {
  const blocked = exportBlockedReason("ai", editor);
  if (blocked) throw new Error(blocked);
  const pages = editor?.pages || [];
  if (!pages.length) throw new Error("There is nothing to export.");

  // Loaded only when someone exports, like the PDF export's libraries.
  const [{ jsPDF }, { svg2pdf }, { getFontEmbedCSS }] = await Promise.all([
    import("jspdf"), import("svg2pdf.js"), import("html-to-image"),
  ]);
  const { pictures, missing } = await loadPictures(pages);
  /* HarfBuzz is a WebAssembly module of about 430 kB. If it cannot load, the
     export still works: every text box simply falls back to a picture. */
  const hb = await import("harfbuzzjs").catch(() => null);
  const fonts = hb ? createFonts(hb) : null;

  const size = normalizePageSize(editor.canvas);
  const format = pdfPageFormat(size), orientation = orientationOf(size) === "PORTRAIT" ? "portrait" : "landscape";
  const doc = new jsPDF({ orientation, unit: "pt", format, compress: true });
  // The sheet only ever draws text here, so it has no pictures to be handed.
  const sheet = createSheet(new Map(), size);
  let droppedEffects = 0, textPictures = 0;
  try {
    const fontEmbedCSS = await fontEmbedCssFor(pages, getFontEmbedCSS);
    for (const [index, page] of pages.entries()) {
      onProgress?.(index + 1, pages.length);
      if (index > 0) doc.addPage(format, orientation);

      const texts = new Map(), rasters = new Map();
      for (const element of rasterElements(page)) {
        const outline = hb ? await outlineText(hb, fonts, sheet, page, element) : null;
        if (outline !== null) { texts.set(element.id, outline); continue; }
        const shot = await sheet.captureElement(page, element, fontEmbedCSS, inkPad(element));
        if (shot) { rasters.set(element.id, shot); textPictures += 1; }
      }
      const drawn = pageSvg(page, size, {
        picture: (element) => pictureFor(pictures, element),
        text: (element) => (texts.has(element.id) ? texts.get(element.id) : null),
        raster: (element) => rasters.get(element.id) || null,
      });
      droppedEffects += drawn.droppedEffects;
      const svg = new DOMParser().parseFromString(drawn.svg, "image/svg+xml").documentElement;
      // One design pixel per point, except on A4, which is scaled onto real paper (pdfPageFormat).
      await svg2pdf(svg, doc, { x: 0, y: 0, width: format[0], height: format[1] });
    }
  } finally {
    sheet.dispose();
  }
  doc.save(aiFileName(editor));
  return { missingImages: missing, droppedEffects, textPictures };
}
