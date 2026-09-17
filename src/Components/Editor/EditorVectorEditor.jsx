import { useEffect, useId, useRef, useState } from "react";
import { useAppDispatch, useAppStore } from "../redux/hook.js";
import { elementTransformed, gestureCancelled, gestureFinished, gestureStarted, pointsSelected, targetChanged } from "../redux/editorSlice.js";
import { CANVAS_WIDTH } from "./elementGeometry.js";
import { elementsTarget } from "./inspectorEdit.js";
import {
  editableSubpaths, insertNode, moveNodes, nearestOnOutline, nodeKey, pageDeltaToLocal, pageToLocal, parseKey,
  segmentPoints, setHandle, toggleCurve, validKeys, vectorChanges,
} from "./vectorEdit.js";
import { shapePath } from "./vectorPath.js";

/*
 * The point editor drawn over a shape while its points are edited.
 *
 * It lives inside the element's rotation wrapper with a viewBox of the
 * element's own pixels, so points and handles are drawn in local space and
 * turn with the shape. Pointer maths never reads positions back from this
 * SVG, though: the box re-fits around the outline on every move, so a drag
 * works in page coordinates against the element as it was when the press
 * began, and converts once per move (pageDeltaToLocal).
 *
 *   Drag a point            move it (and every other selected point)
 *   Shift-click a point     add it to or take it out of the selection
 *   Drag a handle           bend the curve; the other handle follows the point's mirroring
 *   Double-click a point    corner ↔ curve
 *   Click a line            add a point there
 *   Drag on empty space     select points in a box
 *
 * Every drag is one canvas gesture, so one undo step, and Escape cancels it.
 */

const HIT = 7;     // screen pixels a press may miss a line by and still add a point
const POINT = 4.5; // screen-pixel radius of a point

