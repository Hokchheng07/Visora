/*
 * Vector shapes as point data.
 *
 * A shape is a list of subpaths; a subpath is a list of nodes in the shape's
 * own 0–100 box (the same box the SVG viewBox uses, so resizing the element
 * stretches the shape). Nodes are the source of truth. The SVG `d` string is
 * always generated from them and never parsed back — editing points later
 * needs the nodes, and a general path parser would be far more code than the
 * few shapes we ship.
 *
 * A node's handles are offsets from the node itself, or null for a straight
 * line. The segment from node A to node B is a cubic curve using A.out and
 * B.in; when both are null it is a straight line.
 *
 * Every preset starts at its top-most node (left-most on a tie) and runs
 * clockwise. Morphing blends two outlines point by point from their starts,
 * so presets that started in different places would twist mid-morph.
 */

const round = (value) => Math.round(value * 1000) / 1000;
const point = (x, y) => `${round(x)} ${round(y)}`;

function segment(from, to) {
  if (!from.out && !to.in) return `L${point(to.x, to.y)}`;
  const c1 = from.out ? [from.x + from.out.dx, from.y + from.out.dy] : [from.x, from.y];
  const c2 = to.in ? [to.x + to.in.dx, to.y + to.in.dy] : [to.x, to.y];
  return `C${point(...c1)} ${point(...c2)} ${point(to.x, to.y)}`;
}

export function subpathToD({ nodes, closed }) {
  if (!nodes?.length) return "";
  const parts = [`M${point(nodes[0].x, nodes[0].y)}`];
  for (let index = 1; index < nodes.length; index++) parts.push(segment(nodes[index - 1], nodes[index]));
  if (closed && nodes.length > 1) {
    const last = nodes[nodes.length - 1], first = nodes[0];
    // A curved closing segment has to be drawn explicitly; Z alone is always straight.
    if (last.out || first.in) parts.push(segment(last, first));
    parts.push("Z");
  }
  return parts.join("");
}

export function nodesToD(vector) {
  return (vector?.subpaths || []).map(subpathToD).filter(Boolean).join("");
}

const corner = (x, y) => ({ x, y, mode: "corner", in: null, out: null });
const handle = (dx, dy) => ({ dx, dy });

// Cubic handle length for a quarter circle of radius 1.
export const CIRCLE_HANDLE = 0.5523;

function ellipse() {
  const k = 50 * CIRCLE_HANDLE;
  return [
    { x: 50, y: 0, mode: "smooth", in: handle(-k, 0), out: handle(k, 0) },
    { x: 100, y: 50, mode: "smooth", in: handle(0, -k), out: handle(0, k) },
    { x: 50, y: 100, mode: "smooth", in: handle(k, 0), out: handle(-k, 0) },
    { x: 0, y: 50, mode: "smooth", in: handle(0, k), out: handle(0, -k) },
  ];
}

/* A pill keeps round ends at any size, so unlike the other presets it cannot
   be one fixed outline stretched by the viewBox: stretched, its ends turn into
   pointed half-ellipses (proved on the Phase 0 lab page). It is rebuilt for
   the element's current width and height instead. Once its points are
   edited it becomes a custom shape and stretches like any other. */
function pill(width, height) {
  const k = CIRCLE_HANDLE;
  if (Math.abs(width - height) < 0.5) return ellipse();
  if (width > height) {
    const rx = (height / 2) / width * 100, kx = rx * k, ky = 50 * k;
    return [
      { x: rx, y: 0, mode: "smooth", in: handle(-kx, 0), out: null },
      { x: 100 - rx, y: 0, mode: "smooth", in: null, out: handle(kx, 0) },
      { x: 100, y: 50, mode: "smooth", in: handle(0, -ky), out: handle(0, ky) },
      { x: 100 - rx, y: 100, mode: "smooth", in: handle(kx, 0), out: null },
      { x: rx, y: 100, mode: "smooth", in: null, out: handle(-kx, 0) },
      { x: 0, y: 50, mode: "smooth", in: handle(0, ky), out: handle(0, -ky) },
    ];
  }
  const ry = (width / 2) / height * 100, kx = 50 * k, ky = ry * k;
  return [
    { x: 50, y: 0, mode: "smooth", in: handle(-kx, 0), out: handle(kx, 0) },
    { x: 100, y: ry, mode: "smooth", in: handle(0, -ky), out: null },
    { x: 100, y: 100 - ry, mode: "smooth", in: null, out: handle(0, ky) },
    { x: 50, y: 100, mode: "smooth", in: handle(kx, 0), out: handle(-kx, 0) },
    { x: 0, y: 100 - ry, mode: "smooth", in: handle(0, ky), out: null },
    { x: 0, y: ry, mode: "smooth", in: null, out: handle(0, -ky) },
  ];
}

