import test from "node:test";
import assert from "node:assert/strict";
import { buildSteps, initialVisibility, migrateAnimations, repairTimeline, validateTimeline, removeAnimationRows, remapAnimations } from "./animationTimeline.js";
import { serializeDocument, hydrateDocument } from "./editorDocument.js";
const row = (id, elementId, changes = {}) => ({ id, elementId, kind: "entrance", preset: "fade", trigger: "with", durationMs: 520, delayMs: 0, ...changes });
const page = (animations) => ({ id: "p", elements: [{ id: "a", type: "shape", shape: "square", w: 100, h: 100, x: 0, y: 0, opacity: 1 }, { id: "b" }, { id: "c" }], animations });
test("With shares the anchor, not the previous row's delay; click creates a step", () => {
  const steps = buildSteps(page([row("1", "a", { trigger: "after", delayMs: 300 }), row("2", "b", { delayMs: 100 }), row("3", "c", { trigger: "click" })]));
  assert.deepEqual(steps[0].rows.map((r) => r.start), [300, 100]);
  assert.equal(steps[0].durationMs, 820); assert.equal(steps[1].rows[0].start, 0);
});
test("migration is deterministic and preserves concurrent offsets, finite visible Pulse", () => {
  const old = { ...page([]), animations: undefined, animation: { preset: "pop" }, elements: [{ id: "a", animation: { preset: "fade", delay: 300 } }, { id: "b", animation: { preset: "pulse", delay: 100 } }] };
  const migrated = migrateAnimations(old);
  assert.deepEqual(migrated, migrateAnimations(old));
  assert.deepEqual(buildSteps(migrated)[0].rows.map((r) => r.start), [300, 100]);
  assert.equal(migrated.animations[1].durationMs, 5600);
  assert.deepEqual(initialVisibility(migrated), { a: false, b: true });
  assert.equal(migrated.transition.durationMs, 420);
});
test("repair handles missing, duplicate, order and overlap errors separately", () => {
  const broken = page([row("1", "a"), row("2", "a"), row("3", "missing"), row("4", "a", { kind: "emphasis", preset: "pulse" }), row("5", "a", { kind: "exit", trigger: "after" }), row("6", "a", { kind: "emphasis", preset: "pulse", trigger: "after" })]);
  const fixed = { ...broken, animations: repairTimeline(broken) };
  assert.deepEqual(validateTimeline(fixed), []);
  assert.deepEqual(fixed.animations.map((r) => r.id), ["1", "4", "5"]);
  assert.equal(fixed.animations[1].trigger, "click");
});
test("deletion preserves click boundaries and surviving start times", () => {
  const p = page([row("1", "a", { trigger: "click", delayMs: 200 }), row("2", "b", { trigger: "after", delayMs: 50 }), row("3", "c", { delayMs: 20 })]);
  const fixed = { ...p, animations: removeAnimationRows(p, new Set(["1"])) };
  assert.equal(fixed.animations[0].trigger, "click");
  assert.deepEqual(buildSteps(fixed)[1].rows.map((r) => r.start), [770, 740]);
});
test("hidden elements retain slots; all-hidden steps are not playable", () => {
  const p = page([row("1", "a", { trigger: "click" }), row("2", "b", { trigger: "after" })]);
  p.elements[0].visible = false; p.elements[1].visible = false;
  assert.equal(buildSteps(p)[1].durationMs, 1040); assert.equal(buildSteps(p)[1].playable, false);
});
test("remapping gives copied rows independent identities", () => {
  assert.deepEqual(remapAnimations([row("1", "a"), row("2", "b")], new Map([["a", "copy"]]), () => "new"), [row("new", "copy")]);
});
test("v4 serialization/hydration preserves transitions, row timing and morph keys", () => {
  const p = page([row("1", "a")]); p.elements = [p.elements[0]];
  p.elements[0].morphId = "shared"; p.transition = { preset: "morph", durationMs: 700, delayMs: 100 };
  const saved = serializeDocument({ pages: [p] });
  const loaded = hydrateDocument(saved).pages[0];
  assert.equal(saved.clientSchemaVersion, 4); assert.deepEqual(loaded.animations, p.animations);
  assert.deepEqual(loaded.transition, p.transition); assert.equal(loaded.elements[0].morphId, "shared");
});
