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
