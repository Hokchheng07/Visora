import { useEffect, useRef, useState } from "react";
import EditorCanvasBar from "./EditorCanvasBar";
import EditorPageMenu from "./EditorPageMenu";
import EditorRuler from "./EditorRuler";
import { CANVAS_HEIGHT, CANVAS_WIDTH, useCanvasMetrics } from "./useCanvasMetrics";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementDeleted, elementReordered, elementSelected, elementsSelected, pageMoved, pageSelected,
  selectionAligned, selectionCopied, selectionDistributed, selectionPasted, textInserted, zoomChanged } from "../redux/editorSlice.js";
import EditorElement from "./EditorElement.jsx";
import EditorShapeTools from "./EditorShapeTools.jsx";
import EditorGroupSelectionFrame from "./EditorGroupSelectionFrame.jsx";
import { elementsInRect } from "./elementGeometry.js";
import EditorContextMenu from "./EditorContextMenu.jsx";
import { elementMenuItems, canvasMenuItems } from "./editorMenus.js";

export default function EditorCanvas({
  canPaste,
  onAddPage,
  onPageAction,
  showRulers,
  onToggleRulers,
}) {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedIds, zoom, snapGuides } = useAppSelector((state) => state.editor);
  const page = pages[currentPage];
  const { scrollRef, pageRef, metrics, pageStyle } = useCanvasMetrics(zoom);
  // Kept out of the bar so the menu doesn't inherit the bar's button styling.
  const [pageMenu, setPageMenu] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const pan = useRef(null), spacePressed = useRef(false);

  useEffect(() => {
    function key(event) { if (event.code === "Space" && !event.target.closest("input, textarea, [contenteditable='true']")) spacePressed.current = event.type === "keydown"; }
    window.addEventListener("keydown", key); window.addEventListener("keyup", key);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("keyup", key); };
  }, []);

  useEffect(() => {
    const scroller = scrollRef.current; if (!scroller) return;
    function wheel(event) {
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      const rect = scroller.getBoundingClientRect();
      const oldScale = metrics.scale || metrics.fitScale || .5;
      const next = Math.max(.1, Math.min(2, oldScale * Math.exp(-event.deltaY * .002)));
      const designX = (event.clientX - rect.left + scroller.scrollLeft - metrics.originX) / oldScale;
      const designY = (event.clientY - rect.top + scroller.scrollTop - metrics.originY) / oldScale;
      dispatch(zoomChanged(next));
      requestAnimationFrame(() => {
        scroller.scrollLeft += designX * (next - oldScale);
        scroller.scrollTop += designY * (next - oldScale);
      });
    }
    scroller.addEventListener("wheel", wheel, { passive: false }); return () => scroller.removeEventListener("wheel", wheel);
  }, [dispatch, metrics, scrollRef]);

  const selectedElements = page.elements.filter((element) => selectedIds.includes(element.id));
  const elementIndex = page.elements.findIndex((element) => element.id === selectedIds.at(-1));

  function canvasPointerDown(event) {
    if (event.target !== event.currentTarget || event.button !== 0) return;
    if (spacePressed.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / metrics.scale, y = (event.clientY - rect.top) / metrics.scale;
    event.currentTarget.setPointerCapture(event.pointerId);
    setMarquee({ pointerId: event.pointerId, left: x, top: y, right: x, bottom: y, base: event.shiftKey ? selectedIds : [] });
    if (!event.shiftKey) dispatch(elementSelected(null));
  }
  function canvasPointerMove(event) {
    if (!marquee || marquee.pointerId !== event.pointerId) return;
    const rect = pageRef.current.getBoundingClientRect();
    setMarquee((value) => ({ ...value, right: (event.clientX - rect.left) / metrics.scale, bottom: (event.clientY - rect.top) / metrics.scale }));
  }
  function canvasPointerUp(event) {
    if (!marquee || marquee.pointerId !== event.pointerId) return;
    const ids = elementsInRect(page.elements, marquee);
    dispatch(elementsSelected([...marquee.base, ...ids])); setMarquee(null);
  }

  function panStart(event) {
    if (!spacePressed.current || event.button !== 0) return;
    const scroller = scrollRef.current; pan.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
  }
  function panMove(event) {
    if (!pan.current || pan.current.pointerId !== event.pointerId) return;
    const scroller = scrollRef.current; scroller.scrollLeft = pan.current.left - (event.clientX - pan.current.x); scroller.scrollTop = pan.current.top - (event.clientY - pan.current.y);
  }
  function panEnd(event) { if (pan.current?.pointerId === event.pointerId) pan.current = null; }

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

        <div className="editor-canvas-scroll" ref={scrollRef} onPointerDown={panStart} onPointerMove={panMove} onPointerUp={panEnd} onPointerCancel={panEnd}>
          <div className="editor-page-stack">
              <div className="editor-page" style={pageStyle} data-page-id={pages[currentPage].id}>
                <div className="editor-canvas-meta"><span>{CANVAS_WIDTH} × {CANVAS_HEIGHT} px</span></div>
                <div
                  ref={pageRef}
                  className="editor-blank-canvas"
                  role="group"
                  tabIndex={0}
                  aria-label={`Canvas for page ${currentPage + 1}, ${CANVAS_WIDTH} by ${CANVAS_HEIGHT} pixels`}
                  style={{ background: page.background?.type === "COLOR" ? page.background.value : "#fff" }}
                  onPointerDown={canvasPointerDown} onPointerMove={canvasPointerMove} onPointerUp={canvasPointerUp} onPointerCancel={() => setMarquee(null)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    const hit = event.target.closest("[data-element-id]");
                    const id = hit?.dataset.elementId;
                    if (id && !selectedIds.includes(id)) dispatch(elementSelected(id));
                    setContextMenu({ x: event.clientX, y: event.clientY, target: id ? "element" : "canvas" });
                  }}
                >
                  {page.elements.map((element) => <EditorElement key={element.id} element={element} pageId={page.id}
                    sheetRef={pageRef} scale={metrics.scale} selected={selectedIds.includes(element.id)} selectedCount={selectedIds.length} />)}
                  {selectedElements.length > 1 && <EditorGroupSelectionFrame elements={selectedElements} sheetRef={pageRef} />}
                  {marquee && <span className="editor-marquee" style={{ left: `${Math.min(marquee.left, marquee.right) / 19.2}%`, top: `${Math.min(marquee.top, marquee.bottom) / 10.8}%`,
                    width: `${Math.abs(marquee.right - marquee.left) / 19.2}%`, height: `${Math.abs(marquee.bottom - marquee.top) / 10.8}%` }} />}
                  {snapGuides.map((guide) => <span key={`${guide.axis}:${guide.value}`} className={`editor-snap-guide is-${guide.axis}`}
                    style={guide.axis === "x" ? { left: `${guide.value / 19.2}%` } : { top: `${guide.value / 10.8}%` }} />)}
                </div>
              </div>
          </div>
          <EditorCanvasBar
            pages={pages}
            currentPage={currentPage}
            onAddPage={onAddPage}
            onPageChange={(index) => dispatch(pageSelected(index))}
            onPageMove={(from, to) => dispatch(pageMoved({ from, to }))}
            onPageMenu={(event, index) => {
              event.preventDefault();
              setPageMenu({ index, x: event.clientX, y: event.clientY });
            }}
            zoom={Math.round(metrics.scale * 100)}
            onZoom={(value) => dispatch(zoomChanged(value))}
            showRulers={showRulers}
            onToggleRulers={onToggleRulers}
          />
        </div>
      </div>

      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x} y={contextMenu.y}
          label={contextMenu.target === "element" ? "Element options" : "Page options"}
          items={contextMenu.target === "element"
            ? elementMenuItems({ count: selectedIds.length, index: elementIndex, last: page.elements.length - 1 })
            : canvasMenuItems({ canPaste, hasElements: page.elements.length > 0 })}
          onClose={() => setContextMenu(null)}
          onAction={(id) => {
            if (id === "duplicate") { dispatch(selectionCopied()); dispatch(selectionPasted()); }
            if (id === "copy") dispatch(selectionCopied());
            if (id === "paste") dispatch(selectionPasted());
            if (id === "delete") dispatch(elementDeleted());
            if (id === "forward") dispatch(elementReordered(1));
            if (id === "backward") dispatch(elementReordered(-1));
            if (id === "front") dispatch(elementReordered(page.elements.length));
            if (id === "back") dispatch(elementReordered(-page.elements.length));
            if (id === "select-all") dispatch(elementsSelected(page.elements.map((element) => element.id)));
            if (id === "align-center") dispatch(selectionAligned("center"));
            if (id === "align-middle") dispatch(selectionAligned("middle"));
            if (id === "distribute-h") dispatch(selectionDistributed("horizontal"));
            if (id === "add-title") dispatch(textInserted("heading"));
          }}
        />
      )}

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
