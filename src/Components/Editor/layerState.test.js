import test from "node:test";
import assert from "node:assert/strict";
import reducer, { canvasAllSelected, documentLoaded, editStarted, elementChanged, elementDeleted, elementInserted, elementNudged,
  layersStepped, elementSelected, elementsChanged, elementsSelected, gestureStarted, groupSelected, pageAdded, pageCloned,
  layersMovedToPage, pageCopied, pageSelected, selectionAligned, selectionCopied, selectionDistributed, selectionPasted, selectionUnlocked, targetChanged,
  timerChanged, timerInserted, undo } from "../redux/editorSlice.js";
import { checkInvariants, selectedGroup } from "./layerModel.js";
import { hydrateDocument, serializeDocument } from "./editorDocument.js";

/* Every action in this file goes through `send`, which checks the layer rules
   after each one, so no reducer can quietly split a group or reuse an id. */
function send(state, ...actions) {
  return actions.reduce((next, action) => {
    const after = reducer(next, action);
    assert.deepEqual(checkInvariants(after), [], `after ${action.type}`);
    return after;
  }, state);
}
const page = (state) => state.pages[state.currentPage];
const find = (state, id) => page(state).elements.find((element) => element.id === id);
const elementsTarget = (state, ids) => ({ kind: "elements", pageId: page(state).id, ids });
const groupTarget = (state, groupId) => ({ kind: "group", pageId: page(state).id, groupId });

/* A page of five layers, back to front: back, g1 and g2 in "Header", front, and a timer. */
function grouped() {
  const component = (uuid, x, extra = {}) => ({ uuid, type: "SHAPE", shape: "square", position: { x, y: 100 }, size: { width: 100, height: 100 }, rotation: 0, visible: true, locked: false, styles: { fill: "#AD8DEA" }, ...extra });
  const document = {
    clientSchemaVersion: 3, uuid: "doc", name: "Doc", version: 1,
    pages: [{ uuid: "p1", pageNumber: 1, name: "Agenda", background: { type: "COLOR", value: "#FFFFFF" },
      groups: [{ uuid: "header", name: "Header", visible: true, locked: false }],
      components: [component("back", 100), component("g1", 300, { groupUuid: "header" }), component("g2", 500, { groupUuid: "header" }), component("front", 700),
        { uuid: "clock", type: "COUNTDOWN_TIMER", position: { x: 900, y: 100 }, size: { width: 300, height: 150 }, rotation: 0, visible: true, locked: false, styles: {} }] }],
  };
  return send(undefined, documentLoaded(hydrateDocument(document)));
}

test("new pages are named Page N; duplicating Agenda makes Agenda copy with new group ids", () => {
  let state = send(grouped(), pageAdded());
  assert.equal(page(state).name, "Page 2");
  state = send(state, pageCloned(state.pages[0], 0));
  const [original, copy] = state.pages;
  assert.equal(copy.name, "Agenda copy");
  assert.notEqual(copy.groups[0].id, original.groups[0].id);
  assert.equal(copy.elements[1].groupId, copy.groups[0].id);
});

test("a copied page keeps its label when pasted somewhere else", () => {
  let state = send(undefined, pageAdded(), pageAdded());
  state = send(state, pageCopied(1));
  state = send(state, pageCloned(state.copiedPage, 2));
  assert.equal(state.pages[3].name, "Page 2 copy");
});

test("renaming a page or layer is one undo step; names are trimmed and empty names change nothing", () => {
  let state = grouped();
  const history = state.past.length;
  state = send(state, targetChanged({ target: { kind: "page", pageId: page(state).id }, changes: { name: "  Opening  " } }));
  assert.equal(page(state).name, "Opening");
  assert.equal(state.past.length, history + 1);
  state = send(state, targetChanged({ target: elementsTarget(state, ["front"]), changes: { name: "x".repeat(100) } }));
  assert.equal(find(state, "front").name.length, 80);
  const before = state.past.length;
  state = send(state, targetChanged({ target: groupTarget(state, page(state).groups[0].id), changes: { name: "   " } }));
  assert.equal(page(state).groups[0].name, "Header");
  assert.equal(state.past.length, before);
  state = send(state, undo());
  assert.equal(find(state, "front").name, undefined);
});

