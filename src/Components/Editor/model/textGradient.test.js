import test from "node:test";
import assert from "node:assert/strict";
import { textGradientStyle, defaultGradient } from "./shapePaint.js";
import { textMarkup } from "../export/textOutline.js";

test("gradient text clips the ramp to the letters", () => {
  const style = textGradientStyle(defaultGradient("#4A0E6B", "#8A1FA8"));
  assert.match(style.backgroundImage, /linear-gradient/);
  assert.equal(style.color, "transparent");
  assert.equal(style.caretColor, "#4A0E6B");
  assert.equal(textGradientStyle(null), null);
});

test("outlined text uses the gradient across its box", () => {
  const svg = textMarkup({ id: "a", w: 200, h: 50, fill: "#000000", gradient: defaultGradient("#4A0E6B", "#8A1FA8") }, "M0,0Z");
  assert.match(svg, /<linearGradient id="text-fill-a"/);
  assert.match(svg, /fill="url\(#text-fill-a\)"/);
});

test("gradient text survives save and load", async () => {
  const slice = await import("../../redux/editorSlice.js"); const { textInserted, targetChanged } = slice; const editorReducer = slice.default;
  const { serializeDocument, hydrateDocument } = await import("./editorDocument.js");
  let state = editorReducer(undefined, { type: "init" });
  state = editorReducer(state, textInserted("heading"));
  const page = state.pages?.[0] || state.document?.pages?.[0];
  const text = (page?.elements || []).find((el) => el.type === "text");
  assert.ok(text, "text inserted");
  state = editorReducer(state, targetChanged({ target: { kind: "elements", pageId: page.id, ids: [text.id] }, changes: { gradient: defaultGradient("#4A0E6B", "#8A1FA8") } }));
  const saved = serializeDocument(state);
  const comp = saved.pages.flatMap((p) => p.components).find((c) => c.type === "TEXT");
  assert.equal(comp.styles.gradient.stops[1].color, "#8A1FA8");
  const back = hydrateDocument(saved).pages.flatMap((p) => p.elements).find((el) => el.type === "text");
  assert.equal(back.gradient.stops[0].color, "#4A0E6B");
});
