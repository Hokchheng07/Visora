import { useEffect, useRef } from "react";
import { useAppDispatch, useAppStore } from "../redux/hook.js";
import { elementSelected, elementsChanged, gestureStarted, gestureFinished, gestureCancelled } from "../redux/editorSlice.js";
import { CANVAS_WIDTH, clampSelectionDelta, snapSelectionDelta } from "./elementGeometry.js";

export function useElementDrag(element, pageId, sheetRef) {
  const targetRef = useRef(null), triggerRef = useRef(null);
  const dispatch = useAppDispatch(), store = useAppStore();
  const id = element.id;

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const token = `drag:${id}`;
    let active = null;

    function cancel() {
      if (!active) return;
      const pointerId = active.pointerId; active = null;
      if (trigger.hasPointerCapture(pointerId)) trigger.releasePointerCapture(pointerId);
      dispatch(gestureCancelled(token));
    }
    function down(event) {
      if (event.button !== 0 || store.getState().editor.gesture || !sheetRef.current) return;
      event.stopPropagation();
      const additive = event.shiftKey || event.metaKey || event.ctrlKey;
      const before = store.getState().editor;
      if (!before.selectedIds.includes(id) || additive) dispatch(elementSelected({ id, additive }));
      const state = store.getState().editor;
      const page = state.pages.find((item) => item.id === pageId);
      const starts = page.elements.filter((item) => state.selectedIds.includes(item.id)).map((item) => ({ ...item }));
      if (!starts.length) return;
      active = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, starts, moved: false };
      trigger.setPointerCapture(event.pointerId); dispatch(gestureStarted(token));
    }
    function move(event) {
      if (!active || active.pointerId !== event.pointerId || !sheetRef.current) return;
      const scale = sheetRef.current.getBoundingClientRect().width / CANVAS_WIDTH;
      let dx = (event.clientX - active.x) / scale, dy = (event.clientY - active.y) / scale;
      if (Math.abs(dx) + Math.abs(dy) < 3 / scale && !active.moved) return;
      active.moved = true;
      const state = store.getState().editor;
      const page = state.pages.find((item) => item.id === pageId);
      const selectedSet = new Set(active.starts.map((item) => item.id));
      const clamped = clampSelectionDelta(active.starts, dx, dy);
      const snapped = event.altKey ? { ...clamped, guides: [] } : snapSelectionDelta(active.starts, page.elements.filter((item) => !selectedSet.has(item.id)), clamped.x, clamped.y, 7 / scale);
      const finalDelta = clampSelectionDelta(active.starts, snapped.x, snapped.y);
      dispatch(elementsChanged({ token, guides: snapped.guides, elements: active.starts.map((item) => ({ ...item, x: item.x + finalDelta.x, y: item.y + finalDelta.y })) }));
    }
    function up(event) {
      if (!active || active.pointerId !== event.pointerId) return;
      move(event); active = null;
      if (trigger.hasPointerCapture(event.pointerId)) trigger.releasePointerCapture(event.pointerId);
      dispatch(gestureFinished(token));
    }
    function keydown(event) { if (event.key === "Escape") cancel(); }
    trigger.addEventListener("pointerdown", down);
    trigger.addEventListener("pointermove", move);
    trigger.addEventListener("pointerup", up);
    trigger.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    document.addEventListener("keydown", keydown, true);
    return () => {
      trigger.removeEventListener("pointerdown", down); trigger.removeEventListener("pointermove", move);
      trigger.removeEventListener("pointerup", up); trigger.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel); document.removeEventListener("keydown", keydown, true);
      if (active) dispatch(gestureCancelled(token));
    };
  }, [id, pageId, sheetRef, dispatch, store]);

  return { targetRef, triggerRef };
}
