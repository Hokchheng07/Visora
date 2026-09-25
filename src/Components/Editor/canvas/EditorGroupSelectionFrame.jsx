import { useEffect, useRef } from "react";
import { useAppDispatch, useAppStore } from "../../redux/hook.js";
import { elementsChanged, gestureCancelled, gestureFinished, gestureStarted } from "../../redux/editorSlice.js";
import { pagePercentX, pagePercentY, scaleSelection, selectionBounds } from "../model/elementGeometry.js";
import { normalizePageSize } from "../model/pageSize.js";

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

export default function EditorGroupSelectionFrame({ elements, sheetRef, locked = false }) {
  const active = useRef(null); const dispatch = useAppDispatch(); const store = useAppStore();
  const box = selectionBounds(elements); const token = `group:${elements.map((element) => element.id).join(":")}`;
  useEffect(() => {
    function cancel(event) {
      if (!active.current || (event?.type === "keydown" && event.key !== "Escape")) return;
      if (event?.type === "keydown") { event.preventDefault(); event.stopImmediatePropagation(); }
      active.current = null; dispatch(gestureCancelled(token));
    }
    window.addEventListener("blur", cancel); document.addEventListener("keydown", cancel, true);
    return () => { window.removeEventListener("blur", cancel); document.removeEventListener("keydown", cancel, true); if (active.current) dispatch(gestureCancelled(token)); };
  }, [dispatch, token]);
  if (!box) return null;
  function start(event, handle) {
    if (event.button !== 0 || store.getState().editor.gesture) return;
    event.preventDefault(); event.stopPropagation();
    const size = normalizePageSize(store.getState().editor.canvas);
    const scale = sheetRef.current.getBoundingClientRect().width / size.width;
    active.current = { pointerId: event.pointerId, handle, x: event.clientX, y: event.clientY, scale, size, elements: elements.map((element) => ({ ...element })), box };
    event.currentTarget.setPointerCapture(event.pointerId); dispatch(gestureStarted(token));
  }
  function move(event) {
    const gesture = active.current; if (!gesture || gesture.pointerId !== event.pointerId) return;
    const next = scaleSelection(gesture.elements, gesture.box, gesture.handle,
      (event.clientX - gesture.x) / gesture.scale, (event.clientY - gesture.y) / gesture.scale, event.shiftKey, gesture.size);
    dispatch(elementsChanged({ token, elements: next }));
  }
  function end(event, cancelled = false) {
    const gesture = active.current; if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (!cancelled) move(event); active.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch(cancelled ? gestureCancelled(token) : gestureFinished(token));
  }
  return <div className={`editor-group-selection${locked ? " is-locked" : ""}`} style={{ left: pagePercentX(box.left), top: pagePercentY(box.top), width: pagePercentX(box.w), height: pagePercentY(box.h) }}>
    {!locked && HANDLES.map((handle) => <button type="button" key={handle} className={`editor-resize-handle is-${handle}`} aria-label={`Resize group ${handle}`}
      onPointerDown={(event) => start(event, handle)} onPointerMove={move} onPointerUp={(event) => end(event)}
      onPointerCancel={(event) => end(event, true)} onLostPointerCapture={(event) => end(event, true)} />)}
  </div>;
}