test("Select all and the canvas skip hidden and locked layers, including those in a hidden or locked group", () => {
  let state = grouped();
  state = send(state, targetChanged({ target: elementsTarget(state, ["back"]), changes: { visible: false } }));
  state = send(state, targetChanged({ target: elementsTarget(state, ["front"]), changes: { locked: true } }));
  state = send(state, targetChanged({ target: groupTarget(state, "header"), changes: { visible: false } }));
  state = send(state, canvasAllSelected());
  assert.deepEqual(state.selectedIds, ["clock"]);
  // Showing the group gives each member back its own visibility.
  state = send(state, targetChanged({ target: groupTarget(state, "header"), changes: { visible: true } }));
  assert.equal(find(state, "g1").visible, true);
});

test("a locked layer refuses every edit, and a refused edit adds no undo step", () => {
  let state = grouped();
  state = send(state, targetChanged({ target: elementsTarget(state, ["front"]), changes: { locked: true } }));
  state = send(state, elementsSelected(["back", "front", "g1"]));
  const frozen = JSON.stringify(state.pages), history = state.past.length;
  const refused = [
    elementChanged({ fill: "#000000" }), elementNudged({ x: 10, y: 0 }), elementDeleted(),
    selectionAligned("left"), selectionDistributed("horizontal"), gestureStarted("drag"),
    targetChanged({ target: elementsTarget(state, ["front"]), changes: { x: 5 } }),
    editStarted({ token: "t", target: elementsTarget(state, ["front"]), property: "x" }),
  ];
  for (const action of refused) {
    state = send(state, action);
    assert.equal(JSON.stringify(state.pages), frozen, `${action.type} changed a locked layer`);
    assert.equal(state.past.length, history, `${action.type} added an undo step`);
  }
  assert.equal(state.gesture, null);
  assert.equal(state.edit, null);
  state = send(state, elementSelected("front"), layersStepped({ direction: "backward" }));
  assert.equal(JSON.stringify(state.pages), frozen);
});

test("a canvas gesture cannot push a locked layer, even when its id arrives in the update", () => {
  let state = grouped();
  state = send(state, targetChanged({ target: elementsTarget(state, ["front"]), changes: { locked: true } }));
  state = send(state, elementSelected("back"), gestureStarted("drag"));
  const frozen = JSON.stringify(page(state).elements);
  state = send(state, elementsChanged({ token: "drag", elements: [{ ...find(state, "front"), x: 0 }] }));
  assert.equal(JSON.stringify(page(state).elements), frozen);
});

test("a group's lock protects its members, and a locked timer keeps its settings", () => {
  let state = grouped();
  state = send(state, targetChanged({ target: groupTarget(state, "header"), changes: { locked: true } }));
  state = send(state, elementSelected("g1"), elementNudged({ x: 10, y: 0 }));
  assert.equal(find(state, "g1").x, 300);
  state = send(state, targetChanged({ target: elementsTarget(state, ["clock"]), changes: { locked: true } }));
  state = send(state, elementSelected("clock"), timerChanged({ durationMs: 60000 }));
  assert.equal(find(state, "clock").timer.durationMs, 5 * 60 * 1000);
});

