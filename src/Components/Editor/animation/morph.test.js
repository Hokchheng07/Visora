import test from "node:test";
import assert from "node:assert/strict";
import { matchMorph, morphFrame, mixRotation, mixColor } from "./morph.js";
const shape = (id, extra = {}) => ({ id, type: "shape", shape: "square", x: 0, y: 0, w: 100, h: 100, rotation: 0, opacity: 1, fill: "#000000", ...extra });
test("morph keys win, names must be unique, types must match", () => {
  const old = { elements: [shape("a", { name: "Named" }), shape("b", { name: "Other" }), shape("c", { name: "Dup" }), shape("d", { name: "Dup" })] };
  const next = { elements: [shape("x", { name: "Named", morphId: "b" }), shape("y", { name: "Named" }), shape("z", { name: "Dup" })] };
  const pairs = matchMorph(old, next);
  assert.equal(pairs.find((p) => p.from?.id === "b").to.id, "x");
  assert.equal(pairs.find((p) => p.from?.id === "a").to, null);
  assert.equal(pairs.find((p) => p.from?.id === "c").to, null);
  assert.equal(matchMorph({ elements: [shape("a")] }, { elements: [shape("b", { morphId: "a", type: "text" })] })[0].to, null);
});
test("hidden, exited and pending entrance elements are excluded", () => {
  const old = { elements: [shape("a"), shape("b", { visible: false })] };
  const next = { elements: [shape("c")], animations: [{ elementId: "c", kind: "entrance" }] };
  assert.deepEqual(matchMorph(old, next, { a: false }), []);
});
test("geometry uses shortest rotation and blends compatible appearances", () => {
  const a = shape("a", { rotation: 350, cornerRadius: 0 }), b = shape("b", { x: 500, w: 300, fill: "#ffffff", rotation: 10, cornerRadius: 50, opacity: .5 });
  const f = morphFrame({ from: a, to: b }, .5);
  assert.equal(f.box.x, 250); assert.equal(f.box.w, 200); assert.equal(f.box.rotation, 360);
  assert.equal(f.box.opacity, .75); assert.equal(f.fill, "#808080"); assert.equal(f.cornerRadius, 25);
  assert.equal(f.oldOpacity, .5); assert.equal(f.newOpacity, .5);
  assert.equal(mixRotation(10, 350, .5), 0); assert.equal(mixColor(null, "#fff", .5), null);
});
test("custom paths, different text and gradients crossfade without incompatible interpolation", () => {
  const custom = shape("a", { shape: "custom" });
  assert.equal(morphFrame({ from: custom, to: { ...custom, fill: "#ffffff" } }, .5).fill, null);
  const text = { ...shape("text"), type: "text", content: "A", fontFamily: "Poppins", fontSize: 100 };
  assert.equal(morphFrame({ from: text, to: { ...text, content: "B", fontSize: 200 } }, .5).fontSize, null);
  const gradient = shape("a", { gradient: {} });
  assert.equal(morphFrame({ from: gradient, to: gradient }, .5).fill, null);
});