const closed = (nodes) => ({ subpaths: [{ closed: true, nodes }] });

const polygon = (...points) => closed(points.map(([x, y]) => corner(x, y)));
// The burst is a 24-point star; its points are generated rather than listed.
function burst() {
  const steps = [[9, 23], [20, -15], [-3, 25], [25, -3], [-15, 20], [23, 9], [-23, 9], [15, 20], [-25, -3], [3, 25], [-20, -15], [-9, 23],
    [-9, -23], [-20, 15], [3, -25], [-25, 3], [15, -20], [-23, -9], [23, -9], [-15, -20], [25, 3], [-3, -25], [20, 15]];
  const points = [[50, 1]];
  for (const [dx, dy] of steps) { const [x, y] = points.at(-1); points.push([x + dx, y + dy]); }
  return polygon(...points);
}

export const presetVectors = {
  square: polygon([0, 0], [100, 0], [100, 100], [0, 100]),
  rectangle: polygon([0, 0], [100, 0], [100, 100], [0, 100]),
  // Same outline as a rectangle; its roundness comes from the element's corner radius.
  "rounded-rectangle": polygon([0, 0], [100, 0], [100, 100], [0, 100]),
  circle: closed(ellipse()),
  pill: closed(pill(480, 220)),
  triangle: polygon([50, 0], [100, 100], [0, 100]),
  diamond: polygon([50, 0], [100, 50], [50, 100], [0, 50]),
  star: polygon([50, 0], [61, 35], [98, 35], [68, 57], [79, 93], [50, 72], [21, 93], [32, 57], [2, 35], [39, 35]),
  pentagon: polygon([50, 3], [98, 38], [80, 96], [20, 96], [2, 38]),
  hexagon: polygon([25, 4], [75, 4], [99, 50], [75, 96], [25, 96], [1, 50]),
  parallelogram: polygon([20, 5], [98, 5], [80, 95], [2, 95]),
  "arrow-right": polygon([60, 8], [98, 50], [60, 92], [60, 68], [2, 68], [2, 32], [60, 32]),
  // Redrawn: the old path visited (66, 50) twice, which would stack two points.
  "chevron-right": polygon([18, 2], [50, 2], [98, 50], [50, 98], [18, 98], [66, 50]),
  heart: closed([
    // Converted from the catalog's heart path and re-ordered to start at the cleft.
    { x: 50, y: 21, mode: "corner", in: handle(-11, -19), out: handle(11, -19) },
    { x: 93, y: 28, mode: "smooth", in: handle(-5, -22), out: handle(5, 22) },
    { x: 50, y: 94, mode: "corner", in: handle(38, -25), out: handle(-38, -25) },
    { x: 7, y: 28, mode: "smooth", in: handle(-5, 22), out: handle(5, -22) },
  ]),
  "speech-bubble": polygon([5, 8], [95, 8], [95, 73], [48, 73], [24, 96], [29, 73], [5, 73]),
  cross: polygon([36, 4], [64, 4], [64, 36], [96, 36], [96, 64], [64, 64], [64, 96], [36, 96], [36, 64], [4, 64], [4, 36], [36, 36]),
  burst: burst(),
};

// Width and height matter only for size-dependent presets (the pill).
export function presetVector(shape, width, height) {
  if (shape === "pill" && width > 0 && height > 0) return closed(pill(width, height));
  return presetVectors[shape] || null;
}

/* Rounds every corner that has straight lines on both sides, the way Figma's
   corner radius does. Works in pixels, so a radius stays circular on a
   stretched shape. Each corner is cut back along both edges by the tangent
   distance r / tan(θ/2), capped at half of each edge so neighbouring corners
   never overlap (the radius shrinks to fit instead), and the cut is bridged
   with the standard cubic arc: handle length 4/3 · tan(φ/4) · r for a turn φ.
   Curved corners (circle, pill, heart) are left alone.

   `radius` is one number for every corner, or a function (node) => number for
   a different radius per corner. */
