import { useState } from "react";
import EditorCanvasBar from "./EditorCanvasBar";
import EditorPageMenu from "./EditorPageMenu";
import EditorRuler from "./EditorRuler";
import { CANVAS_HEIGHT, CANVAS_WIDTH, useCanvasMetrics } from "./useCanvasMetrics";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementSelected, pageSelected } from "../redux/editorSlice.js";
import EditorElement from "./EditorElement.jsx";
import EditorShapeTools from "./EditorShapeTools.jsx";

export default function EditorCanvas({
  canPaste,
  onAddPage,
  onPageAction,
  showRulers,
  onToggleRulers,
}) {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedId } = useAppSelector((state) => state.editor);
  const page = pages[currentPage];
  const { scrollRef, pageRef, metrics } = useCanvasMetrics();
  // Kept out of the bar so the menu doesn't inherit the bar's button styling.
  const [pageMenu, setPageMenu] = useState(null);

  return (
    <main
      className={`editor-workspace${showRulers ? "" : " is-rulers-hidden"}`}
      aria-label="Design workspace"
    >
      <div className="editor-canvas-area">
        <EditorShapeTools />
        {showRulers && (
          <>
            <span className="editor-ruler-corner" aria-hidden="true" />
            <EditorRuler
              orientation="horizontal"
              origin={metrics.originX}
              length={metrics.viewWidth}
              scale={metrics.scale}
            />
            <EditorRuler
              orientation="vertical"
              origin={metrics.originY}
              length={metrics.viewHeight}
              scale={metrics.scale}
            />
          </>
        )}

        <div className="editor-canvas-scroll" ref={scrollRef}>
          <div className="editor-page-stack">
              <div className="editor-page" data-page-id={pages[currentPage].id}>
                <div className="editor-canvas-meta"><span>{CANVAS_WIDTH} × {CANVAS_HEIGHT} px</span></div>
                <div
                  ref={pageRef}
                  className="editor-blank-canvas"
                  role="group"
                  tabIndex={0}
                  aria-label={`Canvas for page ${currentPage + 1}, ${CANVAS_WIDTH} by ${CANVAS_HEIGHT} pixels`}
                  onPointerDown={(event) => {
                    if (event.target === event.currentTarget) { dispatch(elementSelected(null)); event.currentTarget.focus(); }
                  }}
                >
                  {page.elements.map((element) => <EditorElement key={element.id} element={element} pageId={page.id}
                    sheetRef={pageRef} scale={metrics.scale} selected={selectedId === element.id} />)}
                </div>
              </div>
          </div>
          <EditorCanvasBar
            pages={pages}
            currentPage={currentPage}
            onAddPage={onAddPage}
            onPageChange={(index) => dispatch(pageSelected(index))}
            onPageMenu={(event, index) => {
              event.preventDefault();
              setPageMenu({ index, x: event.clientX, y: event.clientY });
            }}
            zoom={Math.round(metrics.scale * 100)}
            showRulers={showRulers}
            onToggleRulers={onToggleRulers}
          />
        </div>
      </div>

      {pageMenu && (
        <EditorPageMenu
          page={pageMenu.index + 1}
          x={pageMenu.x}
          y={pageMenu.y}
          disabled={{ paste: !canPaste, delete: pages.length === 1 }}
          onAction={(action) => onPageAction(action, pageMenu.index)}
          onClose={() => setPageMenu(null)}
        />
      )}
    </main>
  );
}
