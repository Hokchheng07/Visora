import { useEffect, useRef, useState } from "react";
import EditorCanvas from "../Editor/canvas/EditorCanvas";
import EditorInspector from "../Editor/inspector/EditorInspector.jsx";
import EditorAnimationPane from "../Editor/panels/EditorAnimationPane.jsx";
import EditorEffectDefs from "../Editor/canvas/EditorEffectDefs.jsx";
import { hasVisibleEffects, strokeOverflow } from "../Editor/model/effectsFilter.js";
import EditorDisplay from "../Editor/display/EditorDisplay";
import EditorSidebar from "../Editor/shell/EditorSidebar";
import EditorToolPanel from "../Editor/panels/EditorToolPanel";
import EditorTopBar from "../Editor/shell/EditorTopBar";
import { requestFullscreen } from "../Editor/display/useFullscreen";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { pageAdded, pageCopied, pageCloned, pagesCloned, pagesDeleted } from "../redux/editorSlice.js";
import { useEditorKeyboard } from "../Editor/hooks/useEditorKeyboard.js";
import { useMediaQuery } from "../Editor/hooks/useMediaQuery.js";
import { usePointerHeld } from "../Editor/hooks/usePointerHeld.js";
import { InspectorResizer, PanelToggle } from "../Editor/shell/EditorLayoutHandles.jsx";
import { readInspectorWidth } from "../Editor/shell/inspectorWidth.js";
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
  const [animationPreview, setAnimationPreview] = useState(null);
  const [animationMode, setAnimationMode] = useState("page");
  const [animationDismissed, setAnimationDismissed] = useState(false);
  // The canvas is the point of the page, so it starts unobstructed.
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [isDisplayOpen, setDisplayOpen] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(readInspectorWidth);
  const [isResizing, setResizing] = useState(false);
  const showAnimations = activeTool === "animations" && !animationDismissed;
  const showRightPane = showAnimations || (activeTool !== "animations" && showInspector);
  const previewing = showAnimations && isPanelOpen && animationPreview?.pageId === pages[currentPage].id;
  const stopPreview = () => setAnimationPreview(null);
  const startPreview = (request = { type: "page" }) => setAnimationPreview({ ...request, pageId: pages[currentPage].id, serial: Date.now() });

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
      if (event.target.closest(".editor-element, .editor-shape-tools, .editor-canvas-bar, .editor-page-menu, .editor-context-menu, .editor-panel-toggle, .editor-inspector-resizer, .editor-inspector")) return;
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
    stopPreview(); setAnimationDismissed(false);
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

  /* `indexes` is what the strip has selected, in page order; the menu was
     opened on one of them. Copy, paste and rename stay single-page — there is
     one clipboard slot and one name — while delete and duplicate take the lot,
     as one undo step. */
  function handlePageAction(action, indexes) {
    const index = indexes[0];
    if (action === "add") return handleAddPage();
    if (action === "copy") return dispatch(pageCopied(index));
    if (action === "duplicate") return dispatch(pagesCloned(pages, indexes));
    if (action === "paste") return copiedPage && dispatch(pageCloned(copiedPage, indexes.at(-1)));
    if (action === "delete") return dispatch(pagesDeleted(indexes));
  }

  return (
    <div className="editor-shell font-sans" ref={shellRef}>
      {/* One filter per element with shadows, for every page, shared by the
          canvas, the page strip and display mode. */}
      <EditorEffectDefs items={pages.flatMap((page) => page.elements.filter(hasVisibleEffects)
        .map((element) => ({ id: element.id, w: element.w, h: element.h, effects: element.effects, extra: strokeOverflow(element) })))} />
      <EditorTopBar onDisplay={openDisplay} inert={isDisplayOpen} />
      <div
        className={`editor-body${isPanelOpen ? "" : " is-panel-collapsed"}${showRightPane && inspectorDocked ? " has-inspector" : ""}${isResizing ? " is-resizing" : ""}`}
        style={{ "--inspector-w": `${inspectorWidth}px` }}
        inert={isDisplayOpen}
        onPointerDownCapture={(event) => { if (previewing && !event.target.closest(".editor-animation-preview-toggle")) stopPreview(); }}
        onKeyDownCapture={() => { if (previewing) stopPreview(); }}
      >
        <EditorSidebar
          ref={railRef}
          activeTool={activeTool}
          onToolChange={handleToolChange}
          isPanelOpen={isPanelOpen}
        />
        <EditorToolPanel ref={panelRef} activeTool={activeTool} isOpen={isPanelOpen} animationMode={animationMode}
          onAnimationModeChange={(mode) => { stopPreview(); setAnimationMode(mode); }} onAnimationPreview={startPreview} />
        <PanelToggle open={isPanelOpen} controls={`editor-panel-${activeTool}`} onToggle={() => setPanelOpen((open) => !open)} />
        <EditorCanvas
          canPaste={copiedPage !== null}
          onAddPage={handleAddPage}
          onPageAction={handlePageAction}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers((visible) => !visible)}
          onAnimate={() => { setActiveTool("animations"); setAnimationDismissed(false); setPanelOpen(true); }}
          previewing={previewing && !isDisplayOpen}
          animationPreview={animationPreview}
          onPreviewDone={stopPreview}
        />
        {showAnimations ? <EditorAnimationPane docked={inspectorDocked} mode={animationMode} previewing={previewing} onPreview={() => startPreview({ type: "page" })} onStopPreview={stopPreview}
          onClose={() => { setAnimationDismissed(true); stopPreview(); }} /> : activeTool !== "animations" && showInspector && <EditorInspector docked={inspectorDocked} onClose={() => setDismissedFor(shownFor)} />}
        {showRightPane && <InspectorResizer width={inspectorWidth} onResize={setInspectorWidth} onResizing={setResizing} />}
      </div>
      {/* Rendered inside the shell, not through a portal, so it keeps the
          --editor-* tokens and focus ring scoped to .editor-shell. */}
      {isDisplayOpen && (
        <EditorDisplay pages={pages} initialPage={currentPage} onClose={() => setDisplayOpen(false)} />
      )}
    </div>
  );
}
