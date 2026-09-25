import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PAGE, MAX_PAGE_SIDE, MIN_PAGE_SIDE, PAGE_PRESETS, normalizePageSize, orientationOf, paperFor, pdfPageFormat, presetFor, scalePagesToSize } from "./pageSize.js";
import { hydrateDocument, serializeDocument } from "./editorDocument.js";
import { clampSelectionDelta, fitElement, onPage, snapSelectionDelta } from "./elementGeometry.js";
import { pageNumberPlacement } from "./pageNumbers.js";
import editorReducer, { pageSizeChanged, textInserted, undo } from "../../redux/editorSlice.js";

const PORTRAIT = { width: 1080, height: 1920 };
const A4 = PAGE_PRESETS.find((preset) => preset.id === "a4");

test("a page size is whole pixels within limits, and anything unusable is the default", () => {
  assert.deepEqual(normalizePageSize({ width: 1080.4, height: "1920" }), PORTRAIT);
  assert.deepEqual(normalizePageSize({ width: 10, height: 99999 }), { width: MIN_PAGE_SIDE, height: MAX_PAGE_SIDE });
  for (const bad of [undefined, null, {}, { width: -5, height: 100 }, { width: "wide", height: 100 }]) {
    assert.deepEqual(normalizePageSize(bad), DEFAULT_PAGE);
  }
});

test("presets are recognised, and only A4 is printed paper", () => {
  assert.equal(presetFor(PORTRAIT).id, "portrait");
  assert.equal(presetFor({ width: 1000, height: 1000 }), null);
  assert.equal(paperFor(A4), "a4");
  assert.equal(paperFor(DEFAULT_PAGE), null);
  assert.equal(orientationOf(A4), "PORTRAIT");
  assert.equal(orientationOf(DEFAULT_PAGE), "LANDSCAPE");
  // A4's shape, to within a pixel.
  assert.ok(Math.abs(A4.width / A4.height - 210 / 297) < 1 / A4.height);
});

test("scale to fit keeps proportions, centres the design, and scales type with it", () => {
  const pages = [{ id: "p", elements: [{ id: "t", type: "text", x: 0, y: 0, w: 1920, h: 1080, fontSize: 100, letterSpacing: 10,
    effects: [{ type: "drop-shadow", x: 20, y: 40, blur: 10, spread: 0, opacity: 0.5 }] }] }];
  const [page] = scalePagesToSize(pages, DEFAULT_PAGE, PORTRAIT);
  const [text] = page.elements;
  const scale = 1080 / 1920;
  assert.equal(text.x, 0);
  assert.equal(text.w, 1080);
  assert.equal(text.h, 1080 * scale);
  assert.equal(text.y, (1920 - 1080 * scale) / 2);
  assert.equal(text.fontSize, 100 * scale);
  assert.equal(text.letterSpacing, 10 * scale);
  assert.deepEqual(text.effects[0], { type: "drop-shadow", x: 20 * scale, y: 40 * scale, blur: 10 * scale, spread: 0, opacity: 0.5 });
  assert.equal(scalePagesToSize(pages, DEFAULT_PAGE, DEFAULT_PAGE), pages);
});

test("geometry uses the page it is given", () => {
  const box = { x: 1500, y: 100, w: 100, h: 100, rotation: 0 };
  assert.equal(onPage(box), true);
  assert.equal(onPage(box, PORTRAIT), false);
  // The work area is one page on each side, so a portrait page stops sooner sideways.
  assert.equal(clampSelectionDelta([box], 5000, 0, PORTRAIT).x, 1080 * 2 - 1600);
  assert.equal(fitElement({ ...box, w: 9000 }, PORTRAIT).w, 1080 * 3);
  const snapped = snapSelectionDelta([{ x: 0, y: 0, w: 100, h: 100, rotation: 0 }], [], 487, 0, 8, PORTRAIT);
  assert.equal(snapped.x, 490); // centre 540 on the portrait page's middle
  assert.deepEqual(pageNumberPlacement("bottom-right", 200, 80, PORTRAIT), { x: 1080 - 46 - 200, y: 1920 - 36 - 80, textAlign: "right" });
});

test("the size is saved, loaded, and written with its orientation", () => {
  const saved = serializeDocument({ title: "Poster", pages: [{ id: "p", elements: [] }], canvas: PORTRAIT });
  assert.deepEqual(saved.canvas, PORTRAIT);
  assert.equal(saved.orientation, "PORTRAIT");
  assert.deepEqual(hydrateDocument(saved).canvas, PORTRAIT);
  // A document from before page sizes is the old 1920 × 1080 page.
  const { canvas: _gone, ...old } = saved;
  assert.deepEqual(hydrateDocument(old).canvas, DEFAULT_PAGE);
});

test("changing the size is one undo step that restores the layout too", () => {
  let state = editorReducer(undefined, { type: "init" });
  state = editorReducer(state, textInserted("heading"));
  const before = state.pages[0].elements[0];
  assert.equal(before.x, (1920 - before.w) / 2);

  state = editorReducer(state, pageSizeChanged(PORTRAIT));
  assert.deepEqual(state.canvas, PORTRAIT);
  assert.ok(state.pages[0].elements[0].fontSize < before.fontSize);

  // New elements are centred on the new page.
  state = editorReducer(state, textInserted("body"));
  const body = state.pages[0].elements[1];
  assert.equal(body.x, (1080 - body.w) / 2);
  assert.equal(body.y, (1920 - body.h) / 2);

  state = editorReducer(state, undo());
  state = editorReducer(state, undo());
  assert.deepEqual(state.canvas, DEFAULT_PAGE);
  assert.deepEqual(state.pages[0].elements[0], before);
});

test("the PDF page is the design in points, except A4, which is real A4 paper", () => {
  assert.deepEqual(pdfPageFormat(PORTRAIT), [1080, 1920]);
  assert.deepEqual(pdfPageFormat(A4), [595.28, 841.89]);
  assert.deepEqual(pdfPageFormat({ width: A4.height, height: A4.width }), [841.89, 595.28]);
});
