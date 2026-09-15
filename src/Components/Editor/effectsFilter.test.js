import test from "node:test";
import assert from "node:assert/strict";
import { effectFilter, filterId, filterRegion, MAX_EFFECTS, normalizeEffects } from "./effectsFilter.js";

const drop = (overrides = {}) => ({ type: "DROP_SHADOW", visible: true, x: 0, y: 12, blur: 24, spread: 0, color: "#1b1530", opacity: 0.3, ...overrides });
const inner = (overrides = {}) => drop({ type: "INNER_SHADOW", ...overrides });
const find = (filter, tag) => filter.primitives.filter((primitive) => primitive.tag === tag);

test("normalization clamps limits, fixes colours and keeps only four effects", () => {
  const effects = normalizeEffects([
    drop({ x: 900, blur: -5, color: "red", opacity: 3 }), drop(), inner(), drop({ visible: false }), drop(), { type: "GLOW" },
  ]);
  assert.equal(effects.length, MAX_EFFECTS);
  assert.deepEqual(effects[0], { type: "DROP_SHADOW", visible: true, x: 400, y: 12, blur: 0, spread: 0, color: "#000000", opacity: 1 });
  assert.equal(effects[1].color, "#1B1530");
  assert.equal(effects[3].visible, false, "hidden effects are kept and count toward the limit");
});

test("no visible effect means no filter", () => {
  assert.equal(effectFilter("a", [], 100, 100), null);
  assert.equal(effectFilter("a", [drop({ visible: false })], 100, 100), null);
});

test("offsets and blur are divided by width and height independently", () => {
  const filter = effectFilter("wide", [drop({ x: 40, y: 40, blur: 20, spread: 10 })], 1600, 200);
  const [offset] = find(filter, "feOffset");
  assert.equal(offset.dx, 0.025);
  assert.equal(offset.dy, 0.2);
  assert.equal(find(filter, "feGaussianBlur")[0].stdDeviation, "0.00625 0.05");
  assert.equal(find(filter, "feMorphology")[0].radius, "0.00625 0.05");
});

test("zero blur and zero spread write no primitive", () => {
  const filter = effectFilter("sharp", [drop({ blur: 0, spread: 0 })], 100, 100);
  assert.equal(find(filter, "feGaussianBlur").length, 0);
  assert.equal(find(filter, "feMorphology").length, 0);
});

test("inner shadows invert the alpha and are clipped back inside the element", () => {
  const filter = effectFilter("in", [inner()], 200, 200);
  assert.equal(find(filter, "feComponentTransfer")[0].children[0].tableValues, "1 0");
  const composites = find(filter, "feComposite");
  assert.equal(composites.at(-1).in2, "SourceAlpha");
});

test("drop shadows paint under the element and inner shadows over it, top row on top", () => {
  const filter = effectFilter("stack", [drop(), inner(), drop({ y: 30 }), inner({ y: -8 })], 300, 300);
  const merge = filter.primitives.at(-1);
  assert.deepEqual(merge.children.map((child) => child.in), ["effect2", "effect0", "SourceGraphic", "effect3", "effect1"]);
});

test("the filter region reaches past the box by offset, blur and spread on each side", () => {
  const region = filterRegion([drop({ x: -20, y: 30, blur: 10, spread: 5 })], 200, 100);
  // reach = 10 × 1.5 + 5 = 20; left gets the negative x, bottom gets the positive y.
  assert.deepEqual(region, { x: -0.2, y: -0.2, width: 1 + (40 + 20) / 200, height: 1 + (20 + 50) / 100 });
});

test("inner shadows also widen the region, or a box-filling shape has nothing to shift inward", () => {
  const region = filterRegion([inner({ y: 10, blur: 0 })], 100, 100);
  assert.ok(region.height > 1);
});

test("extra room for outlines is added on every side", () => {
  const region = filterRegion([drop({ x: 0, y: 0, blur: 0 })], 100, 100, 8);
  assert.deepEqual(region, { x: -0.08, y: -0.08, width: 1.16, height: 1.16 });
});

test("filter ids are stable and safe to use in url(#…)", () => {
  assert.equal(filterId("cB2Xymn_ZS9-sY"), "fx-cB2Xymn_ZS9-sY");
  assert.equal(filterId("a b:c"), "fx-a_b_c");
});

test("an outline alone still produces a filter, drawn between drop shadows and the element", () => {
  const filter = effectFilter("text", [drop()], 400, 100, { outline: { color: "#211d29", width: 8 } });
  const merge = filter.primitives.at(-1).children.map((child) => child.in);
  assert.deepEqual(merge, ["effect0", "outline", "SourceGraphic"]);
  assert.equal(find(filter, "feOffset")[0].in, "outlineAlpha", "drop shadows are cast by the outlined silhouette");
  assert.ok(effectFilter("text", [], 400, 100, { outline: { color: "#211D29", width: 8 } }));
  assert.equal(effectFilter("text", [], 400, 100, { outline: { color: "#211D29", width: 0 } }), null);
});
