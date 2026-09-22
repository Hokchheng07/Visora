import test from "node:test";
import assert from "node:assert/strict";
import reducer, { editCancelled, editFinished, editStarted, editUpdated, elementInserted, elementSelected,
  gestureStarted, pageAdded, pageSelected, targetChanged, timerInserted, undo } from "../../redux/editorSlice.js";

import { checkInvariants } from "./layerModel.js";

// The layer rules are checked after every action (see layerModel.checkInvariants).
const send = (state, ...actions) => actions.reduce((next, action) => {
  const after = reducer(next, action);
  assert.deepEqual(checkInvariants(after), [], `after ${action.type}`);
  return after;
}, state);
const start = () => send(undefined, elementInserted("square"));
const only = (state) => state.pages[state.currentPage].elements[0];
const elementsTarget = (state, ids = state.selectedIds) => ({ kind: "elements", pageId: state.pages[state.currentPage].id, ids });

test("one slider drag is one undo step", () => {
  let state = start();
  const history = state.past.length, target = elementsTarget(state);
  state = send(state, editStarted({ token: "drag", target, property: "opacity" }));
  for (let value = 100; value >= 10; value--) state = send(state, editUpdated({ token: "drag", changes: { opacity: value / 100 } }));
  state = send(state, editFinished("drag"));
  assert.equal(only(state).opacity, 0.1);
  assert.equal(state.past.length, history + 1);
  state = send(state, undo());
  assert.equal(only(state).opacity, 1);
});

test("two separate drags are two undo steps", () => {
  let state = start();
  const history = state.past.length, target = elementsTarget(state);
  state = send(state, editStarted({ token: "a", target }), editUpdated({ token: "a", changes: { opacity: 0.5 } }), editFinished("a"));
  state = send(state, editStarted({ token: "b", target }), editUpdated({ token: "b", changes: { opacity: 0.2 } }), editFinished("b"));
  assert.equal(state.past.length, history + 2);
  assert.equal(only(send(state, undo())).opacity, 0.5);
});

test("a session that changes nothing adds no undo step", () => {
  let state = start();
  const history = state.past.length;
  state = send(state, editStarted({ token: "t", target: elementsTarget(state) }), editUpdated({ token: "t", changes: { opacity: 1 } }), editFinished("t"));
  assert.equal(state.past.length, history);
});

test("cancelling restores the value from before the session", () => {
  let state = start();
  const history = state.past.length;
  state = send(state, editStarted({ token: "t", target: elementsTarget(state) }), editUpdated({ token: "t", changes: { opacity: 0.3 } }), editCancelled("t"));
  assert.equal(only(state).opacity, 1);
  assert.equal(state.edit, null);
  assert.equal(state.past.length, history);
});

test("updates with a stale token are ignored", () => {
  let state = start();
  state = send(state, editStarted({ token: "live", target: elementsTarget(state) }), editUpdated({ token: "old", changes: { opacity: 0.1 } }));
  assert.equal(only(state).opacity, 1);
});

test("sessions work with nothing selected, for page settings", () => {
  let state = send(undefined, pageAdded());
  const history = state.past.length, pageId = state.pages[state.currentPage].id;
  assert.equal(state.selectedIds.length, 0);
  state = send(state, editStarted({ token: "bg", target: { kind: "page", pageId } }));
  for (const value of ["#111111", "#222222", "#333333"]) state = send(state, editUpdated({ token: "bg", changes: { background: { type: "COLOR", value } } }));
  state = send(state, editFinished("bg"));
  assert.equal(state.pages[state.currentPage].background.value, "#333333");
  assert.equal(state.past.length, history + 1);
});

test("a page session cannot write element fields onto the page", () => {
  let state = send(undefined, pageAdded());
  const pageId = state.pages[state.currentPage].id;
  state = send(state, editStarted({ token: "p", target: { kind: "page", pageId } }), editUpdated({ token: "p", changes: { elements: [], id: "hijack" } }), editFinished("p"));
  assert.equal(state.pages[state.currentPage].id, pageId);
});

test("another action settles the open session first, so it is never merged into it", () => {
  let state = start();
  const history = state.past.length, target = elementsTarget(state);
  state = send(state, editStarted({ token: "t", target }), editUpdated({ token: "t", changes: { opacity: 0.4 } }));
  state = send(state, elementInserted("circle"));
  assert.equal(state.edit, null);
  assert.equal(state.past.length, history + 2, "the session and the insert are separate steps");
});

test("undo during a session finishes it and then undoes it", () => {
  let state = start();
  state = send(state, editStarted({ token: "t", target: elementsTarget(state) }), editUpdated({ token: "t", changes: { opacity: 0.4 } }), undo());
  assert.equal(state.edit, null);
  assert.equal(only(state).opacity, 1);
});

test("changing page or selection commits the session instead of losing it", () => {
  let state = send(start(), pageAdded(), pageSelected(0));
  const target = elementsTarget(state, [only(state).id]);
  state = send(state, elementSelected(only(state).id), editStarted({ token: "t", target }), editUpdated({ token: "t", changes: { opacity: 0.6 } }));
  state = send(state, pageSelected(1));
  assert.equal(state.edit, null);
  assert.equal(state.pages[0].elements[0].opacity, 0.6);
});

test("a committed change lands on its target even after the selection moved on", () => {
  let state = send(start(), elementInserted("circle"));
  const [first, second] = state.pages[0].elements;
  const target = elementsTarget(state, [first.id]);
  state = send(state, elementSelected(second.id), targetChanged({ target, changes: { x: 42 } }));
  assert.equal(state.pages[0].elements[0].x, 42);
  assert.notEqual(state.pages[0].elements[1].x, 42);
});

test("timer targets merge timer settings and keep them valid", () => {
  let state = send(undefined, timerInserted());
  const timer = only(state), history = state.past.length;
  const target = { kind: "timer", pageId: state.pages[0].id, ids: [timer.id] };
  state = send(state, targetChanged({ target, changes: { controls: { reset: false }, durationMs: 5 } }));
  assert.equal(only(state).timer.controls.reset, false);
  assert.equal(only(state).timer.controls.pauseResume, true);
  assert.equal(only(state).timer.durationMs, 1000, "clamped to the one-second minimum");
  assert.equal(state.past.length, history + 1);
});

test("a session cannot start during a canvas gesture", () => {
  let state = send(start(), gestureStarted("move"));
  state = send(state, editStarted({ token: "t", target: elementsTarget(state) }));
  assert.equal(state.edit, null);
});

test("a canvas gesture settles an open session before it starts", () => {
  let state = start();
  const history = state.past.length;
  state = send(state, editStarted({ token: "t", target: elementsTarget(state) }), editUpdated({ token: "t", changes: { opacity: 0.5 } }), gestureStarted("move"));
  assert.equal(state.edit, null);
  assert.equal(state.past.length, history + 1);
  assert.ok(state.gesture);
});

test("targets that no longer exist are refused", () => {
  const state = start();
  const after = send(state, targetChanged({ target: { kind: "elements", pageId: state.pages[0].id, ids: ["gone"] }, changes: { x: 1 } }));
  assert.equal(after.past.length, state.past.length);
  assert.equal(send(state, editStarted({ token: "t", target: { kind: "page", pageId: "missing" } })).edit, null);
});
