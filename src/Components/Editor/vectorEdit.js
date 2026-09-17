import { MIN_SIZE, radians } from "./elementGeometry.js";
import { cornerRadiiFor, presetVector } from "./vectorPath.js";

/*
 * Point editing, as plain functions.
 *
 * Stored shapes keep their points in a 0–100 box so they stretch with the
 * element. Editing does not: while points are edited they are handled in the
 * element's own pixels ("local" space — the unrotated box, origin at its top
 * left), because a drag, a typed X or a corner radius are all pixels. The
 * editor turns stored points into local ones (editableSubpaths), changes them
 * with the helpers below, and turns them back into element changes
 * (vectorChanges), which also re-fits the box around the new outline so the
 * selection frame always hugs the shape, as in Figma.
 *
 * A point is addressed by a key "subpath:node", so a selection survives
 * re-renders without holding object references.
 *
 * Mirroring is Figma's: how a point's two curve handles move together.
 *   none              — each handle moves on its own (a corner).
 *   angle             — the handles stay in one line; their lengths differ.
 *   angle-and-length  — the handles stay in one line and are the same length.
 */

export const MIRRORING = ["none", "angle", "angle-and-length"];
export const VECTOR_LIMITS = { subpaths: 20, nodes: 1000 };

const round = (value) => Math.round(value * 1000) / 1000;
const finite = (value) => Number.isFinite(Number(value));
const length = (vector) => Math.hypot(vector.dx, vector.dy);
const scaled = (vector, factor) => ({ dx: vector.dx * factor, dy: vector.dy * factor });

export const nodeKey = (subpath, node) => `${subpath}:${node}`;
export const parseKey = (key) => { const [subpath, node] = String(key).split(":").map(Number); return { subpath, node }; };

// Documents written before mirroring existed said "smooth" or "corner".
export const mirroringOf = (node) => (MIRRORING.includes(node?.mirroring) ? node.mirroring : node?.mode === "smooth" ? "angle" : "none");

function normalizeHandle(raw) {
  if (!raw || typeof raw !== "object" || !finite(raw.dx) || !finite(raw.dy)) return null;
  const handle = { dx: round(Number(raw.dx)), dy: round(Number(raw.dy)) };
  return handle.dx || handle.dy ? handle : null;
}

/* A vector from a document, checked: 1 to 20 closed subpaths of at least 3
   points each, at most 1000 points in all, every number finite. Anything that
   fails is not a vector (null), so the shape falls back to its preset. */
export function normalizeVector(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.subpaths)) return null;
  if (!raw.subpaths.length || raw.subpaths.length > VECTOR_LIMITS.subpaths) return null;
  let total = 0;
  const subpaths = [];
  for (const subpath of raw.subpaths) {
    if (!subpath || !Array.isArray(subpath.nodes) || subpath.nodes.length < 3) return null;
    const nodes = [];
    for (const node of subpath.nodes) {
      if (!node || !finite(node.x) || !finite(node.y)) return null;
      const radius = finite(node.cornerRadius) && Number(node.cornerRadius) > 0 ? round(Number(node.cornerRadius)) : undefined;
      nodes.push({
        x: round(Number(node.x)), y: round(Number(node.y)),
        in: normalizeHandle(node.in), out: normalizeHandle(node.out),
        mirroring: mirroringOf(node),
        ...(radius !== undefined ? { cornerRadius: radius } : {}),
      });
    }
    total += nodes.length;
    subpaths.push({ closed: true, nodes });
  }
  return total <= VECTOR_LIMITS.nodes ? { subpaths } : null;
}

/* ---------- Page and local space ---------- */

// Local (the element's unrotated box, origin top left) → page coordinates.
export function localToPage(element, point) {
  const angle = radians(element.rotation || 0), cos = Math.cos(angle), sin = Math.sin(angle);
  const rx = point.x - element.w / 2, ry = point.y - element.h / 2;
  return { x: element.x + element.w / 2 + rx * cos - ry * sin, y: element.y + element.h / 2 + rx * sin + ry * cos };
}

export function pageToLocal(element, point) {
  const angle = radians(element.rotation || 0), cos = Math.cos(angle), sin = Math.sin(angle);
  const px = point.x - element.x - element.w / 2, py = point.y - element.y - element.h / 2;
  return { x: px * cos + py * sin + element.w / 2, y: -px * sin + py * cos + element.h / 2 };
}

// A page-space movement expressed along the element's own (rotated) axes.
export function pageDeltaToLocal(element, dx, dy) {
  const angle = radians(element.rotation || 0), cos = Math.cos(angle), sin = Math.sin(angle);
  return { dx: dx * cos + dy * sin, dy: -dx * sin + dy * cos };
}

/* The element's points in local pixels, with flips and a rectangle's
   per-corner radii built in — what you see is what you edit. */
