import test from "node:test";
import assert from "node:assert/strict";
import reducer, { elementInserted, elementSelected, pageAdded, pointEditFinished, pointEditStarted, pointsSelected,
  targetChanged, textInserted, undo } from "../redux/editorSlice.js";
import { checkInvariants } from "./layerModel.js";
import { editableSubpaths, moveNodes, vectorChanges } from "./vectorEdit.js";
import { hydrateDocument, serializeDocument } from "./editorDocument.js";

const send = (state, ...actions) => actions.reduce((next, action) => {
  const after = reducer(next, action);
  assert.deepEqual(checkInvariants(after), [], `after ${action.type}`);
  return after;
}, state);
const page = (state) => state.pages[state.currentPage];
const target = (state, id) => ({ kind: "elements", pageId: page(state).id, ids: [id] });

test("point editing opens only on an unlocked, visible shape, and selecting anything else closes it", () => {
  let state = send(undefined, textInserted("body"), elementInserted("star"));
  const [text, star] = page(state).elements;
  state = send(state, elementSelected(text.id), pointEditStarted());
  assert.equal(state.pointEdit, null, "text has no points");
  state = send(state, pointEditStarted(star.id));
  assert.deepEqual(state.pointEdit, { elementId: star.id, keys: [] });
  assert.deepEqual(state.selectedIds, [star.id]);
  state = send(state, elementSelected(text.id));
  assert.equal(state.pointEdit, null);
  state = send(state, targetChanged({ target: target(state, star.id), changes: { locked: true } }), pointEditStarted(star.id));
  assert.equal(state.pointEdit, null, "a locked shape cannot be edited");
  state = send(state, targetChanged({ target: target(state, star.id), changes: { locked: false } }), pointEditStarted(star.id), pageAdded());
  assert.equal(state.pointEdit, null, "changing page ends it");
});

test("points are picked, added to and toggled out of the selection", () => {
  let state = send(undefined, elementInserted("square"));
  state = send(state, pointEditStarted(page(state).elements[0].id), pointsSelected({ keys: ["0:0"] }));
  state = send(state, pointsSelected({ keys: ["0:2"], additive: true }));
  assert.deepEqual(state.pointEdit.keys, ["0:0", "0:2"]);
  state = send(state, pointsSelected({ keys: ["0:0"], additive: true }), pointEditFinished());
  assert.equal(state.pointEdit, null);
});

test("editing points is one undo step, and undo keeps you in point editing", () => {
  let state = send(undefined, elementInserted("square"));
  const square = page(state).elements[0];
  state = send(state, pointEditStarted(square.id));
  const history = state.past.length;
  const moved = vectorChanges(square, moveNodes(editableSubpaths(square), ["0:1"], 60, -40));
  state = send(state, targetChanged({ target: target(state, square.id), changes: moved }));
  assert.equal(page(state).elements[0].shape, "custom");
  assert.equal(state.past.length, history + 1);
  state = send(state, undo());
  assert.equal(page(state).elements[0].shape, "square");
  assert.equal(state.pointEdit?.elementId, square.id);
});

test("a custom shape saves its points and loads them back; broken points load as a rectangle", () => {
  let state = send(undefined, elementInserted("star"));
  const star = page(state).elements[0];
  state = send(state, targetChanged({ target: target(state, star.id), changes: vectorChanges(star, moveNodes(editableSubpaths(star), ["0:0"], 0, -30)) }));
  const saved = serializeDocument(state);
  const component = saved.pages[0].components[0];
  assert.equal(component.shape, "custom");
  assert.equal(component.vector.subpaths[0].nodes.length, 10);
  assert.equal(component.vector.subpaths[0].nodes[0].mirroring, "none");
  const loaded = hydrateDocument(saved).pages[0].elements[0];
  assert.deepEqual(loaded.vector, component.vector);
  // A preset never carries points.
  assert.equal("vector" in serializeDocument(send(undefined, elementInserted("star"))).pages[0].components[0], false);
  const broken = structuredClone(saved);
  broken.pages[0].components[0].vector = { subpaths: [{ nodes: [{ x: 0, y: 0 }] }] };
  const fallback = hydrateDocument(broken).pages[0].elements[0];
  assert.equal(fallback.shape, "rectangle");
  assert.equal(fallback.vector, undefined);
});
