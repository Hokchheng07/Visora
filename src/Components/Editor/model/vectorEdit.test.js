import test from "node:test";
import assert from "node:assert/strict";
import { alignNodes, deleteNodes, distributeNodes, editableSubpaths, insertNode, localToPage, moveNodes, nearestOnOutline,
  normalizeVector, outlineBounds, pageToLocal, setCornerRadius, setHandle, setMirroring, toggleCurve, vectorChanges } from "./vectorEdit.js";
import { shapePath } from "./vectorPath.js";

const near = (actual, expected, epsilon = 0.01) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} ≠ ${expected}`);
const square = (extra = {}) => ({ id: "s", type: "shape", shape: "square", x: 100, y: 200, w: 400, h: 200, rotation: 0, ...extra });

test("a stored vector is checked: three points per subpath, finite numbers, old modes mapped to mirroring", () => {
  const vector = normalizeVector({ subpaths: [{ closed: true, nodes: [
    { x: 0, y: 0, mode: "smooth", in: { dx: 1, dy: 0 }, out: { dx: 0, dy: 0 } }, { x: 100, y: 0 }, { x: 50, y: 100, cornerRadius: 8 },
  ] }] });
  assert.equal(vector.subpaths[0].nodes[0].mirroring, "angle");
  assert.equal(vector.subpaths[0].nodes[0].out, null, "a zero-length handle is no handle");
  assert.equal(vector.subpaths[0].nodes[1].mirroring, "none");
  assert.equal(vector.subpaths[0].nodes[2].cornerRadius, 8);
  assert.equal(normalizeVector({ subpaths: [{ nodes: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }] }), null, "two points are not a shape");
  assert.equal(normalizeVector({ subpaths: [{ nodes: [{ x: 0, y: 0 }, { x: "a", y: 1 }, { x: 2, y: 2 }] }] }), null);
  assert.equal(normalizeVector({ subpaths: Array.from({ length: 21 }, () => ({ nodes: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] })) }), null);
});

test("page and local space round-trip, including a rotated shape", () => {
  const rotated = square({ rotation: 30 });
  const local = { x: 40, y: 150 };
  const page = localToPage(rotated, local);
  const back = pageToLocal(rotated, page);
  near(back.x, local.x); near(back.y, local.y);
  // The box centre is the pivot, so it maps to itself.
  const centre = localToPage(rotated, { x: 200, y: 100 });
  near(centre.x, 300); near(centre.y, 300);
});

test("editable points are in pixels, with flips and a rectangle's corner radii built in", () => {
  const [nodes] = editableSubpaths(square({ flipX: true, cornerRadii: [10, 0, 0, 0] }));
  assert.deepEqual(nodes.map((node) => [node.x, node.y]), [[400, 0], [0, 0], [0, 200], [400, 200]]);
  // After the flip the stored top-left corner sits at the top right, but the radius stays on the top-left corner you see.
  assert.equal(nodes[1].cornerRadius, 10);
  assert.equal(nodes[0].cornerRadius, undefined);
});

test("unchanged points give back the same box and outline", () => {
  const element = square({ shape: "star", w: 300, h: 300 });
  const changes = vectorChanges(element, editableSubpaths(element));
  assert.equal(changes.shape, "custom");
  const before = shapePath({ shape: "star", w: 300, h: 300 });
  const after = shapePath({ shape: "custom", vector: changes.vector, w: changes.w, h: changes.h });
  // The star's points do not reach every edge, so the box tightens; the drawn outline is the same size either way.
  const size = (d) => { const numbers = d.match(/-?\d+(\.\d+)?/g).map(Number); const xs = numbers.filter((_n, i) => i % 2 === 0); return Math.max(...xs) - Math.min(...xs); };
  near(size(after), size(before), 0.5);
  near(changes.x + changes.w / 2, element.x + element.w / 2, 3);
});

test("dragging a point past the edge grows the box and keeps the rest of the shape still on the page", () => {
  const element = square();
  const moved = moveNodes(editableSubpaths(element), ["0:1"], 100, -50); // top-right corner, up and out
  const changes = vectorChanges(element, moved);
  assert.equal(changes.w, 500);
  assert.equal(changes.h, 250);
  assert.equal(changes.x, 100, "the left edge did not move");
  assert.equal(changes.y, 150, "the box grew upwards");
  // The bottom-left corner is still exactly where it was on the page.
  const bottomLeft = changes.vector.subpaths[0].nodes[3];
  near(changes.x + bottomLeft.x / 100 * changes.w, 100);
  near(changes.y + bottomLeft.y / 100 * changes.h, 400);
});

test("a rotated shape re-fits without drifting on the page", () => {
  const element = square({ rotation: 45 });
  const before = localToPage(element, { x: 0, y: 200 });
  const changes = vectorChanges(element, moveNodes(editableSubpaths(element), ["0:1"], 80, 0));
  const after = { ...element, ...changes };
  const corner = changes.vector.subpaths[0].nodes[3];
  const page = localToPage(after, { x: corner.x / 100 * after.w, y: corner.y / 100 * after.h });
  near(page.x, before.x, 0.05); near(page.y, before.y, 0.05);
});

test("mirroring decides how the partner handle follows", () => {
  const curve = [[
    { x: 0, y: 0, in: { dx: -10, dy: 0 }, out: { dx: 20, dy: 0 }, mirroring: "none" },
    { x: 100, y: 0, in: null, out: null, mirroring: "none" },
    { x: 50, y: 80, in: null, out: null, mirroring: "none" },
  ]];
  const none = setHandle(curve, "0:0", "out", { dx: 0, dy: 30 })[0][0];
  assert.deepEqual(none.in, { dx: -10, dy: 0 }, "no mirroring: the other handle stays");
  const angle = setHandle(setMirroring(curve, ["0:0"], "angle"), "0:0", "out", { dx: 0, dy: 30 })[0][0];
  near(angle.in.dx, 0); near(angle.in.dy, -10, 0.01);
  const both = setHandle(setMirroring(curve, ["0:0"], "angle-and-length"), "0:0", "out", { dx: 0, dy: 30 })[0][0];
  assert.deepEqual(both.in, { dx: -0, dy: -30 });
});

test("a corner given mirroring grows smooth handles along its neighbours; double-click turns it back", () => {
  const triangle = editableSubpaths(square({ shape: "triangle", w: 300, h: 300 }));
  const smooth = setMirroring(triangle, ["0:0"], "angle-and-length")[0][0];
  assert.ok(smooth.in && smooth.out);
  near(smooth.in.dy, 0); near(smooth.out.dy, 0); // neighbours sit level, so the handles are horizontal
  near(Math.hypot(smooth.in.dx, smooth.in.dy), Math.hypot(smooth.out.dx, smooth.out.dy));
  const corner = toggleCurve(setMirroring(triangle, ["0:0"], "angle"), "0:0")[0][0];
  assert.equal(corner.in, null); assert.equal(corner.mirroring, "none");
});

test("adding a point on a curve keeps the outline, and points can be deleted down to three", () => {
  const circle = editableSubpaths(square({ shape: "circle", w: 200, h: 200 }));
  const { subpaths, key } = insertNode(circle, 0, 0, 0.5);
  assert.equal(key, "0:1");
  assert.equal(subpaths[0].length, 5);
  const bounds = outlineBounds(subpaths), original = outlineBounds(circle);
  near(bounds.left, original.left, 0.05); near(bounds.right, original.right, 0.05);
  const hit = nearestOnOutline(circle, { x: 200, y: 100 });
  near(hit.distance, 0, 0.05);
  assert.equal(deleteNodes(circle, ["0:0", "0:1"]), null, "a circle of four points cannot lose two");
  assert.equal(deleteNodes(circle, ["0:0"])[0].length, 3);
});

test("points align, distribute and take their own corner radius", () => {
  const nodes = [[{ x: 0, y: 0 }, { x: 30, y: 50 }, { x: 100, y: 10 }, { x: 60, y: 90 }].map((point) => ({ ...point, in: null, out: null, mirroring: "none" }))];
  assert.deepEqual(alignNodes(nodes, ["0:0", "0:2"], "top")[0].map((node) => node.y), [0, 50, 0, 90]);
  assert.deepEqual(distributeNodes(nodes, ["0:0", "0:1", "0:2"], "horizontal")[0].map((node) => node.x), [0, 50, 100, 60]);
  const rounded = setCornerRadius(nodes, ["0:1"], 12);
  assert.equal(rounded[0][1].cornerRadius, 12);
  assert.equal(setCornerRadius(rounded, ["0:1"], 0)[0][1].cornerRadius, undefined);
  // A point's own radius reaches the drawn path.
  const d = shapePath({ shape: "custom", vector: { subpaths: [{ closed: true, nodes: rounded[0] }] }, w: 100, h: 100 });
  assert.match(d, /C/);
});