test("locked layers can still be renamed, hidden, copied and unlocked in one step", () => {
  let state = grouped();
  state = send(state, targetChanged({ target: groupTarget(state, "header"), changes: { locked: true } }));
  state = send(state, targetChanged({ target: elementsTarget(state, ["g1"]), changes: { locked: true } }));
  state = send(state, targetChanged({ target: elementsTarget(state, ["g1"]), changes: { name: "Logo", visible: false } }));
  assert.equal(find(state, "g1").name, "Logo");
  assert.equal(find(state, "g1").visible, false);
  state = send(state, elementSelected("g1"), selectionCopied());
  assert.equal(state.copiedElements.length, 1);
  const history = state.past.length;
  state = send(state, selectionUnlocked());
  assert.equal(find(state, "g1").locked, false);
  assert.equal(page(state).groups[0].locked, false);
  assert.equal(state.past.length, history + 1);
});

test("group selection is worked out from the selection, so undo cannot leave a stale one", () => {
  let state = send(grouped(), groupSelected("header"));
  assert.deepEqual(state.selectedIds, ["g1", "g2"]);
  assert.equal(selectedGroup(state).name, "Header");
  state = send(state, elementSelected("g1"));
  assert.equal(selectedGroup(state), null);
  state = send(state, groupSelected("header"), elementNudged({ x: 10, y: 0 }), undo());
  assert.equal(selectedGroup(state)?.id, "header");
});

test("reordering never splits a group, and deleting a group's members removes the group", () => {
  let state = send(grouped(), elementSelected("back"), layersStepped({ direction: "forward" }));
  assert.deepEqual(page(state).elements.map((element) => element.id), ["g1", "g2", "back", "front", "clock"]);
  state = send(state, elementSelected("g2"), layersStepped({ direction: "back" }));
  assert.deepEqual(page(state).elements.map((element) => element.id), ["g2", "g1", "back", "front", "clock"]);
  state = send(state, elementsSelected(["g1", "g2"]), elementDeleted());
  assert.deepEqual(page(state).groups, []);
});

test("pasting a whole group makes a new group; a layer copied out of a group pastes ungrouped", () => {
  let state = send(grouped(), groupSelected("header"), selectionCopied(), selectionPasted());
  assert.equal(page(state).groups.length, 2);
  const pasted = page(state).elements.slice(-2);
  assert.equal(pasted[0].groupId, page(state).groups[1].id);
  state = send(state, selectionPasted());
  assert.equal(page(state).groups.length, 3);
  state = send(state, elementSelected("g1"), selectionCopied(), selectionPasted());
  assert.equal(page(state).elements.at(-1).groupId, undefined);
});

test("names and groups survive save and load; old documents load unchanged", () => {
  let state = grouped();
  state = send(state, targetChanged({ target: elementsTarget(state, ["front"]), changes: { name: "Title" } }));
  const saved = serializeDocument(state);
  assert.equal(saved.pages[0].name, "Agenda");
  assert.deepEqual(saved.pages[0].groups, [{ uuid: "header", name: "Header", visible: true, locked: false }]);
  assert.equal(saved.pages[0].components[1].groupUuid, "header");
  assert.equal(saved.pages[0].components[3].name, "Title");
  assert.deepEqual(serializeDocument(send(undefined, documentLoaded(hydrateDocument(saved)))).pages, saved.pages);

  // An untouched page writes none of the new fields.
  const plain = serializeDocument(send(undefined, elementInserted("square"), timerInserted()));
  assert.equal("name" in plain.pages[0], false);
  assert.equal("groups" in plain.pages[0], false);
  assert.ok(plain.pages[0].components.every((component) => !("name" in component) && !("groupUuid" in component)));
});

