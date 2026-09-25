/*
 * The size of every page in a design.
 *
 * One size per design, the way Canva and Figma slides work: all pages share
 * it, so a thumbnail strip, a presentation and a PDF never mix shapes. Sizes
 * are in design pixels. Every preset keeps its longest side at 1920, the size
 * the editor was tuned for, so a new text box, timer or photo comes in at a
 * sensible size whatever the shape of the page.
 */

export const DEFAULT_PAGE = { width: 1920, height: 1080 };
export const MIN_PAGE_SIDE = 200;
export const MAX_PAGE_SIDE = 5000;

/* A4 is 210 × 297 mm; 1358 × 1920 keeps that ratio (to within a pixel) at
   the 1920 long side. "Document" is A4 too: a design can have as many pages
   as it needs, so a multi-page document is just an A4 design. */
export const PAGE_PRESETS = [
  { id: "presentation-16-9", label: "Presentation 16:9", hint: "Screens, projectors", width: 1920, height: 1080 },
  { id: "presentation-4-3", label: "Presentation 4:3", hint: "Older projectors", width: 1920, height: 1440 },
  { id: "portrait", label: "Portrait 9:16", hint: "Phones, stories, standing screens", width: 1080, height: 1920 },
  { id: "a4", label: "A4 document", hint: "Print, handouts, any number of pages", width: 1358, height: 1920, paper: "a4" },
];

const round = (value) => Math.round(value);

/** A usable page size: whole pixels, within the limits. Anything else is the default. */
export function normalizePageSize(value) {
  const width = Number(value?.width), height = Number(value?.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return { ...DEFAULT_PAGE };
  const fit = (side) => Math.min(MAX_PAGE_SIDE, Math.max(MIN_PAGE_SIDE, round(side)));
  return { width: fit(width), height: fit(height) };
}

export const orientationOf = (page) => (page.height > page.width ? "PORTRAIT" : "LANDSCAPE");

/** The preset a size matches, or null for a custom size. */
export const presetFor = (page) => PAGE_PRESETS.find((preset) => preset.width === page.width && preset.height === page.height) || null;

/** Printed paper for PDF export ("a4"), or null to make the PDF page the design's own size. Either way round. */
export const paperFor = (page) => (presetFor(page) || presetFor({ width: page.height, height: page.width }))?.paper || null;

/* The PDF page for a design, [width, height] in points. Normally the design's
   own size, one point per design pixel. An A4 design becomes a real A4 page
   (595 × 842 pt) instead, so it prints at the right size without "fit to
   page"; the design has A4's shape, so its picture fills the sheet exactly. */
const PAPER_POINTS = { a4: [595.28, 841.89] };
export function pdfPageFormat(page) {
  const paper = PAPER_POINTS[paperFor(page)];
  if (!paper) return [page.width, page.height];
  const [short, long] = paper;
  return orientationOf(page) === "PORTRAIT" ? [short, long] : [long, short];
}

export const samePageSize = (a, b) => a.width === b.width && a.height === b.height;

/*
 * Moves a design onto a page of another size, "scale to fit" like Canva's
 * resize: everything grows or shrinks by one factor, so nothing is stretched,
 * and is centred, so nothing falls off. Type sizes, strokes and corner radii
 * scale with it, or text would come out too big for its box on a smaller page.
 */
export function scalePagesToSize(pages, from, to) {
  const scale = Math.min(to.width / from.width, to.height / from.height);
  const offsetX = (to.width - from.width * scale) / 2, offsetY = (to.height - from.height * scale) / 2;
  if (scale === 1 && offsetX === 0 && offsetY === 0) return pages;
  const times = (value) => (typeof value === "number" ? value * scale : value);
  return pages.map((page) => ({
    ...page,
    elements: page.elements.map((element) => {
      const next = { ...element, x: element.x * scale + offsetX, y: element.y * scale + offsetY, w: element.w * scale, h: element.h * scale };
      for (const key of ["fontSize", "letterSpacing", "strokeWidth", "cornerRadius"]) if (key in element) next[key] = times(element[key]);
      if (next.fontSize !== undefined) next.fontSize = Math.max(1, next.fontSize);
      if (Array.isArray(element.cornerRadii)) next.cornerRadii = element.cornerRadii.map(times);
      // Shadows and glows: offsets, blur and spread are pixels too. Opacity is not.
      if (Array.isArray(element.effects)) next.effects = element.effects.map((effect) => ({ ...effect,
        ...Object.fromEntries(["x", "y", "blur", "spread"].filter((key) => key in effect).map((key) => [key, times(effect[key])])) }));
      return next;
    }),
  }));
}

/*
 * The CSS the page sheets need. Text, timers and radii are sized in cqw
 * against the sheet (see designPx), and --page-w / --page-h say how many
 * design pixels that sheet stands for. Set once on a wrapper; they inherit.
 */
export const pageCssVars = (page) => ({ "--page-w": page.width, "--page-h": page.height });

/* A design-pixel length as CSS, scaling with the sheet it is drawn on.
   100cqw is the sheet's width, and the sheet is --page-w design pixels wide.
   The 1920 fallback is the old fixed page, for any sheet outside a wrapper. */
export const designPx = (value) => `calc(${value * 100}cqw / var(--page-w, 1920))`;
