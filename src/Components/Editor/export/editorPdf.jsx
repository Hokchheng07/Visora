import { createRoot } from "react-dom/client";
import { StaticElement } from "../canvas/EditorElement.jsx";
import EditorEffectDefs from "../canvas/EditorEffectDefs.jsx";
import { hasVisibleEffects, strokeOverflow } from "../model/effectsFilter.js";
import { visibleElements } from "../model/layerModel.js";
import { DEFAULT_PAGE, normalizePageSize, orientationOf, pdfPageFormat } from "../model/pageSize.js";
import { InlinedImages } from "../canvas/imageSource.js";
import { fontEmbedCssFor } from "./exportFonts.js";
import { exportBlockedReason, JPEG_QUALITY, pageImageFormat } from "./exportRules.js";
import { inlineImages } from "./inlineImages.js";
import { pageBackgroundColor, pageBackgroundCss } from "../model/pageBackground.js";

/*
 * PDF export.
 *
 * A PDF is a still picture, so it carries only what a still picture can hold:
 * animations are dropped (there is no frame to play them in), and a backdrop
 * that contains a timer cannot be exported at all — a timer is a live element
 * whose whole value is that it runs, so freezing one into a page would hand
 * the user a screenshot of a number pretending to be a clock. Those designs
 * export as JSON instead, which keeps the timer as a timer.
 *
 * Pages are rasterised rather than redrawn as vectors on purpose. The editor
 * already renders every gradient, stroke, filter and Khmer glyph correctly in
 * the DOM; re-implementing that paint code against a PDF drawing API would
 * duplicate it and lose Khmer text shaping along the way.
 */

/* The PDF page is the design measured in points, so one PDF point is one
   design pixel and the numbers in the file are the numbers in the editor.
   jsPDF's "px" unit looks like the obvious choice and is not: it converts at
   96dpi, so a 1920-wide design silently becomes a 2560-point page.
   Paper sizes (A4) are the exception; see pdfPageFormat. */
const PAGE_UNIT = "pt";
// 2x gives a sharp page on a retina screen and when printed, without the memory cost of 3x.
const PIXEL_RATIO = 2;

/*
 * One painted frame, or 100ms, whichever lands first.
 *
 * requestAnimationFrame alone is not enough: a browser stops firing it while
 * its tab is in the background, so an export started and then switched away
 * from would wait for a frame that never comes and hang for good. The timer is
 * the way out; on a visible tab the frame always wins and nothing is delayed.
 */
function nextFrame() {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 100);
    requestAnimationFrame(() => { clearTimeout(timer); resolve(); });
  });
}

export const pdfFileName = (editor) => `${(editor?.title || "visora-design").replace(/[^a-z0-9-_]+/gi, "-")}.pdf`;

// A page's own colour, and white for a page that has never been given one.
const background = (page) => pageBackgroundCss(page?.background);
const backgroundColor = (page) => pageBackgroundColor(page?.background);

/*
 * A reusable offscreen sheet.
 *
 * The live canvas cannot be captured directly: it is zoomed, it carries
 * selection frames, rulers, snap guides and a marquee, and its sheet is only
 * as big as the viewport lets it be. This disposable copy has the page's own
 * geometry (the design's page size), so what is captured is what was authored.
 *
 * One host serves the whole document rather than one per page. A twenty-page
 * backdrop would otherwise mount and tear down twenty React roots, and every
 * one of them costs a layout pass and a fresh set of image decodes for
 * artwork the previous page had already loaded.
 */
