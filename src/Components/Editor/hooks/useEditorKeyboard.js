import { useEffect } from "react";
import { useAppDispatch, useAppStore } from "../../redux/hook.js";
import { elementsTarget } from "../inspector/inspectorEdit.js";
import { allKeys, deleteNodes, editableSubpaths, moveNodes, pageDeltaToLocal, validKeys, vectorChanges } from "../model/vectorEdit.js";
import { pointEditFinished, pointEditStarted, pointsSelected, targetChanged, canvasAllSelected, editCancelled, elementDeleted, elementNudged, elementSelected, selectionCopied, selectionPasted, undo, redo, layersStepped, selectionGrouped, groupUngrouped, groupSelected } from "../../redux/editorSlice.js";

/*
 * Escape has one order across the editor, each step stopping the key before
 * the next: cancel the active drag (canvas drags and inspector sliders handle
 * this themselves, with layer drag first) → close the open pop-up → leave
 * point editing → an inspector edit still open → select the parent group → deselect.
 */

export function useEditorKeyboard(isDisplayOpen, shellRef) {
  const dispatch = useAppDispatch(), store = useAppStore();
  useEffect(() => {
    if (isDisplayOpen) return;
    function keyDown(event) {
      if (event.defaultPrevented || event.isComposing || event.target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='plaintext-only'], [role='menu']")) return;
      if (!shellRef.current?.contains(event.target) && event.target !== document.body) return;
      if (shellRef.current.querySelector(".editor-page-menu")) return;
      const state = store.getState().editor;
      if (state.gesture) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "g") {
        event.preventDefault(); dispatch(event.shiftKey ? groupUngrouped() : selectionGrouped()); return;
      }
      const bracket = event.key === "]" || event.code === "BracketRight" ? "forward" : event.key === "[" || event.code === "BracketLeft" ? "backward" : null;
      if (bracket && state.selectedIds.length && !event.altKey) {
        event.preventDefault(); dispatch(layersStepped({ direction: command ? (bracket === "forward" ? "front" : "back") : bracket })); return;
      }
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault(); dispatch(event.shiftKey ? redo() : undo()); return;
      }
      if (command && event.key.toLowerCase() === "y") { event.preventDefault(); dispatch(redo()); return; }
      /* While a shape's points are being edited, the selection keys act on
         points: Escape drops the picked points and then leaves, Enter leaves,
         Delete removes points (never the shape), arrows nudge points. */
      if (state.pointEdit && handlePointKeys(event, state)) return;
      if (command && event.key.toLowerCase() === "a") { event.preventDefault(); dispatch(canvasAllSelected()); return; }
      if (command && event.key.toLowerCase() === "v") { event.preventDefault(); dispatch(selectionPasted()); return; }
      if (command && event.key.toLowerCase() === "c" && state.selectedIds.length) { event.preventDefault(); dispatch(selectionCopied()); return; }
      if (command && event.key.toLowerCase() === "x" && state.selectedIds.length) { event.preventDefault(); dispatch(selectionCopied()); dispatch(elementDeleted()); return; }
      if (command && event.key.toLowerCase() === "d" && state.selectedIds.length) { event.preventDefault(); dispatch(selectionCopied()); dispatch(selectionPasted()); return; }
      if (event.key === "Escape" && state.edit) { event.preventDefault(); dispatch(editCancelled(state.edit.token)); return; }
      if (!state.selectedIds.length) return;
      if (event.key === "Escape") {
        event.preventDefault();
        const items = state.pages[state.currentPage].elements.filter((item) => state.selectedIds.includes(item.id));
        const parent = items[0]?.groupId;
        dispatch(state.selectionMode === "direct" && parent && items.every((item) => item.groupId === parent) ? groupSelected(parent) : elementSelected(null)); return;
      }
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); dispatch(elementDeleted()); return; }
      // Enter on a selected shape opens its points — only from the canvas, so Enter on a sidebar button still presses it.
      if (event.key === "Enter" && !command && state.selectedIds.length === 1 && (event.target === document.body || event.target.closest(".editor-canvas-area"))) {
        const shape = state.pages[state.currentPage].elements.find((item) => item.id === state.selectedIds[0]);
        if (shape?.type === "shape") { event.preventDefault(); dispatch(pointEditStarted()); return; }
      }
      if (command || event.altKey || !event.key.startsWith("Arrow") || event.target.closest("[role='tablist'], .editor-resize-handle, .editor-rotate-handle")) return;
      const step = event.shiftKey ? 10 : 1;
      const directions = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const delta = directions[event.key];
      if (delta) { event.preventDefault(); dispatch(elementNudged({ x: delta[0], y: delta[1] })); }
    }
    function handlePointKeys(event, state) {
      const page = state.pages[state.currentPage];
      const element = page.elements.find((item) => item.id === state.pointEdit.elementId);
      if (!element) { dispatch(pointEditFinished()); return false; }
      const subpaths = editableSubpaths(element), keys = validKeys(subpaths, state.pointEdit.keys);
      const change = (next) => dispatch(targetChanged({ target: elementsTarget(page.id, [element.id]), changes: vectorChanges(element, next) }));
      if (event.key === "Escape") { event.preventDefault(); dispatch(keys.length ? pointsSelected({ keys: [] }) : pointEditFinished()); return true; }
      if (event.key === "Enter") { event.preventDefault(); dispatch(pointEditFinished()); return true; }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") { event.preventDefault(); dispatch(pointsSelected({ keys: allKeys(subpaths) })); return true; }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        const next = keys.length ? deleteNodes(subpaths, keys) : null;
        if (next) { change(next); dispatch(pointsSelected({ keys: [] })); }
        return true;
      }
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (arrows && keys.length && !event.altKey) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1, delta = pageDeltaToLocal(element, arrows[0] * step, arrows[1] * step);
        change(moveNodes(subpaths, keys, delta.dx, delta.dy));
        return true;
      }
      return false;
    }
    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
  }, [dispatch, store, isDisplayOpen, shellRef]);
}
