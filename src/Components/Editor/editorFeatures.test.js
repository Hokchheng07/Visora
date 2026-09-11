import test from "node:test";
import assert from "node:assert/strict";
import reducer, { elementChanged, elementInserted, elementNudged, elementsSelected, pageAdded, pageMoved,
  selectionAligned, selectionCopied, selectionDistributed, selectionPasted, textInserted, undo } from "../redux/editorSlice.js";
import { bounds, elementsInRect, scaleSelection, selectionBounds, snapSelectionDelta } from "./elementGeometry.js";
import { compileAnimation } from "./animationPresets.js";
import { hydrateDocument, loadLocalDocument, saveLocalDocument, serializeDocument } from "./editorDocument.js";

function send(actions) { return actions.reduce((state, action) => reducer(state, action), undefined); }

test("multi-selection moves as one clamped group and undo is atomic", () => {
  let state = send([elementInserted("square"), elementInserted("circle")]);
  const ids = state.pages[0].elements.map((element) => element.id);
  state = reducer(state, elementsSelected(ids));
  state = reducer(state, elementNudged({ x: -5000, y: -5000 }));
  const box = selectionBounds(state.pages[0].elements);
  assert.ok(box.left >= 0 && box.top >= 0); assert.equal(state.selectedIds.length, 2);
  state = reducer(state, undo());
  assert.notEqual(selectionBounds(state.pages[0].elements).left, box.left);
});

test("alignment, clipboard cloning and page reorder preserve stable identities", () => {
  let state = send([elementInserted("square"), elementInserted("circle")]);
  const originalIds = state.pages[0].elements.map((element) => element.id);
  state = reducer(state, elementsSelected(originalIds)); state = reducer(state, selectionAligned("left"));
  assert.equal(selectionBounds([state.pages[0].elements[0]]).left, selectionBounds([state.pages[0].elements[1]]).left);
  state = reducer(state, selectionCopied()); state = reducer(state, selectionPasted());
  assert.equal(state.pages[0].elements.length, 4);
  assert.ok(state.selectedIds.every((id) => !originalIds.includes(id)));
  state = reducer(state, pageAdded()); const active = state.pages[1].id;
  state = reducer(state, pageMoved({ from: 1, to: 0 })); assert.equal(state.pages[0].id, active);
});

test("text presets create editable API-compatible text components", () => {
  const state = send([textInserted("heading")]); const element = state.pages[0].elements[0];
  assert.equal(element.type, "text"); assert.equal(element.fontFamily, "Poppins");
  const document = serializeDocument(state); const component = document.pages[0].components[0];
  assert.equal(component.type, "TEXT"); assert.deepEqual(component.position, { x: element.x, y: element.y });
  assert.equal(hydrateDocument(document).pages[0].elements[0].content, "Add a heading");
});

test("local persistence stores only the API backdrop document", () => {
  const values = new Map(); const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let state = send([elementInserted("star")]); state = reducer(state, selectionCopied());
  assert.equal(saveLocalDocument(state, storage), true);
  const saved = loadLocalDocument(storage);
  assert.equal(saved.pages[0].components.length, 1); assert.equal(saved.past, undefined); assert.equal(saved.copiedElements, undefined);
});

test("marquee and snapping use rotated bounds without mutating elements", () => {
  const selected = [{ id: "a", x: 920, y: 490, w: 80, h: 80, rotation: 45 }];
  assert.deepEqual(elementsInRect(selected, { left: 900, top: 470, right: 1050, bottom: 620 }), ["a"]);
  const before = structuredClone(selected);
  const snapped = snapSelectionDelta(selected, [], 1, 1, 20);
  assert.ok(snapped.guides.length); assert.deepEqual(selected, before);
  assert.ok(bounds(selected[0]).left < selected[0].x);
});