export function roundCorners(nodes, radius) {
  const radiusAt = typeof radius === "function" ? radius : () => radius;
  if (nodes.length < 3 || (typeof radius !== "function" && !(radius > 0))) return nodes;
  const count = nodes.length;
  const straight = (from, to) => !from.out && !to.in;
  const result = [];
  nodes.forEach((node, index) => {
    const previous = nodes[(index - 1 + count) % count], next = nodes[(index + 1) % count];
    const nodeRadius = radiusAt(node);
    if (!(nodeRadius > 0) || node.in || node.out || !straight(previous, node) || !straight(node, next)) { result.push(node); return; }
    const ax = previous.x - node.x, ay = previous.y - node.y, bx = next.x - node.x, by = next.y - node.y;
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    if (la < 1e-6 || lb < 1e-6) { result.push(node); return; }
    const ua = [ax / la, ay / la], ub = [bx / lb, by / lb];
    const angle = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1])));
    if (angle < 1e-3 || angle > Math.PI - 1e-3) { result.push(node); return; }
    const tan = Math.tan(angle / 2);
    const distance = Math.min(nodeRadius / tan, la / 2, lb / 2);
    const fitted = distance * tan;
    const length = (4 / 3) * Math.tan((Math.PI - angle) / 4) * fitted;
    result.push(
      { x: node.x + ua[0] * distance, y: node.y + ua[1] * distance, mode: "smooth", in: null, out: handle(-ua[0] * length, -ua[1] * length) },
      { x: node.x + ub[0] * distance, y: node.y + ub[1] * distance, mode: "smooth", in: handle(-ub[0] * length, -ub[1] * length), out: null },
    );
  });
  return result;
}

/* The SVG path for a shape element, in its own pixel space (0…w, 0…h), so the
   SVG uses viewBox="0 0 w h" and stroke widths and corner radii are real
   canvas pixels that scale evenly with the element on every surface. */
/* Shapes whose four corners can each take their own radius, as in Figma, where
   independent corners belong to rectangles. */
export const INDEPENDENT_CORNER_SHAPES = new Set(["square", "rectangle", "rounded-rectangle"]);
export const CORNER_NAMES = ["Top left", "Top right", "Bottom right", "Bottom left"];

/* A valid per-corner list [top left, top right, bottom right, bottom left] for
   this shape, or null. Custom (point-edited) shapes use the single radius. */
export function cornerRadiiFor(shape, vector, radii) {
  if (vector || !INDEPENDENT_CORNER_SHAPES.has(shape) || !Array.isArray(radii) || radii.length !== 4) return null;
  return radii.every((value) => Number.isFinite(Number(value)) && Number(value) >= 0) ? radii.map(Number) : null;
}

export function shapePath({ shape, vector, w, h, cornerRadius = 0, cornerRadii = null, flipX = false, flipY = false }) {
  const source = vector || presetVector(shape, w, h);
  if (!source || !(w > 0) || !(h > 0)) return "";
  const sx = w / 100, sy = h / 100;
  return source.subpaths.map((subpath) => {
    let nodes = subpath.nodes.map((node) => ({
      ...node,
      x: (flipX ? 100 - node.x : node.x) * sx,
      y: (flipY ? 100 - node.y : node.y) * sy,
      in: node.in && handle((flipX ? -node.in.dx : node.in.dx) * sx, (flipY ? -node.in.dy : node.in.dy) * sy),
      out: node.out && handle((flipX ? -node.out.dx : node.out.dx) * sx, (flipY ? -node.out.dy : node.out.dy) * sy),
    }));
    const radii = cornerRadiiFor(shape, vector, cornerRadii);
    /* Per-corner radii follow the corner you see, after flipping: the field
       labelled "Top left" always rounds the top-left corner on the canvas. */
    if (subpath.closed && radii) nodes = roundCorners(nodes, (node) => radii[node.y < h / 2 ? (node.x < w / 2 ? 0 : 1) : (node.x < w / 2 ? 3 : 2)]);
    /* A point can carry its own corner radius (set while editing points, as in
       Figma); a point without one takes the shape's radius. */
    else if (subpath.closed && (cornerRadius > 0 || subpath.nodes.some((node) => node.cornerRadius > 0))) {
      nodes = roundCorners(nodes, (node) => node.cornerRadius ?? cornerRadius);
    }
    return subpathToD({ closed: subpath.closed, nodes });
  }).join("");
}

/* Positive when the anchors run clockwise on screen (y grows downward).
   Uses anchors only, which is enough to tell direction for every preset. */
export function signedArea(nodes) {
  let sum = 0;
  for (let index = 0; index < nodes.length; index++) {
    const a = nodes[index], b = nodes[(index + 1) % nodes.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}