export default function EditorVectorEditor({ element, pageId, sheetRef, scale, keys }) {
  const dispatch = useAppDispatch(), store = useAppStore();
  const drag = useRef(null);
  const [box, setBox] = useState(null);
  const token = `points:${element.id}`;
  const subpaths = editableSubpaths(element);
  const selected = new Set(validKeys(subpaths, keys));
  const unit = 1 / (scale || 1);
  const target = elementsTarget(pageId, [element.id]);
  const hatchId = `hatch-${useId().replace(/:/g, "")}`;
  // The drawn shape itself (corner radius and all), so the stripes cover exactly what you see.
  const area = shapePath({ shape: element.shape, vector: element.vector, w: element.w, h: element.h,
    cornerRadius: element.cornerRadius || 0, cornerRadii: element.cornerRadii, flipX: element.flipX, flipY: element.flipY });

  useEffect(() => {
    function cancel(event) {
      const active = drag.current;
      if (!active || (event?.type === "keydown" && event.key !== "Escape")) return;
      if (event?.type === "keydown") { event.preventDefault(); event.stopImmediatePropagation(); }
      drag.current = null; setBox(null);
      if (active.gesture) dispatch(gestureCancelled(token));
    }
    window.addEventListener("blur", cancel);
    document.addEventListener("keydown", cancel, true);
    return () => { window.removeEventListener("blur", cancel); document.removeEventListener("keydown", cancel, true); if (drag.current?.gesture) dispatch(gestureCancelled(token)); };
  }, [dispatch, token]);

  function pagePoint(event) {
    const rect = sheetRef.current.getBoundingClientRect(), pageScale = rect.width / CANVAS_WIDTH;
    return { x: (event.clientX - rect.left) / pageScale, y: (event.clientY - rect.top) / pageScale };
  }

  function begin(event, active) {
    if (event.button !== 0 || store.getState().editor.gesture) return;
    event.preventDefault(); event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { ...active, pointerId: event.pointerId, start: pagePoint(event), element: { ...element }, subpaths, moved: false, gesture: false, capture: event.currentTarget };
  }

  function pressPoint(event, key) {
    let chosen = [...selected];
    if (event.shiftKey) {
      dispatch(pointsSelected({ keys: [key], additive: true }));
      chosen = selected.has(key) ? chosen.filter((item) => item !== key) : [...chosen, key];
    } else if (!selected.has(key)) {
      dispatch(pointsSelected({ keys: [key] }));
      chosen = [key];
    }
    begin(event, { kind: "point", keys: chosen });
  }

  function move(event) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const now = pagePoint(event);
    if (active.kind === "box") {
      const a = pageToLocal(active.element, active.start), b = pageToLocal(active.element, now);
      setBox({ left: Math.min(a.x, b.x), top: Math.min(a.y, b.y), right: Math.max(a.x, b.x), bottom: Math.max(a.y, b.y) });
      return;
    }
    const delta = pageDeltaToLocal(active.element, now.x - active.start.x, now.y - active.start.y);
    // Three screen pixels before anything moves, so a click on a point never nudges it.
    if (!active.moved && Math.hypot(delta.dx, delta.dy) < 3 * unit) return;
    active.moved = true;
    if (!active.gesture) { active.gesture = true; dispatch(gestureStarted(token)); }
    let next;
    if (active.kind === "point") next = moveNodes(active.subpaths, active.keys, delta.dx, delta.dy);
    else {
      const { subpath, node } = parseKey(active.key);
      const base = active.subpaths[subpath][node][active.side] || { dx: 0, dy: 0 };
      next = setHandle(active.subpaths, active.key, active.side, { dx: base.dx + delta.dx, dy: base.dy + delta.dy });
    }
    dispatch(elementTransformed({ token, changes: vectorChanges(active.element, next) }));
  }

  function end(event, cancelled = false) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    drag.current = null;
    if (active.capture?.hasPointerCapture?.(event.pointerId)) active.capture.releasePointerCapture(event.pointerId);
    if (active.kind === "box") {
      if (box && !cancelled) {
        const inside = subpaths.flatMap((nodes, subpath) => nodes.flatMap((node, index) => (
          node.x >= box.left && node.x <= box.right && node.y >= box.top && node.y <= box.bottom ? [nodeKey(subpath, index)] : [])));
        dispatch(pointsSelected({ keys: inside, additive: event.shiftKey }));
      } else if (!cancelled && !event.shiftKey) dispatch(pointsSelected({ keys: [] }));
      setBox(null);
      return;
    }
    if (active.gesture) dispatch(cancelled ? gestureCancelled(token) : gestureFinished(token));
  }

  // A press on a line adds a point there and picks it, ready to drag.
  function pressLine(event) {
    if (event.button !== 0 || store.getState().editor.gesture) return;
    event.preventDefault(); event.stopPropagation();
    const hit = nearestOnOutline(subpaths, pageToLocal(element, pagePoint(event)));
    if (!hit || hit.distance > HIT * unit) return;
    const { subpaths: next, key } = insertNode(subpaths, hit.subpath, hit.index, hit.t);
    dispatch(targetChanged({ target, changes: vectorChanges(element, next) }));
    dispatch(pointsSelected({ keys: [key] }));
  }

  const handlers = { onPointerMove: move, onPointerUp: (event) => end(event), onPointerCancel: (event) => end(event, true), onLostPointerCapture: (event) => end(event, true) };

  return (
    <svg className="editor-vector-editor" viewBox={`0 0 ${element.w} ${element.h}`} preserveAspectRatio="none"
      role="group" aria-label="Edit points. Drag a point, double-click it to switch between corner and curve, click a line to add a point.">
      {/* Diagonal stripes over the whole shape, as Figma marks a vector in edit mode.
          Sized in screen pixels, so they keep the same spacing at any zoom. */}
      <defs>
        {/* Two-tone stripes — a light line beside a coloured one — so they show on a light fill and a dark one alike. */}
        <pattern id={hatchId} patternUnits="userSpaceOnUse" width={8 * unit} height={8 * unit} patternTransform="rotate(45)">
          <line x1={1 * unit} y1={0} x2={1 * unit} y2={8 * unit} className="editor-vector-hatch-light" strokeWidth={2 * unit} />
          <line x1={2.6 * unit} y1={0} x2={2.6 * unit} y2={8 * unit} className="editor-vector-hatch-line" strokeWidth={1.4 * unit} />
        </pattern>
      </defs>
      <path d={area} fill={`url(#${hatchId})`} className="editor-vector-hatch" />
      {/* Only the shape's own box: a press outside it reaches the canvas, which ends point editing. */}
      <rect x={0} y={0} width={element.w} height={element.h} fill="transparent" className="editor-vector-backdrop"
        onPointerDown={(event) => begin(event, { kind: "box" })} {...handlers} />
      {subpaths.map((nodes, subpath) => nodes.map((node, index) => {
        const { p0, c1, c2, p3 } = segmentPoints(node, nodes[(index + 1) % nodes.length]);
        const straight = !node.out && !nodes[(index + 1) % nodes.length].in;
        const d = straight ? `M${p0.x} ${p0.y}L${p3.x} ${p3.y}` : `M${p0.x} ${p0.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p3.x} ${p3.y}`;
        return (
          <g key={`line-${subpath}-${index}`}>
            <path d={d} className="editor-vector-line" vectorEffect="non-scaling-stroke" />
            <path d={d} className="editor-vector-line-hit" vectorEffect="non-scaling-stroke" onPointerDown={pressLine} />
          </g>
        );
      }))}
      {subpaths.map((nodes, subpath) => nodes.map((node, index) => {
        const key = nodeKey(subpath, index);
        if (!selected.has(key)) return null;
        return ["in", "out"].map((side) => node[side] && (
          <g key={`${key}-${side}`}>
            <line x1={node.x} y1={node.y} x2={node.x + node[side].dx} y2={node.y + node[side].dy} className="editor-vector-handle-line" vectorEffect="non-scaling-stroke" />
            <circle cx={node.x + node[side].dx} cy={node.y + node[side].dy} r={3.5 * unit} className="editor-vector-handle"
              vectorEffect="non-scaling-stroke" onPointerDown={(event) => begin(event, { kind: "handle", key, side })} {...handlers} />
          </g>
        ));
      }))}
      {subpaths.map((nodes, subpath) => nodes.map((node, index) => {
        const key = nodeKey(subpath, index);
        return (
          <rect key={key} x={node.x - POINT * unit} y={node.y - POINT * unit} width={POINT * 2 * unit} height={POINT * 2 * unit}
            rx={node.in || node.out ? POINT * unit : 1.2 * unit}
            className={`editor-vector-point${selected.has(key) ? " is-selected" : ""}`} vectorEffect="non-scaling-stroke"
            onPointerDown={(event) => pressPoint(event, key)} {...handlers}
            onDoubleClick={(event) => {
              event.stopPropagation();
              dispatch(targetChanged({ target, changes: vectorChanges(element, toggleCurve(subpaths, key)) }));
            }} />
        );
      }))}
      {box && <rect x={box.left} y={box.top} width={box.right - box.left} height={box.bottom - box.top} className="editor-vector-marquee" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