export function editableSubpaths(element) {
  const source = normalizeVector(element.vector) || presetVector(element.shape, element.w, element.h);
  if (!source) return [];
  const sx = element.w / 100, sy = element.h / 100;
  const fx = element.flipX ? -1 : 1, fy = element.flipY ? -1 : 1;
  const radii = cornerRadiiFor(element.shape, element.vector, element.cornerRadii);
  return source.subpaths.map((subpath) => subpath.nodes.map((node) => {
    const x = (element.flipX ? 100 - node.x : node.x) * sx, y = (element.flipY ? 100 - node.y : node.y) * sy;
    const corner = radii ? radii[y < element.h / 2 ? (x < element.w / 2 ? 0 : 1) : (x < element.w / 2 ? 3 : 2)] : undefined;
    const radius = node.cornerRadius ?? (corner > 0 ? corner : undefined);
    return {
      x, y,
      in: node.in ? { dx: fx * node.in.dx * sx, dy: fy * node.in.dy * sy } : null,
      out: node.out ? { dx: fx * node.out.dx * sx, dy: fy * node.out.dy * sy } : null,
      mirroring: mirroringOf(node),
      ...(radius !== undefined ? { cornerRadius: radius } : {}),
    };
  }));
}

/* ---------- Bounds ---------- */

// Extremes of one cubic segment on one axis: its ends, plus where its slope is zero.
function cubicRange(p0, p1, p2, p3) {
  const values = [p0, p3];
  const a = -p0 + 3 * p1 - 3 * p2 + p3, b = 2 * (p0 - 2 * p1 + p2), c = p1 - p0;
  const at = (t) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
  if (Math.abs(a) < 1e-9) { if (Math.abs(b) > 1e-9) { const t = -c / b; if (t > 0 && t < 1) values.push(at(t)); } }
  else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) for (const t of [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)]) if (t > 0 && t < 1) values.push(at(t));
  }
  return [Math.min(...values), Math.max(...values)];
}

export const segmentPoints = (from, to) => ({
  p0: { x: from.x, y: from.y },
  c1: from.out ? { x: from.x + from.out.dx, y: from.y + from.out.dy } : { x: from.x, y: from.y },
  c2: to.in ? { x: to.x + to.in.dx, y: to.y + to.in.dy } : { x: to.x, y: to.y },
  p3: { x: to.x, y: to.y },
});

// The drawn outline's true bounds: curves can bulge past their points.
export function outlineBounds(subpaths) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const nodes of subpaths) {
    nodes.forEach((node, index) => {
      const { p0, c1, c2, p3 } = segmentPoints(node, nodes[(index + 1) % nodes.length]);
      const [x0, x1] = cubicRange(p0.x, c1.x, c2.x, p3.x), [y0, y1] = cubicRange(p0.y, c1.y, c2.y, p3.y);
      left = Math.min(left, x0); right = Math.max(right, x1); top = Math.min(top, y0); bottom = Math.max(bottom, y1);
    });
  }
  return { left, top, right, bottom };
}

/* Edited local points → changes for the element: the box re-fitted around
   the outline (kept in place on the page even when the shape is rotated), the
   points back in the 0–100 box, and the shape marked custom. Flips and
   per-corner radii are already inside the points, so they are cleared. */
export function vectorChanges(element, subpaths) {
  let { left, top, right, bottom } = outlineBounds(subpaths);
  // A very thin outline still needs a box the frame can be grabbed by.
  if (right - left < MIN_SIZE) { const grow = (MIN_SIZE - (right - left)) / 2; left -= grow; right += grow; }
  if (bottom - top < MIN_SIZE) { const grow = (MIN_SIZE - (bottom - top)) / 2; top -= grow; bottom += grow; }
  const w = right - left, h = bottom - top;
  const centre = localToPage(element, { x: (left + right) / 2, y: (top + bottom) / 2 });
  const sx = 100 / w, sy = 100 / h;
  const handle = (value) => (value ? { dx: round(value.dx * sx), dy: round(value.dy * sy) } : null);
  return {
    x: round(centre.x - w / 2), y: round(centre.y - h / 2), w: round(w), h: round(h),
    shape: "custom", flipX: false, flipY: false, cornerRadii: null,
    vector: {
      subpaths: subpaths.map((nodes) => ({
        closed: true,
        nodes: nodes.map((node) => ({
          x: round((node.x - left) * sx), y: round((node.y - top) * sy),
          in: handle(node.in), out: handle(node.out), mirroring: node.mirroring || "none",
          ...(node.cornerRadius > 0 ? { cornerRadius: round(node.cornerRadius) } : {}),
        })),
      })),
    },
  };
}

/* ---------- Editing ---------- */

