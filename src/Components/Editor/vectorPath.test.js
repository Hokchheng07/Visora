import test from "node:test";
import assert from "node:assert/strict";
import { nodesToD, presetVector, presetVectors, signedArea, subpathToD } from "./vectorPath.js";

test("straight segments become L commands and a closed subpath ends with Z", () => {
  assert.equal(nodesToD(presetVectors.square), "M0 0L100 0L100 100L0 100Z");
});

test("a curve uses the start node's out handle and the end node's in handle", () => {
  const d = subpathToD({ closed: false, nodes: [
    { x: 0, y: 0, in: null, out: { dx: 10, dy: 0 } },
    { x: 100, y: 0, in: { dx: 0, dy: 20 }, out: null },
  ] });
  assert.equal(d, "M0 0C10 0 100 20 100 0");
});

test("a curved closing segment is drawn before Z, because Z is always straight", () => {
  const d = nodesToD(presetVectors.circle);
  assert.match(d, /C[^C]*50 0Z$/);
  assert.equal((d.match(/C/g) || []).length, 4);
});

test("a handle on only one side still produces a curve", () => {
  const d = subpathToD({ closed: false, nodes: [
    { x: 0, y: 0, in: null, out: null },
    { x: 50, y: 50, in: { dx: -10, dy: 0 }, out: null },
  ] });
  assert.equal(d, "M0 0C0 0 40 50 50 50");
});

test("every preset starts at its top-most node, left-most on a tie", () => {
  for (const [name, vector] of Object.entries(presetVectors)) {
    const nodes = vector.subpaths[0].nodes;
    const top = Math.min(...nodes.map((node) => node.y));
    const first = nodes.find((node) => node.y === top && node.x === Math.min(...nodes.filter((n) => n.y === top).map((n) => n.x)));
    assert.equal(nodes[0], first, `${name} does not start at its top-left-most node`);
  }
});

test("every preset runs clockwise on screen", () => {
  for (const [name, vector] of Object.entries(presetVectors)) {
    assert.ok(signedArea(vector.subpaths[0].nodes) > 0, `${name} runs anticlockwise`);
  }
});

test("smooth nodes with both handles keep them on one line", () => {
  for (const [name, vector] of Object.entries(presetVectors)) {
    for (const node of vector.subpaths[0].nodes) {
      if (node.mode !== "smooth" || !node.in || !node.out) continue;
      const cross = node.in.dx * node.out.dy - node.in.dy * node.out.dx;
      const dot = node.in.dx * node.out.dx + node.in.dy * node.out.dy;
      assert.ok(Math.abs(cross) < 1e-9 && dot < 0, `${name} has a smooth node with a bent handle pair`);
    }
  }
});

test("every preset closes and has at least three nodes", () => {
  for (const [name, vector] of Object.entries(presetVectors)) {
    const [subpath] = vector.subpaths;
    assert.ok(subpath.closed, `${name} is open`);
    assert.ok(subpath.nodes.length >= 3, `${name} has too few nodes`);
  }
});

test("a pill keeps semicircle ends at any size, wide or tall", () => {
  for (const [width, height] of [[480, 220], [1400, 200], [90, 700]]) {
    const nodes = presetVector("pill", width, height).subpaths[0].nodes;
    const xs = nodes.map((node) => node.x * width / 100), ys = nodes.map((node) => node.y * height / 100);
    const radius = Math.min(width, height) / 2;
    // The straight sides start exactly one radius in from the ends.
    if (width > height) assert.ok(Math.abs(Math.min(...xs.filter((x, i) => ys[i] === 0)) - radius) < 1e-6, `${width}×${height}`);
    else assert.ok(Math.abs(Math.min(...ys.filter((y, i) => xs[i] === width)) - radius) < 1e-6, `${width}×${height}`);
    assert.ok(signedArea(nodes) > 0, `${width}×${height} runs anticlockwise`);
    assert.equal(nodes[0].y, 0);
  }
  assert.equal(presetVector("pill", 300, 300).subpaths[0].nodes.length, 4, "a square pill is a circle");
});

test("all seventeen catalog shapes have point data", async () => {
  const { shapeCatalog } = await import("./shapeCatalog.js");
  for (const shape of shapeCatalog) assert.ok(presetVector(shape.id, shape.w, shape.h), `${shape.id} has no point data`);
});

test("corner radius rounds straight corners with a real circular arc and leaves curves alone", async () => {
  const { roundCorners } = await import("./vectorPath.js");
  const square = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }].map((n) => ({ ...n, in: null, out: null }));
  const rounded = roundCorners(square, 10);
  assert.equal(rounded.length, 8);
  const near = (node, x, y) => assert.ok(Math.abs(node.x - x) < 1e-9 && Math.abs(node.y - y) < 1e-9, `${node.x},${node.y} is not ${x},${y}`);
  near(rounded[0], 0, 10);
  near(rounded[1], 10, 0);
  // For a right angle the handle is 4/3·tan(π/8)·r ≈ 0.5523·r.
  assert.ok(Math.abs(Math.hypot(rounded[0].out.dx, rounded[0].out.dy) - 5.523) < 0.01);
  const circle = presetVectors.circle.subpaths[0].nodes;
  assert.equal(roundCorners(circle, 20).length, circle.length);
});

