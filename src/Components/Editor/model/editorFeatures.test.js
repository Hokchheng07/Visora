import test from "node:test";
import assert from "node:assert/strict";
import reducer, { animationAdded, elementChanged, elementInserted, elementNudged, elementsSelected, pageAdded, pageMoved,
  imageInserted, selectionAligned, selectionCopied, selectionDistributed, selectionPasted, targetChanged, textInserted, timerChanged,
  timerInserted, undo } from "../../redux/editorSlice.js";
import { bounds, elementsInRect, onPage, scaleSelection, selectionBounds, snapSelectionDelta, WORK_AREA } from "./elementGeometry.js";
import { compileAnimation } from "../animation/animationPresets.js";
import { EDITOR_SCHEMA_VERSION, TIMER_MAX_MS, TIMER_MIN_MS, defaultTimer, hydrateDocument, loadLocalDocument,
  migrateDocument, normalizeTimer, saveLocalDocument, serializeDocument, validateDocument } from "./editorDocument.js";
import { controlState, formatDuration, startStopRole } from "../timer/timerFormat.js";

import { checkInvariants } from "./layerModel.js";

// The layer rules are checked after every action (see layerModel.checkInvariants).
function send(actions) {
  return actions.reduce((state, action) => {
    const after = reducer(state, action);
    assert.deepEqual(checkInvariants(after), [], `after ${action.type}`);
    return after;
  }, undefined);
}

