import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../redux/hook.js";
import { elementInserted } from "../redux/editorSlice.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./elementGeometry.js";

export function usePanelDragInsert(shape) {
  const dispatch = useAppDispatch();
  const activeRef = useRef(null), suppressClick = useRef(false);
  const [ghost, setGhost] = useState(null);
  useEffect(() => {
    function cancel() {
      const active = activeRef.current;
      if (!active) return;
      activeRef.current = null; suppressClick.current = true;
      if (active.target.hasPointerCapture(active.id)) active.target.releasePointerCapture(active.id);
      setGhost(null);
    }
    const keyDown = (event) => { if (event.key === "Escape" && activeRef.current) { event.preventDefault(); event.stopImmediatePropagation(); cancel(); } };
    window.addEventListener("blur", cancel);
    document.addEventListener("keydown", keyDown, true);
    return () => { window.removeEventListener("blur", cancel); document.removeEventListener("keydown", keyDown, true); };
  }, []);
  const events = {
    onPointerDown(event) {
      if (event.button !== 0 || activeRef.current) return;
      suppressClick.current = false;
      activeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false, target: event.currentTarget };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      const active = activeRef.current;
      if (!active || active.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - active.x, event.clientY - active.y) > 6) active.dragging = true;
      if (active.dragging) setGhost({ x: event.clientX, y: event.clientY });
    },
    onPointerUp(event) {
      const active = activeRef.current;
      if (!active || active.id !== event.pointerId) return;
      activeRef.current = null;
      suppressClick.current = active.dragging;
      if (active.target.hasPointerCapture(active.id)) active.target.releasePointerCapture(active.id);
      setGhost(null);
      if (!active.dragging) return;
      const sheet = document.querySelector(".editor-blank-canvas");
      if (!sheet) return;
      const rect = sheet.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      dispatch(elementInserted(shape, { x: (event.clientX - rect.left) / rect.width * CANVAS_WIDTH, y: (event.clientY - rect.top) / rect.height * CANVAS_HEIGHT }));
    },
    onPointerCancel() { activeRef.current = null; suppressClick.current = true; setGhost(null); },
    onLostPointerCapture() { if (activeRef.current) { activeRef.current = null; suppressClick.current = true; setGhost(null); } },
    onClick(event) {
      // Keyboard activation should always work, even after a cancelled drag.
      if (event.detail === 0 || !suppressClick.current) dispatch(elementInserted(shape));
      suppressClick.current = false;
    },
  };
  return { events, ghost };
}
