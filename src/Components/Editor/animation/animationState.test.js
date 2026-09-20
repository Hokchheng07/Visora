import test from "node:test";
import assert from "node:assert/strict";
import reducer, { elementInserted, elementsSelected, animationAdded, animationChanged, animationRemoved, pageAdded, pageSelected, pageCloned, layersMovedToPage, selectionCopied, selectionPasted, elementDeleted, undo, editStarted, editUpdated, editFinished } from "../../redux/editorSlice.js";
import { validateTimeline } from "./animationTimeline.js";
function setup() {
  let s = reducer(undefined, { type: "init" });
  s = reducer(s, elementInserted("square")); s = reducer(s, animationAdded({ kind: "entrance", preset: "fade" }));
  return s;
}
test("group/multiple selection adds one independent row per element", () => {
  let s = reducer(undefined, { type: "init" });
  s = reducer(s, elementInserted("square")); s = reducer(s, elementInserted("circle"));
  s = reducer(s, elementsSelected(s.pages[0].elements.map((e) => e.id)));
  s = reducer(s, animationAdded({ kind: "entrance", preset: "rise", trigger: "click" }));
  assert.deepEqual(s.pages[0].animations.map((r) => r.trigger), ["click", "with"]);
  assert.equal(new Set(s.pages[0].animations.map((r) => r.id)).size, 2);
});
test("copy, duplicate, move and undo preserve row ownership and morph identities", () => {
  let s = setup(); const source = s.pages[0], original = source.elements[0];
  s = reducer(s, pageCloned(source, 0));
  const clone = s.pages[1];
  assert.equal(clone.elements[0].morphId, original.id);
  assert.equal(clone.animations[0].elementId, clone.elements[0].id);
  assert.notEqual(clone.animations[0].id, source.animations[0].id);
  s = reducer(s, elementsSelected([clone.elements[0].id]));
  s = reducer(s, selectionCopied()); s = reducer(s, selectionPasted());
  assert.notEqual(s.pages[1].elements[1].morphId, original.id);
  assert.equal(s.pages[1].animations[1].trigger, "click");
  const copiedRow = s.pages[1].animations[1];
  s = reducer(s, layersMovedToPage({ pageIndex: 0 }));
  assert.equal(s.pages[0].animations[1].id, copiedRow.id);
  assert.equal(s.pages[1].animations.length, 1);
  s = reducer(s, elementDeleted()); assert.equal(s.pages[0].animations.length, 1);
  s = reducer(s, undo()); assert.equal(s.pages[0].animations.length, 2);
  for (const p of s.pages) assert.deepEqual(validateTimeline(p), []);
});
test("pasting on an empty page preserves morph key and automatic entry", () => {
  let s = setup(), id = s.selectedId;
  s = reducer(s, selectionCopied()); s = reducer(s, pageAdded()); s = reducer(s, selectionPasted());
  assert.equal(s.pages[1].elements[0].morphId, id);
  assert.equal(s.pages[1].animations[0].trigger, "after");
  s = reducer(s, pageSelected(0)); s = reducer(s, elementsSelected([id]));
  s = reducer(s, layersMovedToPage({ pageIndex: 1 }));
  assert.notEqual(s.pages[1].elements[1].morphId, id);
});
test("invalid edits are refused and a timing slider is one undo step", () => {
  let s = setup(); const row = s.pages[0].animations[0], before = s.past.length;
  // picking another entrance swaps the preset instead of being refused
  s = reducer(s, animationAdded({ kind: "entrance", preset: "rise" }));
  assert.equal(s.pages[0].animations.length, 1);
  assert.equal(s.pages[0].animations[0].preset, "rise");
  assert.equal(s.past.length, before + 1);
  s = reducer(s, undo());
  assert.equal(s.pages[0].animations[0].preset, "fade");
  s = reducer(s, animationChanged({ id: row.id, changes: { durationMs: -1 } }));
  assert.equal(s.pages[0].animations[0].durationMs, 520);
  s = reducer(s, editStarted({ token: "drag", target: { kind: "animation", pageId: s.pages[0].id, rowId: row.id } }));
  for (const durationMs of [600, 800, 1200]) s = reducer(s, editUpdated({ token: "drag", changes: { durationMs } }));
  s = reducer(s, editFinished("drag")); assert.equal(s.past.length, before + 1);
  s = reducer(s, undo()); assert.equal(s.pages[0].animations[0].durationMs, 520);
  s = reducer(s, animationRemoved(row.id)); assert.equal(s.pages[0].animations.length, 0);
});
test("None removes the selected animation phase in one undoable edit", () => {
  let s = setup();
  s = reducer(s, animationAdded({ kind: "exit", preset: "fade", trigger: "after" }));
  const before = s.past.length;
  s = reducer(s, animationAdded({ kind: "entrance", preset: "none" }));
  assert.deepEqual(s.pages[0].animations.map((item) => item.kind), ["exit"]);
  assert.equal(s.past.length, before + 1);
  s = reducer(s, undo());
  assert.deepEqual(s.pages[0].animations.map((item) => item.kind), ["entrance", "exit"]);
});