test("loading repairs bad group data instead of crashing", () => {
  const component = (uuid, extra = {}) => ({ uuid, type: "SHAPE", shape: "square", position: { x: 0, y: 0 }, size: { width: 50, height: 50 }, styles: {}, ...extra });
  const hydrated = hydrateDocument({
    clientSchemaVersion: 3, uuid: "d", name: "D", version: 0,
    pages: [
      { uuid: "p1", groups: [{ uuid: "g" }, { uuid: "lonely" }], components: [component("a", { groupUuid: "g" }), component("b"), component("c", { groupUuid: "g" }), component("d", { groupUuid: "ghost" })] },
      { uuid: "p2", groups: [{ uuid: "g", name: "Same id" }], components: [component("e", { groupUuid: "g" })] },
    ],
  });
  const state = send(undefined, documentLoaded(hydrated));
  assert.deepEqual(state.pages[0].elements.map((element) => element.id), ["b", "a", "c", "d"]);
  assert.equal(state.pages[0].elements[3].groupId, undefined);
  assert.deepEqual(state.pages[0].groups.map((group) => group.id), ["g"]);
  assert.notEqual(state.pages[1].groups[0].id, "g");
  assert.equal(state.pages[1].elements[0].groupId, state.pages[1].groups[0].id);
});

test("moving a whole group to another page carries its metadata and follows it there", () => {
  let state = send(grouped(), pageAdded(), pageSelected(0));
  const history = state.past.length;
  state = send(state, groupSelected("header"), layersMovedToPage({ pageIndex: 1 }));
  assert.equal(state.currentPage, 1);
  assert.deepEqual(state.pages[0].groups, []);
  assert.deepEqual(state.pages[0].elements.map((element) => element.id), ["back", "front", "clock"]);
  // Landed at the front, in their old order, still one group, still selected as a group.
  assert.deepEqual(state.pages[1].elements.map((element) => element.id), ["g1", "g2"]);
  assert.equal(state.pages[1].groups[0].name, "Header");
  assert.equal(state.pages[1].elements[0].groupId, "header");
  assert.equal(selectedGroup(state).id, "header");
  state = send(state, undo());
  assert.equal(state.currentPage, 0);
  assert.equal(state.pages[1].elements.length, 0);
  assert.deepEqual(state.pages[0].elements.map((element) => element.id), ["back", "g1", "g2", "front", "clock"]);
  assert.equal(state.past.length, history);
});

test("a layer moved out of a group leaves the group behind; a locked layer does not move", () => {
  let state = send(grouped(), pageAdded(), pageSelected(0));
  state = send(state, elementSelected("g1"), layersMovedToPage({ pageIndex: 1 }));
  assert.equal(state.pages[1].elements[0].id, "g1");
  assert.equal(state.pages[1].elements[0].groupId, undefined);
  assert.deepEqual(state.pages[1].groups, []);
  // One member left: the group survives on the source page.
  assert.equal(state.pages[0].groups.length, 1);

  state = send(state, pageSelected(0));
  state = send(state, targetChanged({ target: elementsTarget(state, ["front"]), changes: { locked: true } }));
  const frozen = JSON.stringify(state.pages);
  state = send(state, elementSelected("front"), layersMovedToPage({ pageIndex: 1 }));
  assert.equal(JSON.stringify(state.pages), frozen);
  assert.equal(state.currentPage, 0);
});

test("moving to the current page, or with nothing selected, changes nothing", () => {
  let state = send(grouped(), pageAdded(), pageSelected(0), elementSelected("back"));
  const history = state.past.length, frozen = JSON.stringify(state.pages);
  state = send(state, layersMovedToPage({ pageIndex: 0 }), layersMovedToPage({ pageIndex: 7 }));
  state = send(state, elementSelected(null), layersMovedToPage({ pageIndex: 1 }));
  assert.equal(JSON.stringify(state.pages), frozen);
  assert.equal(state.past.length, history);
});

test("several layers keep their order and their relative stacking when moved", () => {
  let state = send(grouped(), pageAdded(), pageSelected(0));
  state = send(state, elementsSelected(["clock", "back"]), layersMovedToPage({ pageIndex: 1 }));
  assert.deepEqual(state.pages[1].elements.map((element) => element.id), ["back", "clock"]);
  assert.deepEqual(state.selectedIds, ["back", "clock"]);
  assert.deepEqual(state.pages[0].elements.map((element) => element.id), ["g1", "g2", "front"]);
});
