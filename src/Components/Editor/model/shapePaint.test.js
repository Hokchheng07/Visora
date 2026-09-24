import test from "node:test";
import assert from "node:assert/strict";
import { defaultGradient, gradientCss, gradientVector, MAX_STOPS, miterLimitFor, normalizeAngle,
  normalizeGradient, strokeDashOf, strokePaint, withAlpha } from "./shapePaint.js";
import { hydrateDocument, serializeDocument } from "./editorDocument.js";

const near = (actual, expected, epsilon = 0.001) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} ≠ ${expected}`);
const gradient = (stops, angle = 90) => ({ type: "LINEAR", angle, stops });

test("a gradient needs two valid stops, and its stops come back in order", () => {
  const sorted = normalizeGradient(gradient([{ offset: 1, color: "#000000" }, { offset: 0.25, color: "#ffffff", opacity: 0.5 }]));
  assert.deepEqual(sorted.stops, [{ offset: 0.25, color: "#FFFFFF", opacity: 0.5 }, { offset: 1, color: "#000000", opacity: 1 }]);
  assert.equal(normalizeGradient(gradient([{ offset: 0, color: "#000000" }])), null, "one stop is not a ramp");
  assert.equal(normalizeGradient({ type: "RADIAL", stops: [{ offset: 0, color: "#000000" }, { offset: 1, color: "#FFFFFF" }] }), null);
  assert.equal(normalizeGradient(null), null);
  // Out-of-range values are pulled back rather than rejected.
  const clamped = normalizeGradient(gradient([{ offset: -3, color: "nope", opacity: 5 }, { offset: 9, color: "#123456" }]));
  assert.deepEqual(clamped.stops[0], { offset: 0, color: "#FFFFFF", opacity: 1 });
  assert.equal(clamped.stops[1].offset, 1);
  const many = normalizeGradient(gradient(Array.from({ length: 12 }, (_item, index) => ({ offset: index / 11, color: "#000000" }))));
  assert.equal(many.stops.length, MAX_STOPS);
});

test("the gradient line runs across the shape's box, and the angle wraps", () => {
  assert.deepEqual(gradientVector(0), { x1: 0, y1: 0.5, x2: 1, y2: 0.5 });   // left to right
  const down = gradientVector(90);
  near(down.x1, 0.5); near(down.y1, 0); near(down.x2, 0.5); near(down.y2, 1); // top to bottom
  assert.equal(normalizeAngle(450), 90);
  assert.equal(normalizeAngle(-90), 270);
});

test("the CSS preview matches the ramp, with a stop's opacity in the colour", () => {
  const css = gradientCss(defaultGradient("#D9D9D9", "#737373"));
  assert.equal(css, "linear-gradient(180deg, #D9D9D9 0%, #737373 100%)");
  assert.equal(withAlpha("#112233", 0.5), "#11223380");
  assert.equal(withAlpha("#112233", 1), "#112233");
  assert.equal(gradientCss(null), null);
});

test("dashes come from the stroke width, a custom pair wins, and dots are round", () => {
  assert.equal(strokeDashOf({ strokeWidth: 4 }), null, "a solid stroke has no dash");
  assert.deepEqual(strokeDashOf({ strokeStyle: "dashed", strokeWidth: 4 }), { style: "dashed", dash: 12, gap: 8, cap: "butt" });
  assert.deepEqual(strokeDashOf({ strokeStyle: "dotted", strokeWidth: 4 }), { style: "dotted", dash: 0, gap: 8, cap: "round" });
  assert.deepEqual(strokeDashOf({ strokeStyle: "dashed", strokeWidth: 4, strokeDash: [20, 6] }), { style: "dashed", dash: 20, gap: 6, cap: "butt" });
  assert.deepEqual(strokeDashOf({ strokeStyle: "dashed", strokeWidth: 4, strokeDash: [20] }).dash, 12, "a broken pair falls back to the preset");
});

test("the SVG attributes match the stroke settings", () => {
  assert.deepEqual(strokePaint({ strokeStyle: "dashed", strokeWidth: 2 }),
    { strokeDasharray: "6 4", strokeLinecap: undefined, strokeLinejoin: undefined, strokeMiterlimit: miterLimitFor(28.96) });
  const round = strokePaint({ strokeJoin: "round" });
  assert.equal(round.strokeLinejoin, "round");
  assert.equal(round.strokeMiterlimit, undefined, "a round corner has no miter limit");
  assert.equal(strokePaint({}).strokeDasharray, undefined);
  // 28.96° is Figma's default; a right angle is never cut off.
  near(miterLimitFor(28.96), 4.0, 0.05);
  near(miterLimitFor(90), 1.414, 0.01);
});

test("paint saves only when it differs from plain, and loads back", () => {
  const shape = (extra) => ({ title: "T", pages: [{ id: "p", elements: [{ id: "s", type: "shape", shape: "square", x: 0, y: 0, w: 100, h: 100,
    rotation: 0, fill: "#AD8DEA", stroke: "#211D29", strokeWidth: 4, ...extra }] }] });
  const styles = (extra) => serializeDocument(shape(extra)).pages[0].components[0].styles;

  const plain = styles({});
  for (const key of ["gradient", "strokeStyle", "strokeDash", "strokeJoin", "miterAngle"]) assert.equal(key in plain, false, key);

  const painted = styles({ gradient: defaultGradient(), strokeStyle: "dashed", strokeDash: [12, 6], strokeJoin: "round", miterAngle: 45 });
  assert.equal(painted.gradient.type, "LINEAR");
  assert.equal(painted.gradient.stops.length, 2);
  assert.equal(painted.strokeStyle, "dashed");
  assert.deepEqual(painted.strokeDash, [12, 6]);
  assert.equal(painted.strokeJoin, "round");
  assert.equal("miterAngle" in painted, false, "the miter angle is only sent with a miter join");
  assert.equal(styles({ miterAngle: 45 }).miterAngle, 45);

  const loaded = hydrateDocument(serializeDocument(shape({ gradient: defaultGradient("#112233", "#445566"), strokeStyle: "dotted" })));
  const element = loaded.pages[0].elements[0];
  assert.equal(element.gradient.stops[0].color, "#112233");
  assert.equal(element.strokeStyle, "dotted");
  assert.equal(element.strokeJoin, "miter");
  // A document written before this feature loads with no gradient and a solid stroke.
  assert.equal(hydrateDocument(serializeDocument(shape({}))).pages[0].elements[0].gradient, null);
});