test("multi-selection moves as one group, off the page but inside the work area, and undo is atomic", () => {
  let state = send([elementInserted("square"), elementInserted("circle")]);
  const ids = state.pages[0].elements.map((element) => element.id);
  state = reducer(state, elementsSelected(ids));
  state = reducer(state, elementNudged({ x: -5000, y: -5000 }));
  const box = selectionBounds(state.pages[0].elements);
  // Stopped by the edge of the work area, a page out from the sheet — not by the sheet.
  assert.ok(box.left >= WORK_AREA.left - 0.01 && box.top >= WORK_AREA.top - 0.01, JSON.stringify(box));
  assert.ok(box.left < 0 && box.top < 0, "the selection should now sit off the page");
  assert.ok(state.pages[0].elements.every((element) => !onPage(element)));
  assert.equal(state.selectedIds.length, 2);
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

test("new text presets leave room for their Poppins label, padding and line height", () => {
  // Browser-measured label widths at the authored font sizes and weights.
  const labelWidths = { heading: 900, subheading: 675, body: 334 };
  for (const [preset, width] of Object.entries(labelWidths)) {
    const element = send([textInserted(preset)]).pages[0].elements[0];
    assert.ok(element.w >= width + element.fontSize * .16, `${preset} must fit its label and horizontal padding`);
    assert.ok(element.h >= element.fontSize * (element.lineHeight + .16), `${preset} must fit a padded line`);
    assert.equal(element.x + element.w / 2, 960);
    assert.equal(element.y + element.h / 2, 540);
  }
});

test("local persistence stores only the API backdrop document", () => {
  const values = new Map(); const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  let state = send([elementInserted("star")]); state = reducer(state, selectionCopied());
  assert.equal(saveLocalDocument(state, storage), true);
  const saved = loadLocalDocument(storage);
  assert.equal(saved.pages[0].components.length, 1); assert.equal(saved.past, undefined); assert.equal(saved.copiedElements, undefined);
});

test("an uploaded image keeps its proportions, fits the page and is undoable", () => {
  const state = send([imageInserted("b88b4aa6.png", { width: 4000, height: 2000 }, "Logo.png")]);
  const [image] = state.pages[0].elements;
  assert.equal(image.type, "image"); assert.equal(image.src, "b88b4aa6.png"); assert.equal(image.name, "Logo.png");
  assert.equal(image.w / image.h, 2);
  assert.ok(image.w <= 1920 * 0.6 && image.h <= 1080 * 0.6);
  assert.equal(image.lockAspect, true); assert.deepEqual(state.selectedIds, [image.id]);
  // a small photo is not blown up past its own size
  const small = send([imageInserted("s.png", { width: 200, height: 100 })]).pages[0].elements[0];
  assert.deepEqual([small.w, small.h], [200, 100]);
  // no fileName, no element
  assert.equal(send([imageInserted("")]).pages[0].elements.length, 0);
  assert.equal(reducer(state, undo()).pages[0].elements.length, 0);
});

test("images save only their storage fileName and load back unchanged", () => {
  let state = send([imageInserted("b88b4aa6.png", { width: 800, height: 600 })]);
  const id = state.pages[0].elements[0].id;
  state = reducer(state, targetChanged({ target: { kind: "elements", pageId: state.pages[0].id, ids: [id] },
    changes: { cornerRadius: 24, opacity: 0.5, flipX: true, lockAspect: false } }));
  const saved = serializeDocument(state);
  const [component] = saved.pages[0].components;
  assert.equal(component.type, "IMAGE"); assert.deepEqual(component.image, { fileName: "b88b4aa6.png" });
  assert.equal(JSON.stringify(saved).includes("http"), false);
  const [loaded] = hydrateDocument(saved).pages[0].elements;
  assert.equal(loaded.type, "image"); assert.equal(loaded.src, "b88b4aa6.png");
  assert.equal(loaded.cornerRadius, 24); assert.equal(loaded.opacity, 0.5);
  assert.equal(loaded.flipX, true); assert.equal(loaded.lockAspect, false);
});

test("Whole page scope animates every unlocked, visible element without a selection", () => {
  let state = send([elementInserted("square"), elementInserted("circle"), elementInserted("triangle")]);
  const page = state.pages[0];
  const [first, second, third] = page.elements.map((element) => element.id);
  // one hidden, one locked: neither should be animated
  state = reducer(state, elementsSelected([second]));
  state = reducer(state, elementChanged({ visible: false }));
  state = reducer(state, elementsSelected([third]));
  state = reducer(state, elementChanged({ locked: true }));
  state = reducer(state, elementsSelected([]));
  state = reducer(state, animationAdded({ kind: "entrance", preset: "fade", scope: "page" }));
  const rows = state.pages[0].animations;
  assert.deepEqual(rows.map((row) => row.elementId), [first]);
  // the selection scope still needs a selection
  const untouched = reducer(state, animationAdded({ kind: "exit", preset: "fade", scope: "selection" }));
  assert.equal(untouched.pages[0].animations.length, rows.length);
});

test("a Khmer library element saves its library id and colour, and loads them back", () => {
  let state = send([imageInserted("library:corners/top-left", { width: 1254, height: 1254 }, "Khmer corner, top left")]);
  const id = state.pages[0].elements[0].id;
  state = reducer(state, targetChanged({ target: { kind: "elements", pageId: state.pages[0].id, ids: [id] }, changes: { fill: "#c4443e" } }));
  const [component] = serializeDocument(state).pages[0].components;
  assert.deepEqual(component.image, { fileName: "library:corners/top-left" });
  assert.equal(component.styles.fill, "#C4443E");
  const [loaded] = hydrateDocument(serializeDocument(state)).pages[0].elements;
  assert.equal(loaded.src, "library:corners/top-left"); assert.equal(loaded.fill, "#C4443E");
  // an uploaded photo never gains a colour
  const photo = serializeDocument(send([imageInserted("b88b4aa6.png", { width: 800, height: 600 })])).pages[0].components[0];
  assert.equal("fill" in photo.styles, false);
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

test("group resize stays in the work area and scales text with the box", () => {
  const group = [{ id: "a", type: "shape", x: 100, y: 100, w: 400, h: 300, rotation: 0 },
    { id: "b", type: "shape", x: 900, y: 500, w: 400, h: 300, rotation: 0 }];
  const start = selectionBounds(group);
  for (const [handle, dx, dy, lock] of [["se", 9000, 9000, false], ["nw", -9000, -9000, false], ["se", 9000, 9000, true]]) {
    const box = selectionBounds(scaleSelection(group, start, handle, dx, dy, lock));
    assert.ok(box.left >= WORK_AREA.left - 0.01 && box.top >= WORK_AREA.top - 0.01
      && box.right <= WORK_AREA.right + 0.01 && box.bottom <= WORK_AREA.bottom + 0.01,
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

test("a timer survives save and reload with every configured field intact", () => {
  let state = reducer(undefined, { type: "init" });
  state = reducer(state, timerInserted("MM:SS"));
  state = reducer(state, timerChanged({
    durationMs: 90 * 60 * 1000,
    onComplete: { sound: "bell", message: "\u179f\u17bc\u1798\u17a2\u179a\u1782\u17bb\u178e" },
    controls: { reset: false },
  }));
  state = reducer(state, elementChanged({ fill: "#FFC21C", fontSize: 144 }));

  const before = state.pages[0].elements[0];
  const restored = hydrateDocument(serializeDocument(state)).pages[0].elements[0];

  assert.equal(restored.type, "timer");
  assert.equal(restored.timer.durationMs, 90 * 60 * 1000);
  assert.equal(restored.timer.format, "MM:SS");
  assert.equal(restored.timer.onComplete.sound, "bell");
  // A Khmer completion message has to round-trip byte for byte.
  assert.equal(restored.timer.onComplete.message, before.timer.onComplete.message);
  assert.equal(restored.timer.controls.reset, false);
  assert.equal(restored.timer.controls.pauseResume, true);
  assert.equal(restored.fill, "#FFC21C");
  assert.equal(restored.fontSize, 144);
  assert.equal(restored.opacity, 1);
  assert.equal(Math.round(restored.w), Math.round(before.w));
});

test("version-1 documents still open instead of being replaced by a blank one", () => {
  // Exactly what is sitting in a user's localStorage today.
  const v1 = {
    clientSchemaVersion: 1,
    uuid: "backdrop-local", name: "Graduation 2026", version: 0,
    orientation: "LANDSCAPE", canvas: { width: 1920, height: 1080 },
    pages: [{
      uuid: "page-a", pageNumber: 1, background: { type: "COLOR", value: "#FFFFFF" },
      components: [{
        uuid: "t1", type: "TEXT", content: "Welcome",
        position: { x: 100, y: 100 }, size: { width: 900, height: 180 },
        rotation: 0, layerIndex: 0, locked: false, visible: true,
        styles: { fontFamily: "Poppins", fontSize: 120, color: "#29243a", opacity: 1 },
      }],
    }],
  };
  const opened = validateDocument(v1);
  assert.ok(opened, "a version-1 document must not validate to null");
  assert.equal(opened.clientSchemaVersion, EDITOR_SCHEMA_VERSION);
  assert.equal(opened.name, "Graduation 2026");
  assert.equal(opened.pages[0].components[0].content, "Welcome");

  // A document from a *newer* client is the one case we refuse, rather than guess.
  assert.equal(migrateDocument({ ...v1, clientSchemaVersion: EDITOR_SCHEMA_VERSION + 1 }), null);
});

test("timer settings are clamped and runtime state is never persisted", () => {
  assert.equal(normalizeTimer({ durationMs: 0 }).durationMs, TIMER_MIN_MS);
  assert.equal(normalizeTimer({ durationMs: 99 * 60 * 60 * 1000 }).durationMs, TIMER_MAX_MS);
  assert.equal(normalizeTimer({ durationMs: "nonsense" }).durationMs, defaultTimer().durationMs);
  assert.equal(normalizeTimer({ onComplete: { sound: "airhorn" } }).onComplete.sound, "chime");
  assert.equal(normalizeTimer(undefined).mode, "COUNTDOWN");
  // Start has no toggle while there is no autoplay, so it cannot be switched off.
  // Start/Stop has no toggle: hiding it would leave a timer that can neither
  // be started nor stopped from the backdrop.
  assert.equal(normalizeTimer({ controls: { startStop: false } }).controls.startStop, true);
  // A document written under the earlier four-key draft still opens, and a
  // hidden Pause stays hidden rather than silently coming back.
  assert.equal(normalizeTimer({ controls: { pause: false } }).controls.pauseResume, false);
  assert.equal(normalizeTimer({ controls: { start: true, stop: true } }).controls.stop, undefined);

  // Runtime keys a live timer would own must not reach the saved document, even
  // if something upstream attaches them to the element.
  const polluted = {
    documentId: "d", title: "T", version: 0,
    pages: [{ id: "p1", elements: [{
      id: "t1", type: "timer", x: 0, y: 0, w: 900, h: 280, rotation: 0,
      fill: "#705AE0", opacity: 1, fontFamily: "Poppins", fontSize: 120,
      timer: { ...defaultTimer(), remainingMs: 1234, status: "running", audio: "playing" },
    }] }],
  };
  const saved = serializeDocument(polluted).pages[0].components[0].timer;
  assert.equal(saved.remainingMs, undefined);
  assert.equal(saved.status, undefined);
  assert.equal(saved.audio, undefined);
  assert.equal(saved.durationMs, defaultTimer().durationMs);

  let state = reducer(undefined, { type: "init" });
  state = reducer(state, timerInserted());
  const reset = reducer(state, timerChanged({ durationMs: 0 }));
  assert.equal(reset.pages[0].elements[0].timer.durationMs, TIMER_MIN_MS);
});

test("inserting a timer is one undo step and lands selected", () => {
  let state = reducer(undefined, { type: "init" });
  const historyBefore = state.past.length;
  state = reducer(state, timerInserted());
  assert.equal(state.pages[0].elements.length, 1);
  assert.equal(state.selectedId, state.pages[0].elements[0].id);
  assert.equal(state.past.length, historyBefore + 1);
  assert.deepEqual(reducer(state, undo()).pages[0].elements, []);
});

test("timer durations format both faces from zero through the 24-hour ceiling", () => {
  assert.equal(formatDuration(0), "00:00:00");
  assert.equal(formatDuration(1000), "00:00:01");
  assert.equal(formatDuration(3_661_000), "01:01:01");
  assert.equal(formatDuration(TIMER_MAX_MS), "24:00:00");
  assert.equal(formatDuration(0, "MM:SS"), "00:00");
  assert.equal(formatDuration(90 * 60 * 1000, "MM:SS"), "90:00");
  assert.equal(formatDuration(TIMER_MAX_MS, "MM:SS"), "1440:00");
  assert.equal(formatDuration(-1000), "00:00:00");
});

test("timer control availability follows the ready, running, paused and completed contract", () => {
  /* Three positions. The first is always live because it is Start before the
     countdown begins and Stop after; Pause/Resume only matters while there is
     a countdown to interrupt. */
  assert.deepEqual(controlState("ready"), { startStop: true, pauseResume: false, reset: true });
  assert.deepEqual(controlState("running"), { startStop: true, pauseResume: true, reset: true });
  assert.deepEqual(controlState("paused"), { startStop: true, pauseResume: true, reset: true });
  assert.deepEqual(controlState("completed"), { startStop: true, pauseResume: false, reset: true });

  // Position one's identity, which is what makes a separate Stop unnecessary.
  assert.equal(startStopRole("ready"), "start");
  assert.equal(startStopRole("running"), "stop");
  assert.equal(startStopRole("paused"), "stop");
  assert.equal(startStopRole("completed"), "stop");
});

test("underline survives save and load, and plain text stays byte-identical", async () => {
  const { default: reducer, textInserted, targetChanged } = await import("../../redux/editorSlice.js");
  let state = reducer(undefined, textInserted("body"));
  const plain = serializeDocument(state).pages[0].components[0].styles;
  assert.equal("textDecoration" in plain, false);
  const target = { kind: "elements", pageId: state.pages[0].id, ids: [state.pages[0].elements[0].id] };
  state = reducer(state, targetChanged({ target, changes: { textDecoration: "underline" } }));
  const saved = serializeDocument(state);
  assert.equal(saved.clientSchemaVersion, EDITOR_SCHEMA_VERSION);
  assert.equal(saved.pages[0].components[0].styles.textDecoration, "underline");
  assert.equal(hydrateDocument(saved).pages[0].elements[0].textDecoration, "underline");
});

test("a version 2 document opens unchanged under version 3", () => {
  const v2 = { clientSchemaVersion: 2, uuid: "b", name: "Old", version: 1, orientation: "LANDSCAPE", canvas: { width: 1920, height: 1080 },
    pages: [{ uuid: "p", pageNumber: 1, background: { type: "COLOR", value: "#FFFFFF" }, components: [
      { uuid: "t", type: "TEXT", content: "Hi", position: { x: 1, y: 2 }, size: { width: 300, height: 100 }, rotation: 0, layerIndex: 0, locked: false, visible: true,
        styles: { fontFamily: "Poppins", fontSize: 72, fontWeight: 700, fontStyle: "normal", textAlign: "center", color: "#705AE0", lineHeight: 1.2, letterSpacing: 0, opacity: 1 } }] }] };
  const text = hydrateDocument(v2).pages[0].elements[0];
  assert.equal(text.content, "Hi");
  assert.equal(text.textDecoration, "none");
});

test("shape v3 styles survive save and load, and an untouched shape saves as before", async () => {
  const { default: reducer, elementInserted, targetChanged } = await import("../../redux/editorSlice.js");
  let state = reducer(undefined, elementInserted("star"));
  const plain = serializeDocument(state).pages[0].components[0];
  assert.deepEqual(plain.styles, { fill: "#ad8dea", opacity: 1, stroke: "transparent", strokeWidth: 0 });
  const target = { kind: "elements", pageId: state.pages[0].id, ids: [state.pages[0].elements[0].id] };
  const effect = { type: "INNER_SHADOW", visible: false, x: 0, y: 10, blur: 20, spread: 0, color: "#2A1F55", opacity: 0.35 };
  state = reducer(state, targetChanged({ target, changes: { fillOpacity: 0.5, stroke: "#211D29", strokeWidth: 6, strokeAlign: "outside",
    cornerRadius: 12, flipX: true, lockAspect: true, effects: [effect] } }));
  const saved = serializeDocument(state).pages[0].components[0];
  assert.equal(saved.flipX, true);
  assert.equal(saved.styles.strokeAlign, "outside");
  assert.equal(saved.styles.cornerRadius, 12);
  assert.deepEqual(saved.styles.effects, [effect]);
  const back = hydrateDocument(serializeDocument(state)).pages[0].elements[0];
  assert.equal(back.fillOpacity, 0.5);
  assert.equal(back.stroke, "#211D29");
  assert.equal(back.effects[0].visible, false);
  assert.equal(back.lockAspect, true);
});

test("no fill saves as null, and a v2 rounded rectangle keeps its roundness", () => {
  const v2 = { clientSchemaVersion: 2, uuid: "b", name: "Old", version: 1, orientation: "LANDSCAPE", canvas: { width: 1920, height: 1080 },
    pages: [{ uuid: "p", pageNumber: 1, background: { type: "COLOR", value: "#FFFFFF" }, components: [
      { uuid: "s", type: "SHAPE", shape: "rounded-rectangle", position: { x: 1, y: 2 }, size: { width: 480, height: 280 }, rotation: 0, layerIndex: 0,
        locked: false, visible: true, styles: { fill: "#ad8dea", opacity: 1, stroke: "transparent", strokeWidth: 0 } },
      { uuid: "o", type: "SHAPE", shape: "circle", position: { x: 1, y: 2 }, size: { width: 100, height: 100 }, rotation: 0, layerIndex: 1,
        locked: false, visible: true, styles: { fill: null, opacity: 1, stroke: "#000000", strokeWidth: 3 } }] }] };
  const [rounded, outline] = hydrateDocument(v2).pages[0].elements;
  assert.equal(rounded.cornerRadius, 50);
  assert.equal(rounded.stroke, null);
  assert.equal(outline.fill, null);
  assert.equal(outline.strokeAlign, "inside");
  assert.equal(serializeDocument({ pages: [{ id: "p", elements: [outline] }] }).pages[0].components[0].styles.fill, null);
});

test("text shadows survive save and load", async () => {
  const { default: reducer, textInserted, targetChanged } = await import("../../redux/editorSlice.js");
  let state = reducer(undefined, textInserted("heading"));
  const target = { kind: "elements", pageId: state.pages[0].id, ids: [state.pages[0].elements[0].id] };
  const effect = { type: "DROP_SHADOW", visible: true, x: 0, y: 12, blur: 24, spread: 0, color: "#1B1530", opacity: 0.3 };
  state = reducer(state, targetChanged({ target, changes: { effects: [effect] } }));
  const saved = serializeDocument(state);
  assert.deepEqual(saved.pages[0].components[0].styles.effects, [effect]);
  assert.deepEqual(hydrateDocument(saved).pages[0].elements[0].effects, [effect]);
});

test("page numbers are real text layers, one per page, kept alike and numbered by position", async () => {
  const { default: reducer, elementDeleted, elementSelected, pageAdded, pageMoved, pageNumbersChanged, pageSelected, selectionCopied, selectionPasted, targetChanged, undo } = await import("../../redux/editorSlice.js");
  const { isPageNumber, pageNumberColor } = await import("./pageNumbers.js");
  const numbers = (state) => state.pages.map((page) => page.elements.filter(isPageNumber).map((element) => element.content).join(",") || "-");
  let state = send([pageAdded(), pageAdded(), pageNumbersChanged({ enabled: true })]);
  assert.deepEqual(numbers(state), ["1", "2", "3"]);

  // moving or restyling one moves and restyles all of them
  state = reducer(state, pageSelected(1));
  const layer = state.pages[1].elements.find(isPageNumber);
  state = reducer(state, targetChanged({ target: { kind: "elements", pageId: state.pages[1].id, ids: [layer.id] }, changes: { x: 100, y: 50, fill: "#ff0000", fontWeight: 800 } }));
  for (const page of state.pages) {
    const other = page.elements.find(isPageNumber);
    assert.deepEqual([other.x, other.y, other.fill, other.fontWeight], [100, 50, "#ff0000", 800]);
  }

  // the digits follow the pages
  state = reducer(state, pageMoved({ from: 2, to: 0 }));
  assert.deepEqual(numbers(state), ["1", "2", "3"]);
  state = reducer(state, pageAdded());
  assert.deepEqual(numbers(state), ["1", "2", "3", "4"]);

  // skipFirst, and a corner preset snaps them back
  state = reducer(state, pageNumbersChanged({ skipFirst: true, position: "bottom-left" }));
  assert.deepEqual(numbers(state), ["-", "2", "3", "4"]);
  assert.equal(state.pages[1].elements.find(isPageNumber).x, 46);

  // saved and loaded with the design, contents rewritten from the page
  const loaded = hydrateDocument(serializeDocument(state));
  assert.deepEqual(numbers(loaded), ["-", "2", "3", "4"]);
  assert.equal(loaded.pageNumbers.enabled, true);

  // a pasted copy is ordinary text; deleting one turns the switch off; undo brings them back
  state = reducer(state, pageSelected(1));
  const one = state.pages[1].elements.find(isPageNumber);
  state = reducer(reducer(reducer(state, elementSelected(one.id)), selectionCopied()), selectionPasted());
  assert.equal(state.pages[1].elements.filter(isPageNumber).length, 1);
  state = reducer(reducer(state, elementSelected(one.id)), elementDeleted());
  assert.equal(state.pageNumbers.enabled, false);
  assert.deepEqual(numbers(state), ["-", "-", "-", "-"]);
  state = reducer(state, undo());
  assert.equal(state.pageNumbers.enabled, true);
  assert.deepEqual(numbers(state), ["-", "2", "3", "4"]);

  assert.equal(serializeDocument(reducer(undefined, { type: "init" })).pageNumbers, undefined);
  assert.equal(pageNumberColor({ type: "COLOR", value: "#FFFFFF" }), "#29243a");
  assert.equal(pageNumberColor({ type: "COLOR", value: "#15131D" }), "#ffffff");
});

test("a text list style saves and loads, and unknown styles are dropped", async () => {
  const { default: reducer, textInserted, targetChanged } = await import("../../redux/editorSlice.js");
  let state = reducer(undefined, textInserted("body"));
  const [text] = state.pages[0].elements;
  state = reducer(state, targetChanged({ target: { kind: "elements", pageId: state.pages[0].id, ids: [text.id] }, changes: { listStyle: "upper-roman" } }));
  const saved = serializeDocument(state);
  assert.equal(saved.pages[0].components[0].styles.listStyle, "upper-roman");
  assert.equal(hydrateDocument(saved).pages[0].elements[0].listStyle, "upper-roman");
  saved.pages[0].components[0].styles.listStyle = "emoji";
  assert.equal(hydrateDocument(saved).pages[0].elements[0].listStyle, null);
});

test("import reads an exported design and refuses anything else", async () => {
  const { readDocumentFile } = await import("./editorDocument.js");
  const { default: reducer, textInserted } = await import("../../redux/editorSlice.js");
  const exported = serializeDocument(reducer(undefined, textInserted("heading")));
  const loaded = await readDocumentFile(new File([JSON.stringify(exported)], "design.json", { type: "application/json" }));
  assert.equal(loaded.pages[0].elements[0].content, "Add a heading");
  await assert.rejects(readDocumentFile(new File(["{oops"], "bad.json")), /valid JSON/);
  await assert.rejects(readDocumentFile(new File([JSON.stringify({ hello: "world" })], "other.json")), /isn't a Visora design/);
  await assert.rejects(readDocumentFile(undefined), /No file/);
});
