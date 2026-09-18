import test from "node:test";
import assert from "node:assert/strict";
import reducer, { targetChanged, timerInserted } from "../../redux/editorSlice.js";
import { defaultTimer, hydrateDocument, normalizeTimer, serializeDocument, serializeTimer, TIMER_MAX_MS } from "../model/editorDocument.js";
import { layerLabel } from "../model/layerModel.js";
import { formatElapsed, stopwatchRole } from "./timerFormat.js";

test("the stopwatch always shows HH:MM:SS with completed seconds only", () => {
  assert.equal(formatElapsed(0), "00:00:00");
  assert.equal(formatElapsed(999), "00:00:00");
  assert.equal(formatElapsed(1000), "00:00:01");
  assert.equal(formatElapsed(5230), "00:00:05");
  assert.equal(formatElapsed(59999), "00:00:59");
  assert.equal(formatElapsed(60000), "00:01:00");
  assert.equal(formatElapsed(90000), "00:01:30");
  assert.equal(formatElapsed(3599999), "00:59:59");
  assert.equal(formatElapsed(3600000), "01:00:00");
  assert.equal(formatElapsed(3723450), "01:02:03");
  assert.equal(formatElapsed(TIMER_MAX_MS), "24:00:00");
  assert.equal(formatElapsed(-50), "00:00:00");
});

test("Start/Stop is Start unless the stopwatch is counting", () => {
  assert.equal(stopwatchRole("ready"), "start");
  assert.equal(stopwatchRole("running"), "stop");
  assert.equal(stopwatchRole("stopped"), "start");
});

test("a stopwatch is inserted with its mode, and a countdown still accepts a format", () => {
  let state = reducer(undefined, timerInserted("STOPWATCH"));
  const stopwatch = state.pages[0].elements[0];
  assert.equal(stopwatch.timer.mode, "STOPWATCH");
  assert.equal(layerLabel(stopwatch), "Stopwatch");
  state = reducer(state, timerInserted("MM:SS"));
  assert.equal(state.pages[0].elements[1].timer.mode, "COUNTDOWN");
  assert.equal(state.pages[0].elements[1].timer.format, "MM:SS");
  assert.equal(reducer(undefined, timerInserted()).pages[0].elements[0].timer.mode, "COUNTDOWN");
});

test("a stopwatch saves only what it uses", () => {
  const saved = serializeTimer(defaultTimer("HH:MM:SS", { start: "#112233" }, "STOPWATCH"));
  assert.deepEqual(Object.keys(saved).sort(), ["buttonColors", "controls", "format", "mode"]);
  assert.equal(saved.format, "MM:SS.CC");
  assert.deepEqual(saved.controls, { startStop: true, reset: true });
  assert.equal(saved.buttonColors.start, "#112233");
  assert.deepEqual(Object.keys(saved.buttonColors).sort(), ["reset", "start", "stop"]);
  // A countdown saves exactly as before.
  assert.deepEqual(serializeTimer(defaultTimer()), normalizeTimer(defaultTimer()));
});

test("switching Countdown ↔ Stopwatch keeps the countdown's settings and is one undo step each", () => {
  let state = reducer(undefined, timerInserted());
  const page = state.pages[0], id = page.elements[0].id;
  const target = { kind: "timer", pageId: page.id, ids: [id] };
  state = reducer(state, targetChanged({ target, changes: { durationMs: 90_000, onComplete: { message: "Break over" } } }));
  const history = state.past.length;
  state = reducer(state, targetChanged({ target, changes: { mode: "STOPWATCH" } }));
  assert.equal(state.pages[0].elements[0].timer.mode, "STOPWATCH");
  assert.equal(state.past.length, history + 1);
  state = reducer(state, targetChanged({ target, changes: { mode: "COUNTDOWN" } }));
  const timer = state.pages[0].elements[0].timer;
  assert.equal(timer.durationMs, 90_000);
  assert.equal(timer.onComplete.message, "Break over");
});

test("a saved stopwatch loads back as a stopwatch; an old timer with no mode is a countdown", () => {
  const state = reducer(undefined, timerInserted("STOPWATCH"));
  const loaded = hydrateDocument(serializeDocument(state)).pages[0].elements[0].timer;
  assert.equal(loaded.mode, "STOPWATCH");
  assert.equal(normalizeTimer({ durationMs: 60_000 }).mode, "COUNTDOWN");
  assert.equal(normalizeTimer({ mode: "EGG_TIMER" }).mode, "COUNTDOWN", "unknown modes fall back to a countdown");
});