export function createSheet(images, size = DEFAULT_PAGE) {
  const host = document.createElement("div");
  /* Offscreen, but still laid out. `display: none` would give every element a
     zero box and the capture would come back blank, and the same is true of
     the effect filters, which Chrome stops drawing inside a hidden tree. */
  host.style.cssText = `position: fixed; left: -20000px; top: 0; width: ${size.width}px; height: ${size.height}px; pointer-events: none;`;
  // The sheet is outside the editor, so it needs the page size its elements are drawn against.
  host.style.setProperty("--page-w", size.width); host.style.setProperty("--page-h", size.height);
  document.body.appendChild(host);
  const root = createRoot(host);

  /* Draws `elements` of `page` on the sheet over `fill` ("transparent" for
     none) and waits until they are laid out and their fonts have arrived. */
  async function mount(page, elements, fill) {
    root.render(
      /* The surface class is what gives the sheet its `container-type: size`,
         which every element's sizing is relative to. The effect filters are
         rendered inside this tree, not borrowed from the editor's copy:
         html-to-image captures a clone, and a `filter: url(#id)` pointing at a
         definition outside the clone resolves to nothing.

         The page's own id is the React key, so moving to the next page
         replaces the tree instead of trying to reconcile one page's elements
         into another's. */
      <InlinedImages.Provider key={page.id} value={images}>
      <div className="editor-animation-surface" style={{ position: "relative", width: size.width, height: size.height, background: fill }}>
        <EditorEffectDefs items={elements.filter(hasVisibleEffects)
          .map((element) => ({ id: element.id, w: element.w, h: element.h, effects: element.effects, extra: strokeOverflow(element) }))} />
        {elements.map((element) => <StaticElement key={element.id} element={element} layered />)}
      </div>
      </InlinedImages.Provider>
    );
    // React paints asynchronously; two frames is the first moment the tree is
    // laid out. Fonts come next: capturing before a webfont arrives bakes the
    // fallback into the PDF, which moves every line of Khmer text.
    await nextFrame();
    await nextFrame();
    await document.fonts.ready;
  }

  return {
    /** The page as { data, format } — a data URL and the PDF image format for it. */
    async capture(page, fontEmbedCSS) {
      await mount(page, visibleElements(page), background(page));
      const { toJpeg, toPng } = await import("html-to-image");
      /* The sheet itself is captured, not the host. html-to-image draws the node
         it is given inside an SVG foreignObject, and the host is positioned
         offscreen — captured directly it comes back fully transparent, because
         its offscreen position is copied into a box that has no room for it.

         The page's own fonts are passed in already gathered, and every picture
         is already data, so nothing here reaches the network. */
      const options = { width: size.width, height: size.height, pixelRatio: PIXEL_RATIO, fontEmbedCSS };
      const format = pageImageFormat(page);
      /* JPEG has no transparency, so the encoder is told the page's own colour.
         Without it a photo page would come out on black. */
      const data = format === "JPEG"
        ? await toJpeg(host.firstElementChild, { ...options, quality: JPEG_QUALITY, backgroundColor: backgroundColor(page) })
        : await toPng(host.firstElementChild, options);
      return { data, format };
    },
    /**
     * One element alone, on a transparent sheet, as a PNG of just the part of
     * the page it paints — for the parts of an Illustrator export that are
     * still pictures. Cropping keeps it a small object Illustrator can pick
     * up, not a page-sized sheet of transparency over everything else.
     *
     * The part it paints is measured, not worked out from the model: text
     * routinely spills past its box (a line height under 1, a word too long
     * to wrap, Khmer marks above the line), and a crop taken from the box
     * cuts those off. `pad` is extra room in page pixels for what no layout
     * box reports — shadows and glyph ink.
     *
     * Returns { href, x, y, width, height } in page pixels, or null when the
     * element paints nothing on the page.
     */
    async captureElement(page, element, fontEmbedCSS, pad = 0) {
      await mount(page, [element], "transparent");
      const sheetNode = host.firstElementChild;
      const node = sheetNode.querySelector("[data-element-id]");
      if (!node) return null;
      const origin = sheetNode.getBoundingClientRect();
      const contents = document.createRange();
      contents.selectNodeContents(node);
      const rects = [node.getBoundingClientRect(), ...contents.getClientRects()].filter((rect) => rect.width || rect.height);
      const left = Math.max(0, Math.floor(Math.min(...rects.map((rect) => rect.left)) - origin.left - pad));
      const top = Math.max(0, Math.floor(Math.min(...rects.map((rect) => rect.top)) - origin.top - pad));
      const right = Math.min(size.width, Math.ceil(Math.max(...rects.map((rect) => rect.right)) - origin.left + pad));
      const bottom = Math.min(size.height, Math.ceil(Math.max(...rects.map((rect) => rect.bottom)) - origin.top + pad));
      if (!(right > left && bottom > top)) return null;

      const { toCanvas } = await import("html-to-image");
      const canvas = await toCanvas(sheetNode, { width: size.width, height: size.height, pixelRatio: PIXEL_RATIO, fontEmbedCSS });
      const crop = document.createElement("canvas");
      crop.width = (right - left) * PIXEL_RATIO;
      crop.height = (bottom - top) * PIXEL_RATIO;
      crop.getContext("2d").drawImage(canvas, left * PIXEL_RATIO, top * PIXEL_RATIO, crop.width, crop.height, 0, 0, crop.width, crop.height);
      return { href: crop.toDataURL("image/png"), x: left, y: top, width: right - left, height: bottom - top };
    },
    /**
     * Where the browser put a text box's words, for drawing them as outlines.
     *
     * The box is laid out unturned, so everything comes back in its own
     * pixels (0, 0 at its top left); the caller turns the result with the
     * box. Returns null when it holds no text art (a list, say, whose markers
     * are ::marker boxes nothing can measure).
     *
     * { runs: [{ text, x, baseline, right }], fontSize, letterSpacing,
     *   fontFamily, fontWeight, italic }
     *
     * A run is one word, or the part of a word on one line when the box broke
     * it. `baseline` is found by measurement too: an empty inline-block sits
     * on the baseline, so its distance from the top of a letter's box in the
     * same font is where every line's baseline sits in its own letter box.
     */
    async measureText(page, element) {
      await mount(page, [{ ...element, rotation: 0 }], "transparent");
      const box = host.firstElementChild.querySelector("[data-element-id]");
      const art = box?.querySelector(".editor-text-art");
      if (!art || art.querySelector("li")) return null;
      const origin = box.getBoundingClientRect();
      const style = getComputedStyle(art);

      const probe = document.createElement("span");
      probe.style.cssText = `position: absolute; left: 0; top: 0; white-space: pre; line-height: normal; font-family: ${style.fontFamily}; font-size: ${style.fontSize}; font-weight: ${style.fontWeight}; font-style: ${style.fontStyle};`;
      probe.textContent = "x";
      const marker = document.createElement("span");
      marker.style.cssText = "display: inline-block; width: 0; height: 0;";
      probe.appendChild(marker);
      host.firstElementChild.appendChild(probe);
      const range = document.createRange();
      range.selectNodeContents(probe.firstChild);
      const ascent = marker.getBoundingClientRect().top - range.getBoundingClientRect().top;
      probe.remove();

      const runs = [];
      let run = null;
      const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      const walker = document.createTreeWalker(art, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const { segment, index } of segmenter.segment(node.data)) {
          if (/^\s+$/.test(segment)) { run = null; continue; }
          range.setStart(node, index);
          range.setEnd(node, index + segment.length);
          const rect = range.getClientRects()[0];
          if (!rect) { run = null; continue; }
          const top = rect.top - origin.top, left = rect.left - origin.left;
          // A new line starts a new run: the letter box moves down, or back to the left.
          if (!run || Math.abs(top - run.top) > 1 || left < run.last) {
            run = { text: "", x: left, top, baseline: top + ascent, last: left, right: left };
            runs.push(run);
          }
          run.text += segment;
          run.last = left;
          run.right = rect.right - origin.left;
        }
      }
      return {
        runs: runs.map(({ text, x, baseline, right }) => ({ text, x, baseline, right })),
        fontSize: parseFloat(style.fontSize),
        letterSpacing: parseFloat(style.letterSpacing) || 0,
        fontFamily: element.fontFamily,
        fontWeight: style.fontWeight,
        italic: style.fontStyle === "italic" || style.fontStyle.startsWith("oblique"),
      };
    },
    dispose() {
      root.unmount();
      host.remove();
    },
  };
}

