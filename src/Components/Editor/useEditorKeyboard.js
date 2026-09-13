import { useEffect } from "react";
import { useAppDispatch, useAppStore } from "../redux/hook.js";
import { elementDeleted, elementNudged, elementSelected, elementsSelected, selectionCopied, selectionPasted, undo, redo } from "../redux/editorSlice.js";

export function useEditorKeyboard(isDisplayOpen, shellRef) {
  const dispatch = useAppDispatch(), store = useAppStore();
  useEffect(() => {
    if (isDisplayOpen) return;
    function keyDown(event) {
      if (event.defaultPrevented || event.isComposing || event.target.closest("input, textarea, select, [contenteditable='true'], [role='menu']")) return;
      if (!shellRef.current?.contains(event.target) && event.target !== document.body) return;
      if (shellRef.current.querySelector(".editor-page-menu")) return;
      const state = store.getState().editor;
      if (state.gesture) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault(); dispatch(event.shiftKey ? redo() : undo()); return;
      }
      if (command && event.key.toLowerCase() === "y") { event.preventDefault(); dispatch(redo()); return; }
      if (command && event.key.toLowerCase() === "a") { event.preventDefault(); dispatch(elementsSelected(state.pages[state.currentPage].elements.map((element) => element.id))); return; }
      if (command && event.key.toLowerCase() === "v") { event.preventDefault(); dispatch(selectionPasted()); return; }
      if (command && event.key.toLowerCase() === "c" && state.selectedIds.length) { event.preventDefault(); dispatch(selectionCopied()); return; }
      if (command && event.key.toLowerCase() === "x" && state.selectedIds.length) { event.preventDefault(); dispatch(selectionCopied()); dispatch(elementDeleted()); return; }
      if (command && event.key.toLowerCase() === "d" && state.selectedIds.length) { event.preventDefault(); dispatch(selectionCopied()); dispatch(selectionPasted()); return; }
      if (!state.selectedIds.length) return;
      if (event.key === "Escape") { event.preventDefault(); dispatch(elementSelected(null)); return; }
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); dispatch(elementDeleted()); return; }
      if (command || event.altKey || !event.key.startsWith("Arrow") || event.target.closest("[role='tablist'], .editor-resize-handle, .editor-rotate-handle")) return;
      const step = event.shiftKey ? 10 : 1;
      const directions = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const delta = directions[event.key];
      if (delta) { event.preventDefault(); dispatch(elementNudged({ x: delta[0], y: delta[1] })); }
    }
    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
  }, [dispatch, store, isDisplayOpen, shellRef]);
}
