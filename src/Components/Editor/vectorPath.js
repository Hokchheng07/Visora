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

export const presetVectors = {
  square: closed([corner(0, 0), corner(100, 0), corner(100, 100), corner(0, 100)]),
  circle: closed(ellipse()),
  pill: closed(pill(480, 220)),
  star: closed([
    corner(50, 0), corner(61, 35), corner(98, 35), corner(68, 57), corner(79, 93),
    corner(50, 72), corner(21, 93), corner(32, 57), corner(2, 35), corner(39, 35),
  ]),
  // Converted from the catalog's heart path and re-ordered to start at the cleft.
  heart: closed([
    { x: 50, y: 21, mode: "corner", in: handle(-11, -19), out: handle(11, -19) },
    { x: 93, y: 28, mode: "smooth", in: handle(-5, -22), out: handle(5, 22) },
    { x: 50, y: 94, mode: "corner", in: handle(38, -25), out: handle(-38, -25) },
    { x: 7, y: 28, mode: "smooth", in: handle(-5, 22), out: handle(5, -22) },
  ]),
};

// Width and height matter only for size-dependent presets (the pill).
export function presetVector(shape, width, height) {
  if (shape === "pill" && width > 0 && height > 0) return closed(pill(width, height));
  return presetVectors[shape] || null;
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