/** One page as a data URL. Kept for callers that want a single picture. `size` is the design's page size. */
export async function renderPage(page, size = DEFAULT_PAGE) {
  const { images } = await inlineImages([page]);
  const sheet = createSheet(images, normalizePageSize(size));
  try { return (await sheet.capture(page)).data; }
  finally { sheet.dispose(); }
}

/*
 * Exports the whole backdrop as a PDF, one PDF page per design page, in the
 * order the page strip shows them.
 *
 * Every page is exported, not just the one on screen: a backdrop is a deck
 * shown in sequence, and a file holding only the slide the author happened to
 * have open is a file they have to notice is wrong.
 *
 * `onProgress(page, total)` is called as each page starts, so a long document
 * can say where it is. Throws when the design contains a timer rather than
 * exporting a broken one; the caller shows the message.
 *
 * Returns { missingImages } — how many pictures could not be downloaded. The
 * file is still saved, with the editor's own grey placeholder where they were,
 * because an export that refuses at the last step over one deleted upload
 * helps nobody. The caller says so rather than leaving it to be noticed.
 *
 * Switching to another tab part-way through pauses the export until the tab is
 * looked at again: the browser stops painting and decoding images for a tab
 * nobody is watching, and a capture is both. It resumes on its own and the
 * file is the same, so progress simply stops moving while the tab is away.
 */
export async function exportPdf(editor, onProgress) {
  const blocked = exportBlockedReason("pdf", editor);
  if (blocked) throw new Error(blocked);
  const pages = editor?.pages || [];
  if (!pages.length) throw new Error("There is nothing to export.");

  /* jsPDF and html-to-image are loaded only when someone exports. Together
     they are about 380 kB, and the editor has to open long before that. */
  const { jsPDF } = await import("jspdf");
  const { getFontEmbedCSS } = await import("html-to-image");
  const { images, missing } = await inlineImages(pages);

  const size = normalizePageSize(editor.canvas);
  const format = pdfPageFormat(size), orientation = orientationOf(size) === "PORTRAIT" ? "portrait" : "landscape";
  const doc = new jsPDF({ orientation, unit: PAGE_UNIT, format, compress: true });
  const sheet = createSheet(images, size);
  try {
    // Every family the document uses, gathered once. See exportFonts.
    const fontEmbedCSS = await fontEmbedCssFor(pages, getFontEmbedCSS);
    for (const [index, page] of pages.entries()) {
      onProgress?.(index + 1, pages.length);
      // The document opens with one page already in it, so only the pages after
      // the first add one.
      if (index > 0) doc.addPage(format, orientation);
      const picture = await sheet.capture(page, fontEmbedCSS);
      doc.addImage(picture.data, picture.format, 0, 0, format[0], format[1]);
    }
  } finally {
    sheet.dispose();
  }
  doc.save(pdfFileName(editor));
  // The file is saved either way; the caller says so when pictures are absent.
  return { missingImages: missing.length };
}
