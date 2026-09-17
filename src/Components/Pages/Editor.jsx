import { useEffect, useRef, useState } from "react";
import EditorCanvas from "../Editor/EditorCanvas";
import EditorInspector from "../Editor/EditorInspector.jsx";
import EditorEffectDefs from "../Editor/EditorEffectDefs.jsx";
import { hasVisibleEffects, strokeOverflow } from "../Editor/effectsFilter.js";
import EditorDisplay from "../Editor/EditorDisplay";
import EditorSidebar from "../Editor/EditorSidebar";
import EditorToolPanel from "../Editor/EditorToolPanel";
import EditorTopBar from "../Editor/EditorTopBar";
import { requestFullscreen } from "../Editor/useFullscreen";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { pageAdded, pageCopied, pageCloned, pageDeleted } from "../redux/editorSlice.js";
import { useEditorKeyboard } from "../Editor/useEditorKeyboard.js";
import { useMediaQuery } from "../Editor/useMediaQuery.js";
import { usePointerHeld } from "../Editor/usePointerHeld.js";
import { InspectorResizer, PanelToggle } from "../Editor/EditorLayoutHandles.jsx";
import { readInspectorWidth } from "../Editor/inspectorWidth.js";
import "../Editor/editor.css";

export default function Editor() {
  const dispatch = useAppDispatch();
  const { pages, copiedPage, selectedId, selectedIds, currentPage } = useAppSelector((state) => state.editor);
  /* The Customize column appears while something is selected and goes away
     with nothing selected, when the page bar above the canvas takes over.

     On wide screens it is a grid column, so the canvas re-fits when it comes
     and goes. That change waits until the pointer is released: selection
     happens on pointerdown, and resizing the canvas under a drag that has just
     started would move the element away from the cursor. Below 1441px the
     column is a drawer over the canvas instead (a fourth 300px track would
     leave too little canvas); its close button hides it until the selection
     changes. */
  const inspectorDocked = useMediaQuery("(min-width: 1441px)");
  const pointerHeld = usePointerHeld();
  const selectionKey = selectedIds.join(" ");
  const [shownFor, setShownFor] = useState(selectionKey);
  if (!pointerHeld && shownFor !== selectionKey) setShownFor(selectionKey);
  const [dismissedFor, setDismissedFor] = useState(null);
  const showInspector = shownFor !== "" && dismissedFor !== shownFor;
  const [activeTool, setActiveTool] = useState("templates");
  // The canvas is the point of the page, so it starts unobstructed.
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [isDisplayOpen, setDisplayOpen] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(readInspectorWidth);
  const [isResizing, setResizing] = useState(false);

  const railRef = useRef(null);
  const panelRef = useRef(null);
  const shellRef = useRef(null);
  const openerRef = useRef(null);
  useEditorKeyboard(isDisplayOpen, shellRef);

  // The rail and the panel are separate grid children, so both count as "inside".
  useEffect(() => {
    if (!isPanelOpen) return;

    function handlePointerDown(event) {
      // Page and context menus float outside the bar, but using them should not close the panel either.
      if (event.target.closest(".editor-element, .editor-shape-tools, .editor-canvas-bar, .editor-page-menu, .editor-context-menu, .editor-panel-toggle, .editor-inspector-resizer")) return;
      if (railRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) return;
      setPanelOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape" && !event.defaultPrevented && !selectedId) setPanelOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPanelOpen, selectedId]);

  // ⌘/ or Ctrl+/ collapses and reopens the tool panel from anywhere in the editor.
  useEffect(() => {
    if (isDisplayOpen) return;
    function handleKeyDown(event) {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || (event.key !== "/" && event.code !== "Slash")) return;
      event.preventDefault();
      setPanelOpen((open) => !open);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDisplayOpen]);

  function handleToolChange(id) {
    if (id === activeTool) {
      setPanelOpen((open) => !open);
      return;
    }
    setActiveTool(id);
    setPanelOpen(true);
  }

  function openDisplay() {
    // Captured before any state change: opening marks this bar inert, which
    // blurs the button that was clicked, so this is the last moment the
    // opener can still be identified.
    openerRef.current = document.activeElement;
    // Closing the panel first detaches its Escape handler, leaving display
    // mode the only claim on the key. Fullscreen has to be requested straight
    // from the click — the gesture does not survive a state update.
    setPanelOpen(false);
    requestFullscreen(shellRef.current);
    setDisplayOpen(true);
  }

  // Hand focus back only once the close has been committed: focus() is a
  // no-op while the bar is still inert, so this cannot be done inline.
  useEffect(() => {
    if (isDisplayOpen || !openerRef.current) return;
    openerRef.current.focus();
    openerRef.current = null;
  }, [isDisplayOpen]);

  function handleAddPage() {
    dispatch(pageAdded());
  }

  function handlePageAction(action, index) {
    if (action === "add") return handleAddPage();
    if (action === "copy") return dispatch(pageCopied(index));
    if (action === "duplicate") return dispatch(pageCloned(pages[index], index));
    if (action === "paste") return copiedPage && dispatch(pageCloned(copiedPage, index));
    if (action === "delete") return dispatch(pageDeleted(index));
  }

  return (
    <div className="editor-shell font-sans" ref={shellRef}>
      {/* One filter per element with shadows, for every page, shared by the
          canvas, the page strip and display mode. */}
      <EditorEffectDefs items={pages.flatMap((page) => page.elements.filter(hasVisibleEffects)
        .map((element) => ({ id: element.id, w: element.w, h: element.h, effects: element.effects, extra: strokeOverflow(element) })))} />
      <EditorTopBar onDisplay={openDisplay} inert={isDisplayOpen} />
      <div
        className={`editor-body${isPanelOpen ? "" : " is-panel-collapsed"}${showInspector && inspectorDocked ? " has-inspector" : ""}${isResizing ? " is-resizing" : ""}`}
        style={{ "--inspector-w": `${inspectorWidth}px` }}
        inert={isDisplayOpen}
      >
        <EditorSidebar
          ref={railRef}
          activeTool={activeTool}
          onToolChange={handleToolChange}
          isPanelOpen={isPanelOpen}
        />
        <EditorToolPanel ref={panelRef} activeTool={activeTool} isOpen={isPanelOpen} />
        <PanelToggle open={isPanelOpen} controls={`editor-panel-${activeTool}`} onToggle={() => setPanelOpen((open) => !open)} />
        <EditorCanvas
          canPaste={copiedPage !== null}
          onAddPage={handleAddPage}
          onPageAction={handlePageAction}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers((visible) => !visible)}
        />
        {showInspector && <EditorInspector docked={inspectorDocked} onClose={() => setDismissedFor(shownFor)} />}
        {showInspector && <InspectorResizer width={inspectorWidth} onResize={setInspectorWidth} onResizing={setResizing} />}
      </div>
      {/* Rendered inside the shell, not through a portal, so it keeps the
          --editor-* tokens and focus ring scoped to .editor-shell. */}
      {isDisplayOpen && (
        <EditorDisplay pages={pages} initialPage={currentPage} onClose={() => setDisplayOpen(false)} />
      )}
    </div>
  );
}