const clone = (subpaths) => subpaths.map((nodes) => nodes.map((node) => ({ ...node, in: node.in && { ...node.in }, out: node.out && { ...node.out } })));
const valid = (subpaths, keys) => keys.map(parseKey).filter(({ subpath, node }) => subpaths[subpath]?.[node]);

export const validKeys = (subpaths, keys) => valid(subpaths, keys).map(({ subpath, node }) => nodeKey(subpath, node));
export const allKeys = (subpaths) => subpaths.flatMap((nodes, subpath) => nodes.map((_node, node) => nodeKey(subpath, node)));

// Points move; their handles are offsets, so they come along.
export function moveNodes(subpaths, keys, dx, dy) {
  const next = clone(subpaths);
  for (const { subpath, node } of valid(next, keys)) { next[subpath][node].x += dx; next[subpath][node].y += dy; }
  return next;
}

/* Sets one handle to an offset and moves its partner according to the point's
   mirroring. The partner only follows when it exists: a straight side stays
   straight until the point is given handles on purpose. */
export function setHandle(subpaths, key, side, offset) {
  const next = clone(subpaths);
  const { subpath, node } = parseKey(key);
  const point = next[subpath]?.[node];
  if (!point) return subpaths;
  const other = side === "in" ? "out" : "in";
  point[side] = offset.dx || offset.dy ? { dx: offset.dx, dy: offset.dy } : null;
  const mode = mirroringOf(point), dragged = point[side];
  if (dragged && point[other] && mode !== "none") {
    const size = mode === "angle-and-length" ? length(dragged) : length(point[other]);
    const unit = length(dragged) || 1;
    point[other] = scaled(dragged, -size / unit);
  }
  return next;
}

/* Changes how a point's handles move together, and shapes them to match. A
   point with no handles gets smooth ones pointing along its neighbours, the way
   Figma turns a corner into a curve. */
export function setMirroring(subpaths, keys, mode) {
  if (!MIRRORING.includes(mode)) return subpaths;
  const next = clone(subpaths);
  for (const { subpath, node } of valid(next, keys)) {
    const nodes = next[subpath], point = nodes[node];
    point.mirroring = mode;
    if (mode === "none") continue;
    const previous = nodes[(node - 1 + nodes.length) % nodes.length], following = nodes[(node + 1) % nodes.length];
    if (!point.in && !point.out) {
      const direction = { dx: following.x - previous.x, dy: following.y - previous.y };
      const unit = length(direction) || 1;
      const inLength = Math.hypot(point.x - previous.x, point.y - previous.y) / 3;
      const outLength = Math.hypot(following.x - point.x, following.y - point.y) / 3;
      const shared = (inLength + outLength) / 2;
      point.in = scaled(direction, -(mode === "angle-and-length" ? shared : inLength) / unit);
      point.out = scaled(direction, (mode === "angle-and-length" ? shared : outLength) / unit);
      delete point.cornerRadius;
      continue;
    }
    // One handle: the missing side mirrors it.
    if (!point.in) point.in = scaled(point.out, -1);
    if (!point.out) point.out = scaled(point.in, -1);
    // Both: line them up along the average direction.
    const direction = { dx: point.out.dx - point.in.dx, dy: point.out.dy - point.in.dy };
    const unit = length(direction) || 1;
    const inSize = mode === "angle-and-length" ? (length(point.in) + length(point.out)) / 2 : length(point.in);
    const outSize = mode === "angle-and-length" ? inSize : length(point.out);
    point.in = scaled(direction, -inSize / unit);
    point.out = scaled(direction, outSize / unit);
  }
  return next;
}

// Double-click on a point: a curve becomes a corner, a corner becomes a curve.
export function toggleCurve(subpaths, key) {
  const { subpath, node } = parseKey(key);
  const point = subpaths[subpath]?.[node];
  if (!point) return subpaths;
  if (!point.in && !point.out) return setMirroring(subpaths, [key], "angle-and-length");
  const next = clone(subpaths);
  Object.assign(next[subpath][node], { in: null, out: null, mirroring: "none" });
  return next;
}

/* Removes points; the neighbours join up with their own handles. Refused
   (null) when a subpath would drop below three points and stop being a shape. */
export function deleteNodes(subpaths, keys) {
  const doomed = new Set(validKeys(subpaths, keys));
  if (!doomed.size) return null;
  const next = clone(subpaths).map((nodes, subpath) => nodes.filter((_node, index) => !doomed.has(nodeKey(subpath, index))));
  return next.every((nodes) => nodes.length >= 3) ? next : null;
}

const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/* Adds a point on the segment after `index`, at `t` along it. A curve is split
   exactly (de Casteljau), so the outline does not change shape — it just gains
   a point you can drag. Returns the new subpaths and the new point's key. */
