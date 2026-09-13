import test from "node:test";
import assert from "node:assert/strict";
import reducer, { elementInserted, elementChanged, elementSelected, elementTransformed, elementReordered,
  gestureStarted, gestureFinished, gestureCancelled, undo, redo, pageAdded, pageSelected,
  pageCloned, pageDeleted, elementDeleted, elementNudged } from "../redux/editorSlice.js";
import { bounds, fitElement, resizeElement, radians } from "./elementGeometry.js";

function editor() {
  let state = reducer(undefined, { type: "test/init" });
  return { get state() { return state; }, send(action) { state = reducer(state, action); return state; },
    get element() { return state.pages[state.currentPage].elements.find((el) => el.id === state.selectedId); } };
}
const close = (actual, expected, epsilon = 0.01) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} ≠ ${expected}`);

test("many gesture updates create one undo step and redo restores the final geometry", () => {
  const e = editor(); e.send(elementInserted("square")); const original = e.element;
  e.send(gestureStarted("resize"));
  for (let w = 321; w <= 400; w++) e.send(elementTransformed({ token: "resize", changes: { w } }));
  e.send(gestureFinished("resize"));
  assert.equal(e.state.past.length, 2);
  e.send(undo()); assert.deepEqual(e.element, original);
  e.send(redo()); assert.equal(e.element.w, 400);
});

test("click-only and cancelled gestures preserve redo history", () => {
  const e = editor(); e.send(elementInserted("circle")); e.send(elementChanged({ fill: "#ff0000" })); e.send(undo());
  e.send(gestureStarted("drag")); e.send(gestureFinished("drag"));
  assert.equal(e.state.future.length, 1);
  const original = e.element;
  e.send(gestureStarted("drag")); e.send(elementTransformed({ token: "drag", changes: { x: 100 } }));
  e.send(gestureCancelled("drag")); assert.deepEqual(e.element, original);
  e.send(redo()); assert.equal(e.element.fill, "#ff0000");
});

test("a page switch cancels unfinished geometry and ignores a late release", () => {
  const e = editor(); e.send(elementInserted("square")); const first = e.element;
  e.send(pageAdded()); e.send(pageSelected(0)); e.send(elementSelected(first.id));
  e.send(gestureStarted("drag")); e.send(elementTransformed({ token: "drag", changes: { x: 100 } }));
  e.send(pageSelected(1)); e.send(elementTransformed({ token: "drag", changes: { x: 200 } })); e.send(gestureFinished("drag"));
  assert.deepEqual(e.state.pages[0].elements[0], first); assert.equal(e.state.pages[1].elements.length, 0);
});

test("page clones have independent element IDs and undo restores deletion with selection", () => {
  const e = editor(); e.send(elementInserted("star")); const original = e.state.pages[0];
  e.send(pageCloned(original, 0)); const copy = e.state.pages[1];
  assert.notEqual(copy.id, original.id); assert.notEqual(copy.elements[0].id, original.elements[0].id);
  e.send(elementSelected(copy.elements[0].id)); e.send(elementChanged({ fill: "#ffffff" }));
  assert.equal(e.state.pages[0].elements[0].fill, "#ad8dea");
  e.send(pageDeleted(1)); assert.equal(e.state.pages.length, 1);
  e.send(undo()); assert.equal(e.state.currentPage, 1); assert.equal(e.state.selectedId, copy.elements[0].id);
});

test("z-order, delete and undo preserve stable identities", () => {
  const e = editor(); e.send(elementInserted("square")); const a = e.element.id;
  e.send(elementInserted("circle")); const b = e.element.id;
  e.send(elementReordered(-1)); assert.deepEqual(e.state.pages[0].elements.map((el) => el.id), [b, a]);
  e.send(elementDeleted()); assert.equal(e.state.selectedId, null);
  e.send(undo()); assert.equal(e.state.selectedId, b);
  e.send(undo()); assert.deepEqual(e.state.pages[0].elements.map((el) => el.id), [a, b]);
});

test("history is capped, a new edit discards redo, and the last page cannot be deleted", () => {
  const e = editor(); e.send(elementInserted("pill"));
  for (let i = 0; i < 65; i++) e.send(elementNudged({ x: 1, y: 0 }));
  assert.equal(e.state.past.length, 50); e.send(undo()); e.send(elementNudged({ x: 0, y: 1 }));
  assert.equal(e.state.future.length, 0); e.send(pageDeleted(0)); assert.equal(e.state.pages.length, 1);
});

function point(el, sx, sy) {
  const a = radians(el.rotation);
  return { x: el.x + el.w / 2 + sx * el.w / 2 * Math.cos(a) - sy * el.h / 2 * Math.sin(a),
    y: el.y + el.h / 2 + sx * el.w / 2 * Math.sin(a) + sy * el.h / 2 * Math.cos(a) };
}

test("all eight rotated resize handles preserve the opposite anchor", () => {
  const start = { x: 700, y: 350, w: 320, h: 240, rotation: 45 };
  for (const handle of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
    const sx = handle.includes("e") ? 1 : handle.includes("w") ? -1 : 0;
    const sy = handle.includes("s") ? 1 : handle.includes("n") ? -1 : 0;
    const resized = resizeElement(start, handle, 35, 45);
    const before = point(start, -sx, -sy), after = point(resized, -sx, -sy);
    close(before.x, after.x); close(before.y, after.y);
  }
});

test("Shift corner resize preserves ratio and page bounds without shifting the anchor", () => {
  const start = { x: 700, y: 350, w: 320, h: 240, rotation: 45 };
  const resized = resizeElement(start, "se", 3000, 2500, true);
  close(resized.w / resized.h, start.w / start.h);
  const before = point(start, -1, -1), after = point(resized, -1, -1);
  close(before.x, after.x); close(before.y, after.y);
  const box = bounds(resized);
  assert.ok(box.right <= 1920.01 && box.bottom <= 1080.01);
});

test("rotated, oversized and out-of-bounds shapes are fitted inside the sheet", () => {
  for (const rotation of [0, 30, 45, 90, 135, 270]) {
    const result = fitElement({ x: -300, y: 950, w: 3000, h: 1500, rotation });
    const box = bounds(result);
    assert.ok(box.left >= -0.01 && box.top >= -0.01 && box.right <= 1920.01 && box.bottom <= 1080.01);
  }
});
