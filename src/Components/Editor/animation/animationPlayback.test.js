import test from "node:test";
import assert from "node:assert/strict";
import { animationFrame, createPlaybackController, playbackInput } from "./animationPlayback.js";
const row = (id, changes = {}) => ({ id, elementId: "a", preset: "fade", kind: "entrance", trigger: "with", durationMs: 500, delayMs: 0, ...changes });
function harness({ animations = [row("in"), row("out", { kind: "exit", trigger: "click" })], transition = { durationMs: 700, delayMs: 0 }, morph = false, reducedMotion = false, preview = false } = {}) {
  const frames = {}, transitions = [], drivers = []; let nextPages = 0;
  const controller = createPlaybackController({ page: { elements: [{ id: "a" }], animations }, transition, morph, reducedMotion, preview,
    drive(duration, update, complete) { const d = { duration, update, complete, cancelled: false, cancel() { this.cancelled = true; } }; drivers.push(d); return d; },
    renderElement(id, frame) { frames[id] = frame; }, renderTransition(p) { transitions.push(p); }, onNextPage() { nextPages++; } });
  controller.start(); return { controller, frames, transitions, drivers, nextPages: () => nextPages };
}
test("Next finishes concurrent entry atomically, then plays a click step, then navigates", () => {
  const h = harness(); assert.equal(h.frames.a.opacity, 0); assert.equal(h.drivers[0].duration, 700);
  h.controller.next(); assert.equal(h.frames.a.opacity, 1); assert.equal(h.transitions.at(-1), 1); assert.equal(h.controller.busy, false);
  h.controller.next(); assert.equal(h.controller.busy, true);
  h.controller.next(); assert.equal(h.frames.a.hidden, true); assert.equal(h.nextPages(), 0);
  h.controller.next(); assert.equal(h.nextPages(), 1);
});
test("one Next finishes an automatic-only entry and navigates, including Morph and reduced motion", () => {
  for (const morph of [false, true]) for (const reducedMotion of [false, true]) {
    const h = harness({ morph, reducedMotion, animations: [row("in")] });
    h.controller.next();
    assert.equal(h.nextPages(), 1);
    assert.equal(h.frames.a.opacity, 1);
    assert.equal(h.transitions.at(-1), 1);
    assert.equal(h.drivers[0].cancelled, true);
    assert.equal(h.controller.busy, false);
    h.drivers[0].update(10); h.drivers[0].complete();
    assert.equal(h.frames.a.opacity, 1);
    assert.equal(h.nextPages(), 1);
  }
});
test("a transition-only slide does not consume an extra Next for empty or hidden click steps", () => {
  for (const animations of [[], [row("hidden", { elementId: "missing", trigger: "click" })]]) {
    const h = harness({ morph: true, animations });
    h.controller.next();
    assert.equal(h.nextPages(), 1);
  }
});
test("natural entry completion and canvas preview never navigate automatically", () => {
  const h = harness({ morph: true, animations: [] });
  h.drivers[0].complete();
  assert.equal(h.nextPages(), 0);
  h.controller.next(); assert.equal(h.nextPages(), 1);
  const preview = harness({ morph: true, animations: [], preview: true });
  preview.controller.next(); assert.equal(preview.nextPages(), 0);
});
test("Next finishes Morph plus its pending automatic rows with no late callbacks", () => {
  const h = harness({ morph: true }); assert.equal(h.drivers[0].duration, 1200);
  h.controller.next(); assert.equal(h.frames.a.opacity, 1); assert.equal(h.transitions.at(-1), 1);
  h.drivers[0].update(10); assert.equal(h.frames.a.opacity, 1);
  h.controller.dispose(); h.drivers[0].complete(); assert.equal(h.nextPages(), 0);
});
test("pulse has exactly two finite cycles and restores the original transform", () => {
  const r = row("p", { kind: "emphasis", preset: "pulse", durationMs: 1400 });
  assert.equal(animationFrame(r, 350).transform, "scale(1.035)");
  assert.equal(animationFrame(r, 700).transform, "scale(1)");
  assert.equal(animationFrame(r, 1050).transform, "scale(1.035)");
  assert.equal(animationFrame(r, 1400).transform, "scale(1)");
  assert.equal(animationFrame(r, 350, true).transform, "none");
});
test("input ignores held keys, focused controls and modifier shortcuts", () => {
  assert.equal(playbackInput({ key: "ArrowRight", repeat: true }), null);
  assert.equal(playbackInput({ key: " ", target: { closest: () => ({}) } }), null);
  assert.equal(playbackInput({ type: "click", target: { closest: () => ({}) } }), null);
  assert.equal(playbackInput({ key: "ArrowRight", ctrlKey: true }), null);
  assert.equal(playbackInput({ key: "ArrowRight" }), "next"); assert.equal(playbackInput({ key: "Home" }), "home");
});
test("an entirely hidden click step is skipped", () => {
  const h = harness({ animations: [row("hidden", { elementId: "missing", trigger: "click" })], transition: null });
  h.controller.next(); assert.equal(h.nextPages(), 1);
});