export function insertNode(subpaths, subpath, index, t) {
  const next = clone(subpaths), nodes = next[subpath];
  if (!nodes) return { subpaths, key: null };
  const from = nodes[index], toIndex = (index + 1) % nodes.length, to = nodes[toIndex];
  const { p0, c1, c2, p3 } = segmentPoints(from, to);
  let point;
  if (!from.out && !to.in) point = { ...lerp(p0, p3, t), in: null, out: null, mirroring: "none" };
  else {
    const q0 = lerp(p0, c1, t), q1 = lerp(c1, c2, t), q2 = lerp(c2, p3, t), r0 = lerp(q0, q1, t), r1 = lerp(q1, q2, t), s = lerp(r0, r1, t);
    from.out = from.out ? { dx: q0.x - p0.x, dy: q0.y - p0.y } : null;
    to.in = to.in ? { dx: q2.x - p3.x, dy: q2.y - p3.y } : null;
    point = { x: s.x, y: s.y, in: { dx: r0.x - s.x, dy: r0.y - s.y }, out: { dx: r1.x - s.x, dy: r1.y - s.y }, mirroring: "angle" };
  }
  nodes.splice(index + 1, 0, point);
  return { subpaths: next, key: nodeKey(subpath, index + 1) };
}

// The closest point on any segment to `target`, for click-to-add.
export function nearestOnOutline(subpaths, target) {
  let best = null;
  subpaths.forEach((nodes, subpath) => nodes.forEach((node, index) => {
    const { p0, c1, c2, p3 } = segmentPoints(node, nodes[(index + 1) % nodes.length]);
    const at = (t) => {
      const u = 1 - t;
      return { x: u ** 3 * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * p3.x, y: u ** 3 * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * p3.y };
    };
    // Coarse samples, then a narrowing search around the best one.
    let bestT = 0, bestDistance = Infinity;
    for (let step = 0; step <= 32; step++) {
      const point = at(step / 32), distance = Math.hypot(point.x - target.x, point.y - target.y);
      if (distance < bestDistance) { bestDistance = distance; bestT = step / 32; }
    }
    let span = 1 / 32;
    for (let pass = 0; pass < 12; pass++) {
      for (const t of [bestT - span, bestT + span]) {
        if (t < 0 || t > 1) continue;
        const point = at(t), distance = Math.hypot(point.x - target.x, point.y - target.y);
        if (distance < bestDistance) { bestDistance = distance; bestT = t; }
      }
      span /= 2;
    }
    if (!best || bestDistance < best.distance) best = { subpath, index, t: bestT, distance: bestDistance, point: at(bestT) };
  }));
  return best;
}

export function setCornerRadius(subpaths, keys, radius) {
  const next = clone(subpaths);
  for (const { subpath, node } of valid(next, keys)) {
    if (radius > 0) next[subpath][node].cornerRadius = radius;
    else delete next[subpath][node].cornerRadius;
  }
  return next;
}

// The selected points' own box (anchors only, the way Figma aligns them).
export function pointsBounds(subpaths, keys) {
  const points = valid(subpaths, keys).map(({ subpath, node }) => subpaths[subpath][node]);
  if (!points.length) return null;
  const xs = points.map((point) => point.x), ys = points.map((point) => point.y);
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

export function alignNodes(subpaths, keys, edge) {
  const box = pointsBounds(subpaths, keys);
  if (!box) return subpaths;
  const next = clone(subpaths);
  for (const { subpath, node } of valid(next, keys)) {
    const point = next[subpath][node];
    if (edge === "left") point.x = box.left;
    if (edge === "center") point.x = (box.left + box.right) / 2;
    if (edge === "right") point.x = box.right;
    if (edge === "top") point.y = box.top;
    if (edge === "middle") point.y = (box.top + box.bottom) / 2;
    if (edge === "bottom") point.y = box.bottom;
  }
  return next;
}

// Even spacing between the first and last selected point along one axis.
export function distributeNodes(subpaths, keys, axis) {
  const chosen = valid(subpaths, keys);
  if (chosen.length < 3) return subpaths;
  const next = clone(subpaths), key = axis === "horizontal" ? "x" : "y";
  const sorted = chosen.map(({ subpath, node }) => next[subpath][node]).sort((a, b) => a[key] - b[key]);
  const first = sorted[0][key], gap = (sorted.at(-1)[key] - first) / (sorted.length - 1);
  sorted.forEach((point, index) => { point[key] = first + gap * index; });
  return next;
}

// What the selected points agree on, or null when they differ.
export function sharedValue(subpaths, keys, read) {
  const values = valid(subpaths, keys).map(({ subpath, node }) => read(subpaths[subpath][node]));
  return values.length && values.every((value) => value === values[0]) ? values[0] : null;
}
