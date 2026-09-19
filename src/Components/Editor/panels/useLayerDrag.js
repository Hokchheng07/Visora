import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppStore } from "../../redux/hook.js";
import { layersReordered, layersMovedIntoGroup, layersRemovedFromGroup } from "../../redux/editorSlice.js";
import { effectiveLocked, groupMembers, layerLabel, selectionLevel, reorderLayers, moveIntoGroup, removeFromGroup } from "../model/layerModel.js";

/* The document stays untouched until release. Pointer cancellation therefore
   has nothing to undo, and scrolling can update the preview freely. */
export default function useLayerDrag(listRef) {
  const dispatch = useAppDispatch(), store = useAppStore();
  const active = useRef(null), suppressClick = useRef(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let frame;
    function clear() {
      const drag = active.current;
      active.current = null;
      cancelAnimationFrame(frame);
      if (drag?.dragging) suppressClick.current = true;
      if (drag?.target.hasPointerCapture?.(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId);
      setPreview(null);
    }
    function update() {
      const drag = active.current;
      if (!drag?.dragging) return;
      const editor = store.getState().editor, page = editor.pages[editor.currentPage];
      if (page !== drag.page || editor.gesture) { clear(); return; }
      const panel = listRef.current?.closest(".editor-tool-panel");
      let hit;
      const rows = [...(listRef.current?.querySelectorAll("[data-layer-id]") || [])];
      for (const node of rows) {
        const rect = node.getBoundingClientRect();
        if (drag.x >= rect.left - 12 && drag.x <= rect.right + 12 && drag.y >= rect.top && drag.y <= rect.bottom) { hit = { node, rect }; break; }
      }
      let drop = null;
      if (hit) {
        const { node, rect } = hit;
        const rowId = node.dataset.layerId, groupRow = node.dataset.layerKind === "group";
        const element = page.elements.find((item) => item.id === rowId);
        const groupId = groupRow ? rowId : element?.groupId;
        const fraction = (drag.y - rect.top) / rect.height;
        const placement = fraction < 0.5 ? "after" : "before";
        const level = selectionLevel(page, drag.ids, drag.mode);
        let kind = "reorder", payload = { ids: drag.ids, mode: drag.mode, targetId: rowId, placement };
        let inside = false;
        if (groupRow && fraction >= 0.25 && fraction <= 0.75 && level?.level === "top"
          && drag.ids.every((id) => !page.elements.find((item) => item.id === id)?.groupId)) {
          kind = "into"; inside = true; payload = { ...payload, groupId, targetId: null };
        } else if (!groupRow && groupId) {
          if (level?.level === "top") { kind = "into"; payload.groupId = groupId; }
        } else if (level?.level === "group") kind = "out";
        const next = kind === "into" ? moveIntoGroup(page, drag.ids, payload.groupId, payload.targetId, placement)
          : kind === "out" ? removeFromGroup(page, drag.ids, payload.targetId, placement)
            : { elements: reorderLayers(page.elements, drag.ids, rowId, placement, drag.mode) };
        if (next.elements !== page.elements) drop = { kind, payload, rowId, inside,
          // Child rows are indented by their tree container, so the row's own box is the line.
          left: rect.left, width: rect.width,
          top: placement === "after" ? rect.top : rect.bottom };
      }
      drag.drop = drop;
      setPreview({ x: drag.x, y: drag.y, label: drag.label, ids: drag.ids, drop });
      if (panel) {
        const box = panel.getBoundingClientRect();
        const velocity = drag.y < box.top + 32 ? -Math.min(14, (box.top + 32 - drag.y) / 3)
          : drag.y > box.bottom - 32 ? Math.min(14, (drag.y - box.bottom + 32) / 3) : 0;
        if (velocity) panel.scrollTop += velocity;
      }
      frame = requestAnimationFrame(update);
    }
    function move(event) {
      const drag = active.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.x = event.clientX; drag.y = event.clientY;
      if (!drag.dragging && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= 6) {
        drag.dragging = true; drag.target.setPointerCapture?.(drag.pointerId);
        update();
      }
      if (drag.dragging) event.preventDefault();
    }
    function end(event) {
      const drag = active.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      // The final pointer event can arrive before the animation frame catches up.
      if (drag.dragging) { cancelAnimationFrame(frame); drag.x = event.clientX; drag.y = event.clientY; update(); }
      const drop = active.current?.drop;
      clear();
      if (drop) dispatch(drop.kind === "into" ? layersMovedIntoGroup(drop.payload) : drop.kind === "out" ? layersRemovedFromGroup(drop.payload) : layersReordered(drop.payload));
    }
    function key(event) {
      if (!active.current?.dragging) return;
      // No keyboard edit may race the snapshot used to validate the drop.
      event.preventDefault(); event.stopImmediatePropagation();
      if (event.key === "Escape") clear();
    }
    function cancel(event) { if (!event?.pointerId || active.current?.pointerId === event.pointerId) clear(); }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("lostpointercapture", cancel);
    window.addEventListener("blur", cancel);
    document.addEventListener("keydown", key, true);
    return () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", cancel); window.removeEventListener("lostpointercapture", cancel);
      window.removeEventListener("blur", cancel); document.removeEventListener("keydown", key, true);
      cancelAnimationFrame(frame); active.current = null;
    };
  }, [dispatch, store, listRef]);

  function start(event, row) {
    suppressClick.current = false;
    const editor = store.getState().editor, page = editor.pages[editor.currentPage];
    if (event.button !== 0 || editor.gesture || event.target.closest("input")) return;
    const own = row.kind === "group" ? groupMembers(page, row.id).map((item) => item.id) : [row.id];
    const ownMode = row.kind === "group" ? "group" : "direct";
    const useSelection = own.every((id) => editor.selectedIds.includes(id)) && selectionLevel(page, editor.selectedIds, editor.selectionMode);
    const ids = useSelection ? editor.selectedIds : own, mode = row.kind === "group" ? "group" : useSelection ? editor.selectionMode : ownMode;
    if (page.elements.some((item) => ids.includes(item.id) && effectiveLocked(page, item))) return;
    active.current = { page, ids, mode, pointerId: event.pointerId, target: event.currentTarget, startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY, label: row.kind === "group" ? row.group.name : ids.length > 1 ? `${ids.length} layers` : layerLabel(row.element), dragging: false };
  }
  function consumeClick(event) {
    if (!suppressClick.current) return false;
    suppressClick.current = false; event.preventDefault(); event.stopPropagation(); return true;
  }
  return { start, consumeClick, preview };
}
