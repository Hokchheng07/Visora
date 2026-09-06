import { useEffect, useRef } from "react";
import { RotateCw } from "lucide-react";
import { useAppDispatch, useAppStore } from "../redux/hook.js";
import { elementChanged, elementTransformed, gestureStarted, gestureFinished, gestureCancelled } from "../redux/editorSlice.js";
import { CANVAS_WIDTH, resizeElement } from "./elementGeometry.js";

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const LABELS = { nw: "top left", n: "top", ne: "top right", e: "right", se: "bottom right", s: "bottom", sw: "bottom left", w: "left" };

export default function EditorSelectionFrame({ element, sheetRef }) {
  const gestureRef = useRef(null);
  const dispatch = useAppDispatch(), store = useAppStore();
  const token = `handle:${element.id}`;

  useEffect(() => {
    const cancel = () => {
      const active = gestureRef.current;
      if (!active) return;
      gestureRef.current = null;
      if (active.target.hasPointerCapture(active.pointerId)) active.target.releasePointerCapture(active.pointerId);
      dispatch(gestureCancelled(token));
    };
    const keyDown = (event) => {
      if (event.key === "Escape" && gestureRef.current) { event.preventDefault(); event.stopImmediatePropagation(); cancel(); }
    };
    const unsubscribe = store.subscribe(() => {
      if (gestureRef.current && store.getState().editor.gesture?.token !== token) cancel();
    });
    window.addEventListener("blur", cancel);
    window.addEventListener("resize", cancel);
    document.addEventListener("keydown", keyDown, true);
    return () => {
      unsubscribe(); cancel();
      window.removeEventListener("blur", cancel);
      window.removeEventListener("resize", cancel);
      document.removeEventListener("keydown", keyDown, true);
    };
  }, [dispatch, store, token]);

  function start(event, handle) {
    if (event.button !== 0 || gestureRef.current || store.getState().editor.gesture) return;
    event.preventDefault(); event.stopPropagation();
    const rect = sheetRef.current.getBoundingClientRect();
    const scale = rect.width / CANVAS_WIDTH;
    const cx = rect.left + (element.x + element.w / 2) * scale;
    const cy = rect.top + (element.y + element.h / 2) * scale;
    gestureRef.current = { handle, start: element, x: event.clientX, y: event.clientY,
      cx, cy, scale, angle: Math.atan2(event.clientY - cy, event.clientX - cx), target: event.currentTarget, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch(gestureStarted(token));
  }
  function move(event) {
    const g = gestureRef.current;
    if (!g || g.pointerId !== event.pointerId) return;
    let changes;
    if (g.handle === "rotate") {
      let rotation = g.start.rotation + (Math.atan2(event.clientY - g.cy, event.clientX - g.cx) - g.angle) * 180 / Math.PI;
      if (event.shiftKey) rotation = Math.round(rotation / 15) * 15;
      changes = { rotation: ((rotation % 360) + 360) % 360 };
    } else changes = resizeElement(g.start, g.handle, (event.clientX - g.x) / g.scale, (event.clientY - g.y) / g.scale, event.shiftKey);
    dispatch(elementTransformed({ token, changes }));
  }
  function end(event, cancelled = false) {
    const g = gestureRef.current;
    if (!g || g.pointerId !== event.pointerId) return;
    if (!cancelled) move(event);
    gestureRef.current = null;
    if (g.target.hasPointerCapture(g.pointerId)) g.target.releasePointerCapture(g.pointerId);
    dispatch(cancelled ? gestureCancelled(token) : gestureFinished(token));
  }
  function keyboard(event, handle) {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault(); event.stopPropagation();
    const step = event.shiftKey ? 10 : 1;
    if (handle === "rotate") {
      dispatch(elementChanged({ rotation: (element.rotation + (event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1) * (event.shiftKey ? 15 : 1) + 360) % 360 }));
    } else {
      const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
      const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
      dispatch(elementChanged(resizeElement(element, handle, dx, dy, event.shiftKey)));
    }
  }
  function events(handle) {
    return { onPointerDown: (event) => start(event, handle), onPointerMove: move,
      onPointerUp: (event) => end(event), onPointerCancel: (event) => end(event, true),
      onLostPointerCapture: (event) => end(event, true), onKeyDown: (event) => keyboard(event, handle) };
  }
  return <div className="editor-selection-frame" role="group" aria-label="Transform selected shape">
    {HANDLES.map((handle) => <button key={handle} type="button" className={`editor-resize-handle is-${handle}`}
      aria-label={`Resize ${LABELS[handle]}`} title={`Resize ${LABELS[handle]}`} {...events(handle)} />)}
    <button type="button" className="editor-rotate-handle" aria-label="Rotate shape" title="Rotate · hold Shift for 15° steps" {...events("rotate")}>
      <RotateCw size={13} aria-hidden="true" />
    </button>
  </div>;
}
