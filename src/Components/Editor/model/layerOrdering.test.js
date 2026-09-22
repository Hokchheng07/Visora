import test from "node:test";
import assert from "node:assert/strict";
import { selectionLevel, reorderLayers, stepLayers, moveIntoGroup, removeFromGroup, canGroup, groupSelection, ungroupSelection, groupBounds, checkInvariants, selectedGroup } from "./layerModel.js";
import reducer, { documentLoaded, elementsSelected, groupSelected, layersReordered, layersStepped, layersMovedIntoGroup, layersRemovedFromGroup, selectionGrouped, groupUngrouped, selectionCopied, selectionPasted, undo, redo } from "../../redux/editorSlice.js";

const fixture = () => ({ id: "p", groups: [{ id: "g", name: "Header" }], elements: [
  { id: "a" }, { id: "b", groupId: "g" }, { id: "c", groupId: "g" }, { id: "d" }, { id: "e" },
].map((item, index) => ({ x: index * 100, y: 100, w: 100, h: 100, rotation: 0, type: "shape", shape: "square", ...item })) });
const ids = (elements) => elements.map((item) => item.id);
function send(state, ...actions) { return actions.reduce((value, action) => {
  const next = reducer(value, action); assert.deepEqual(checkInvariants(next), [], action.type); return next;
}, state); }
const initial = (page = fixture()) => send(undefined, documentLoaded({ pages: [page] }));

test("selection distinguishes a whole group from its directly selected children", () => {
  const p = fixture();
  assert.deepEqual(selectionLevel(p, ["b", "c"], "group"), { level: "top" });
  assert.deepEqual(selectionLevel(p, ["b", "c"], "direct"), { level: "group", groupId: "g" });
  assert.equal(selectionLevel(p, ["b", "d"]), null);
  assert.equal(selectionLevel(p, ["missing"]), null);
});
test("reorder gathers non-adjacent layers and moves groups without splitting them", () => {
  const p = fixture();
  assert.deepEqual(ids(reorderLayers(p.elements, ["a", "e"], "d", "before")), ["b", "c", "a", "e", "d"]);
  assert.deepEqual(ids(reorderLayers(p.elements, ["b", "c"], "e", "after", "group")), ["a", "d", "e", "b", "c"]);
  assert.equal(reorderLayers(p.elements, ["b", "c"], "b", "after"), p.elements);
  assert.equal(reorderLayers(p.elements, ["b"], "e", "after"), p.elements);
});
test("all four step commands use blocks and stay inside the selected level", () => {
  const p = fixture();
  assert.deepEqual(ids(stepLayers(p, ["a"], "forward")), ["b", "c", "a", "d", "e"]);
  assert.deepEqual(ids(stepLayers(p, ["e"], "back")), ["e", "a", "b", "c", "d"]);
  assert.deepEqual(ids(stepLayers(p, ["b"], "front")), ["a", "c", "b", "d", "e"]);
  assert.deepEqual(ids(stepLayers(p, ["b", "c"], "backward", "group")), ["b", "c", "a", "d", "e"]);
  assert.equal(stepLayers(p, ["e"], "forward"), p.elements);
  assert.equal(stepLayers(p, ["b", "d"], "front"), p.elements);
});
test("moving into and out of a group preserves identity and cleans empty metadata", () => {
  const p = fixture();
  const into = moveIntoGroup(p, ["a", "e"], "g", "c", "after");
  assert.deepEqual(ids(into.elements), ["b", "c", "a", "e", "d"]);
  assert.equal(into.elements[2].groupId, "g");
  const out = removeFromGroup(p, ["b", "c"], "e", "after");
  assert.deepEqual(ids(out.elements), ["a", "d", "e", "b", "c"]);
  assert.deepEqual(out.groups, []);
  assert.equal(moveIntoGroup(p, ["b", "c"], "g"), p);
  assert.equal(removeFromGroup(p, ["b"], "g", "after"), p);
});
test("group creation gathers at the frontmost member and ungroup preserves artwork", () => {
  const p = fixture();
  assert.equal(canGroup(p, ["a", "b"]), false);
  const next = groupSelection(p, ["a", "e"], () => "new", "Group 1");
  assert.deepEqual(ids(next.elements), ["b", "c", "d", "a", "e"]);
  const restored = ungroupSelection(next, "new");
  assert.deepEqual(ids(restored.elements), ids(next.elements));
  assert.deepEqual(restored.memberIds, ["a", "e"]);
  assert.equal(groupBounds({ ...p, elements: p.elements.map((item) => item.id === "c" ? { ...item, visible: false } : item) }, "g").w, 100);
});
test("every move is atomic, preserves group selection, and round-trips through undo", () => {
  for (const action of [layersStepped({ direction: "front" }), layersReordered({ ids: ["b", "c"], targetId: "e", placement: "after", mode: "group" }),
    layersMovedIntoGroup({ ids: ["a"], groupId: "g" }), layersRemovedFromGroup({ ids: ["b"], targetId: "e", placement: "after" })]) {
    const before = send(initial(), groupSelected("g"));
    const moved = send(before, action);
    assert.equal(moved.past.length, before.past.length + 1);
    const restored = send(moved, undo());
    assert.deepEqual(restored.pages, before.pages);
    assert.equal(selectedGroup(restored)?.id, "g");
    assert.deepEqual(send(restored, redo()).pages, moved.pages);
  }
});
test("locked sources and locked destination groups refuse moves without history", () => {
  const p = fixture(); p.groups[0].locked = true;
  const state = send(initial(p), groupSelected("g"));
  for (const action of [layersStepped({ direction: "front" }), groupUngrouped(), layersMovedIntoGroup({ ids: ["a"], groupId: "g" }),
    layersRemovedFromGroup({ ids: ["b"], targetId: "e", placement: "after" })]) {
    const next = send(state, action); assert.equal(next, state);
  }
});
test("group, ungroup, paste and undo restore valid group selection", () => {
  let state = send(initial(), elementsSelected(["a", "e"]), selectionGrouped());
  const group = selectedGroup(state); assert.equal(group.name, "Group 1");
  state = send(state, groupUngrouped()); assert.equal(selectedGroup(state), null);
  state = send(state, undo()); assert.equal(selectedGroup(state)?.id, group.id);
  state = send(state, selectionCopied(), selectionPasted());
  assert.notEqual(selectedGroup(state)?.id, group.id);
  assert.equal(state.selectionMode, "group");
});