test("a radius too big for the shape shrinks to fit instead of overlapping", async () => {
  const { roundCorners } = await import("./vectorPath.js");
  const thin = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 10 }, { x: 0, y: 10 }].map((n) => ({ ...n, in: null, out: null }));
  const rounded = roundCorners(thin, 500);
  assert.ok(rounded.every((node) => node.y >= -1e-9 && node.y <= 10 + 1e-9 && node.x >= -1e-9 && node.x <= 100 + 1e-9));
  assert.ok(Math.abs(rounded[0].x) < 1e-9 && Math.abs(rounded[0].y - 5) < 1e-9);
});

test("shape paths are drawn in the element's pixels, so corners stay circular when stretched", async () => {
  const { shapePath } = await import("./vectorPath.js");
  assert.equal(shapePath({ shape: "rectangle", w: 400, h: 100 }), "M0 0L400 0L400 100L0 100Z");
  const d = shapePath({ shape: "rectangle", w: 400, h: 100, cornerRadius: 20 });
  assert.match(d, /^M0 20C/);
  assert.match(d, /L380 0C/);
});

test("flipping mirrors the outline inside the same box", async () => {
  const { shapePath } = await import("./vectorPath.js");
  assert.equal(shapePath({ shape: "triangle", w: 100, h: 100, flipY: true }), "M50 100L100 0L0 0Z");
  assert.equal(shapePath({ shape: "arrow-right", w: 100, h: 100, flipX: true }).startsWith("M40 8L2 50"), true);
});

test("each corner of a rectangle can take its own radius, following the corner you see after a flip", async () => {
  const { shapePath: path } = await import("./vectorPath.js");
  // Top left 0, top right 30, bottom right 0, bottom left 10.
  const d = path({ shape: "rectangle", w: 200, h: 100, cornerRadii: [0, 30, 0, 10] });
  assert.ok(d.startsWith("M0 0L170 0C"), d);
  assert.match(d, /L200 100L10 100C/);
  const flipped = path({ shape: "rectangle", w: 200, h: 100, cornerRadii: [0, 30, 0, 10], flipX: true });
  // Still sharp at the top left and round at the top right after mirroring.
  // A flip reverses the drawing direction: the arc now runs from the right edge into the top edge.
  assert.match(flipped, /^M200 30C200 13\.431 186\.569 0 170 0L0 0L0 90C/);
});

test("per-corner radii apply only to rectangles; other shapes keep the single radius", async () => {
  const { cornerRadiiFor, shapePath: path } = await import("./vectorPath.js");
  assert.deepEqual(cornerRadiiFor("square", undefined, [1, 2, 3, 4]), [1, 2, 3, 4]);
  assert.equal(cornerRadiiFor("star", undefined, [1, 2, 3, 4]), null);
  assert.equal(cornerRadiiFor("square", undefined, [1, 2, -3, 4]), null);
  assert.equal(cornerRadiiFor("square", { subpaths: [] }, [1, 2, 3, 4]), null);
  assert.equal(path({ shape: "star", w: 100, h: 100, cornerRadius: 5, cornerRadii: [0, 0, 0, 0] }), path({ shape: "star", w: 100, h: 100, cornerRadius: 5 }));
});

test("corner radii save only when the corners differ, and load back", async () => {
  const { hydrateDocument, serializeDocument } = await import("./editorDocument.js");
  const editor = (element) => ({ title: "T", pages: [{ id: "p", elements: [{ id: "s", type: "shape", shape: "square", x: 0, y: 0, w: 100, h: 100, rotation: 0, fill: "#000000", ...element }] }] });
  const styles = (element) => serializeDocument(editor(element)).pages[0].components[0].styles;
  assert.deepEqual(styles({ cornerRadius: 0, cornerRadii: [4, 0, 12, 0] }).cornerRadii, [4, 0, 12, 0]);
  const equal = styles({ cornerRadius: 0, cornerRadii: [8, 8, 8, 8] });
  assert.equal(equal.cornerRadii, undefined);
  assert.equal(equal.cornerRadius, 8);
  assert.equal("cornerRadii" in styles({ cornerRadius: 6 }), false);
  const loaded = hydrateDocument(serializeDocument(editor({ cornerRadii: [4, 0, 12, 0] })));
  assert.deepEqual(loaded.pages[0].elements[0].cornerRadii, [4, 0, 12, 0]);
});
