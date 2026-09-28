import assert from "node:assert/strict";
import test from "node:test";
import reducer, { documentLoaded, documentSaved, elementInserted, imageSourcesReplaced } from "../../redux/editorSlice.js";
import { DEFAULT_TITLE, hasContent } from "./draftContent.js";

const blank = () => reducer(undefined, documentLoaded({}));

test("a blank new design is not worth a draft; any real work is", () => {
  const state = blank();
  assert.equal(state.title, DEFAULT_TITLE);
  assert.equal(hasContent(state), false);
  assert.equal(hasContent(reducer(state, elementInserted("rectangle"))), true);
  assert.equal(hasContent({ ...state, title: "Exam day" }), true);
  // A design made before the default name changed is still a blank one.
  assert.equal(hasContent({ ...state, title: "Untitled-1" }), false);
  assert.equal(hasContent({ ...state, pages: [...state.pages, state.pages[0]] }), true);
  assert.equal(hasContent({ ...state, pages: [{ ...state.pages[0], background: { type: "COLOR", value: "#112233" } }] }), true);
});

test("every loaded design gets a key unlike the one it replaced", () => {
  const first = blank();
  const second = reducer(first, documentLoaded({}));
  // Even a load that names the old key, or none, gets a new one.
  const third = reducer(second, { type: documentLoaded.type, payload: { documentKey: second.documentKey } });
  assert.ok(first.documentKey);
  assert.notEqual(second.documentKey, first.documentKey);
  assert.notEqual(third.documentKey, second.documentKey);
});

test("a save of a design that was replaced is not written onto the next one", () => {
  const state = blank();
  const saved = reducer(state, documentSaved({ remoteId: "b-1", version: 3, documentKey: state.documentKey }));
  assert.equal(saved.remoteId, "b-1");
  assert.equal(saved.version, 3);
  const stale = reducer(state, documentSaved({ remoteId: "b-old", version: 9, documentKey: "some-other-design" }));
  assert.equal(stale.remoteId, null);
  assert.equal(stale.version, 0);
});

test("uploaded pictures replace their inline data, without an undo step", () => {
  const state = reducer(undefined, documentLoaded({ pages: [{ id: "p", background: { type: "COLOR", value: "#FFFFFF" }, elements: [
    { id: "i", type: "image", src: "data:image/png;base64,AA", x: 0, y: 0, w: 10, h: 10, rotation: 0 },
    { id: "s", type: "shape", shape: "rectangle", fillImage: "data:image/png;base64,BB", x: 0, y: 0, w: 10, h: 10, rotation: 0 },
  ] }] }));
  const next = reducer(state, imageSourcesReplaced({ "data:image/png;base64,AA": "a.png", "data:image/png;base64,BB": "b.png" }));
  assert.equal(next.pages[0].elements[0].src, "a.png");
  assert.equal(next.pages[0].elements[1].fillImage, "b.png");
  assert.equal(next.past.length, state.past.length);
});