test("animation compiler is default-off, reduced-motion safe and immutable", () => {
  assert.equal(compileAnimation(undefined), null);
  const config = { preset: "rise", duration: 600 }; const before = structuredClone(config);
  assert.equal(compileAnimation(config).translateY[0], 32);
  const reduced = compileAnimation(config, true); assert.equal(reduced.translateY, undefined); assert.equal(reduced.duration, 200);
  assert.deepEqual(config, before);
});

test("distribute equalises the gaps between differently sized elements", () => {
  let state = reducer(undefined, { type: "init" }); const ids = [];
  for (const spec of [{ x: 100, w: 100 }, { x: 700, w: 600 }, { x: 1600, w: 100 }]) {
    state = reducer(state, elementInserted("square")); ids.push(state.selectedId);
    state = reducer(state, elementChanged({ x: spec.x, y: 400, w: spec.w, h: 200 }));
  }
  state = reducer(state, elementsSelected(ids));
  state = reducer(state, selectionDistributed("horizontal"));
  const row = ids.map((id) => state.pages[0].elements.find((element) => element.id === id)).sort((a, b) => a.x - b.x);
  const gaps = row.slice(1).map((element, index) => element.x - (row[index].x + row[index].w));
  // Even gaps, not evenly spaced corners: spacing the corners would leave 650 and 150 here.
  assert.ok(Math.abs(gaps[0] - gaps[1]) < 0.001, `gaps ${gaps}`);
  assert.equal(Math.round(row[0].x), 100);
  assert.equal(Math.round(row.at(-1).x), 1600);
  // Already-even selections must not spend a history entry.
  const settled = reducer(state, selectionDistributed("horizontal"));
  assert.equal(settled.past.length, state.past.length);
});

test("group resize stays on the sheet and scales text with the box", () => {
  const group = [{ id: "a", type: "shape", x: 100, y: 100, w: 400, h: 300, rotation: 0 },
    { id: "b", type: "shape", x: 900, y: 500, w: 400, h: 300, rotation: 0 }];
  const start = selectionBounds(group);
  for (const [handle, dx, dy, lock] of [["se", 9000, 9000, false], ["nw", -9000, -9000, false], ["se", 9000, 9000, true]]) {
    const box = selectionBounds(scaleSelection(group, start, handle, dx, dy, lock));
    assert.ok(box.left >= -0.01 && box.top >= -0.01 && box.right <= 1920.01 && box.bottom <= 1080.01,
      `${handle}${lock ? " locked" : ""} escaped: ${JSON.stringify(box)}`);
  }
  const text = [{ id: "t", type: "text", x: 100, y: 100, w: 800, h: 200, rotation: 0, fontSize: 100, letterSpacing: 10 }];
  const corner = scaleSelection(text, selectionBounds(text), "se", 800, 200, false)[0];
  assert.equal(Math.round(corner.fontSize), 200);
  assert.equal(Math.round(corner.letterSpacing), 20);
  // A side handle only widens the box, so the type keeps its size.
  assert.equal(scaleSelection(text, selectionBounds(text), "e", 800, 0, false)[0].fontSize, 100);
});

test("faded text keeps its opacity through a save and reload", () => {
  const editor = { documentId: "d1", title: "T", version: 0, pages: [{ id: "p1", elements: [{
    id: "t1", type: "text", content: "\u179f\u17bc\u1798\u179f\u17d2\u179c\u17b6\u1782\u1798\u1793\u17cd", x: 100, y: 100, w: 900, h: 180,
    rotation: 0, fill: "#29243a", opacity: 0.5, fontFamily: "Poppins", fontSize: 120, fontWeight: 700,
    fontStyle: "normal", textAlign: "center", lineHeight: 1.2, letterSpacing: 4, locked: false, visible: true }] }] };
  const restored = hydrateDocument(serializeDocument(editor)).pages[0].elements[0];
  assert.equal(restored.opacity, 0.5);
  assert.equal(restored.content, editor.pages[0].elements[0].content);
  assert.equal(restored.letterSpacing, 4);
});
