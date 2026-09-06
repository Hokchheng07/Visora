import { useEffect, useRef, useState } from "react";
import EditorCanvas from "../Editor/EditorCanvas";
import EditorDisplay from "../Editor/EditorDisplay";
import EditorSidebar from "../Editor/EditorSidebar";
import EditorToolPanel from "../Editor/EditorToolPanel";
import EditorTopBar from "../Editor/EditorTopBar";
import { requestFullscreen } from "../Editor/useFullscreen";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { pageAdded, pageCopied, pageCloned, pageDeleted } from "../redux/editorSlice.js";
import { useEditorKeyboard } from "../Editor/useEditorKeyboard.js";
import "../Editor/editor.css";

export default function Editor() {
  const dispatch = useAppDispatch();
  const { pages, copiedPage, selectedId, currentPage } = useAppSelector((state) => state.editor);
  const [activeTool, setActiveTool] = useState("templates");
  // The canvas is the point of the page, so it starts unobstructed.
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [isDisplayOpen, setDisplayOpen] = useState(false);

  const railRef = useRef(null);
  const panelRef = useRef(null);
  const shellRef = useRef(null);
  const openerRef = useRef(null);
  useEditorKeyboard(isDisplayOpen, shellRef);

  // The rail and the panel are separate grid children, so both count as "inside".
  useEffect(() => {
    if (!isPanelOpen) return;

    function handlePointerDown(event) {
      if (event.target.closest(".editor-element, .editor-shape-tools, .editor-canvas-bar")) return;
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
      <EditorTopBar onDisplay={openDisplay} inert={isDisplayOpen} />
      <div
        className={`editor-body${isPanelOpen ? "" : " is-panel-collapsed"}`}
        inert={isDisplayOpen}
      >
        <EditorSidebar
          ref={railRef}
          activeTool={activeTool}
          onToolChange={handleToolChange}
          isPanelOpen={isPanelOpen}
        />
        <EditorToolPanel ref={panelRef} activeTool={activeTool} isOpen={isPanelOpen} />
        <EditorCanvas
          canPaste={copiedPage !== null}
          onAddPage={handleAddPage}
          onPageAction={handlePageAction}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers((visible) => !visible)}
        />
      </div>
      {/* Rendered inside the shell, not through a portal, so it keeps the
          --editor-* tokens and focus ring scoped to .editor-shell. */}
      {isDisplayOpen && (
        <EditorDisplay pages={pages} initialPage={currentPage} onClose={() => setDisplayOpen(false)} />
      )}
    </div>
  );
}
