<<<<<<< HEAD
import { useEffect, useLayoutEffect, useRef } from "react";
import { createDraggable } from "animejs/draggable";
import { useAppDispatch, useAppStore } from "../redux/hook.js";
import { elementSelected, elementTransformed, gestureStarted, gestureFinished, gestureCancelled } from "../redux/editorSlice.js";
import { bounds, CANVAS_WIDTH, CANVAS_HEIGHT } from "./elementGeometry.js";

export function useElementDrag(element, pageId, sheetRef, scale) {
  const targetRef = useRef(null), triggerRef = useRef(null), dragRef = useRef(null);
  const dispatch = useAppDispatch(), store = useAppStore();
  const id = element.id;
  useEffect(() => {
    const target = targetRef.current, trigger = triggerRef.current;
    if (!target || !trigger || !sheetRef.current) return;
    const token = `drag:${id}`;
    let start = null, startScale = 1;
    const currentElement = () => store.getState().editor.pages.find((page) => page.id === pageId)?.elements.find((el) => el.id === id);
    const draggable = createDraggable(target, {
      trigger,
      container: () => {
        const el = currentElement();
        if (!el || !sheetRef.current) return [0, 0, 0, 0];
        const s = sheetRef.current.getBoundingClientRect().width / CANVAS_WIDTH;
        const b = bounds(el);
        return [-b.top * s, (CANVAS_WIDTH - b.right) * s, (CANVAS_HEIGHT - b.bottom) * s, -b.left * s];
      },
      containerFriction: 1, releaseContainerFriction: 1, velocityMultiplier: 0,
      scrollSpeed: 0, scrollThreshold: 0, dragThreshold: { mouse: 3, touch: 7 },
      onResize: () => { if (start) cancel(); },
      onGrab: () => {
        const initial = currentElement();
        startScale = sheetRef.current.getBoundingClientRect().width / CANVAS_WIDTH;
        dispatch(elementSelected(id));
        dispatch(gestureStarted(token));
        start = initial;
        target.classList.add("is-dragging");
      },
      onRelease: (drag) => {
        drag.stop();
        const dx = drag.x, dy = drag.y;
        // Clear the temporary CSS translation before React commits percentage coordinates.
        drag.setX(0, true); drag.setY(0, true);
        if (drag.targetStyles) { drag.targetStyles.revert(); drag.targetStyles = null; }
        if (start && startScale && (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01)) {
          dispatch(elementTransformed({ token, changes: {
            x: Math.round((start.x + dx / startScale) / 8) * 8,
            y: Math.round((start.y + dy / startScale) / 8) * 8,
          } }));
        }
        start = null;
        dispatch(gestureFinished(token));
        target.classList.remove("is-dragging");
      },
    });
    dragRef.current = draggable;
    function cancel() {
      start = null;
      draggable.stop(); draggable.handleUp();
      draggable.setX(0, true); draggable.setY(0, true);
      dispatch(gestureCancelled(token));
      target.classList.remove("is-dragging");
    }
    // A cancelled history transaction (Escape/undo/page change) also cancels
    // the imperative drag so its later mouseup cannot reapply old geometry.
    const unsubscribe = store.subscribe(() => {
      if (start && store.getState().editor.gesture?.token !== token) cancel();
    });
    const onKeyDown = (event) => {
      if (event.key === "Escape" && start) { event.preventDefault(); event.stopImmediatePropagation(); cancel(); }
    };
    const onTouchCancel = () => cancel();
    function guardStart(event) {
      if ((event.type === "mousedown" && event.button !== 0) || store.getState().editor.gesture) event.stopImmediatePropagation();
    }
    window.addEventListener("blur", cancel);
    window.addEventListener("resize", cancel);
    document.addEventListener("keydown", onKeyDown, true);
    trigger.addEventListener("touchcancel", onTouchCancel);
    trigger.addEventListener("mousedown", guardStart, true);
    trigger.addEventListener("touchstart", guardStart, true);
    return () => {
      unsubscribe();
      window.removeEventListener("blur", cancel);
      window.removeEventListener("resize", cancel);
      document.removeEventListener("keydown", onKeyDown, true);
      trigger.removeEventListener("touchcancel", onTouchCancel);
      trigger.removeEventListener("mousedown", guardStart, true);
      trigger.removeEventListener("touchstart", guardStart, true);
      start = null; draggable.revert(); dragRef.current = null;
      dispatch(gestureCancelled(token));
    };
  }, [id, pageId, sheetRef, dispatch, store]);

  useLayoutEffect(() => {
    const drag = dragRef.current;
    if (drag && !drag.grabbed) drag.refresh();
  }, [element.x, element.y, element.w, element.h, element.rotation, scale]);
=======
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

>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
  return { targetRef, triggerRef };
}
