import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import EditorCanvasBar from "./EditorCanvasBar";
import EditorPageMenu from "./EditorPageMenu";
import EditorRuler from "./EditorRuler";
import { CANVAS_HEIGHT, CANVAS_WIDTH, useCanvasMetrics } from "./useCanvasMetrics";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { canvasAllSelected, layersMovedToPage, pointEditFinished, elementDeleted, layersStepped, elementSelected, canvasLayersSelected, selectionGrouped, groupUngrouped, pageMoved, pageSelected,
  selectionAligned, selectionCopied, selectionDistributed, selectionPasted, targetChanged, textInserted, zoomChanged } from "../redux/editorSlice.js";
import EditorElement from "./EditorElement.jsx";
import EditorPageBar from "./EditorPageBar.jsx";
import EditorGroupSelectionFrame from "./EditorGroupSelectionFrame.jsx";
import { elementsInRect } from "./elementGeometry.js";
import EditorContextMenu from "./EditorContextMenu.jsx";
import { elementMenuItems, canvasMenuItems } from "./editorMenus.js";
import { canvasSelectable, effectiveLocked, effectiveVisible, stepLayers, canGroup, selectedGroup, pageLabel } from "./layerModel.js";
import { pageTarget } from "./inspectorEdit.js";
import AnimationSurface from "./AnimationSurface.jsx";

export default function EditorCanvas({
  canPaste,
  onAddPage,
  onPageAction,
  showRulers,
  onToggleRulers,
  onAnimate,
  previewing = false,
  onPreviewDone,
}) {
  const dispatch = useAppDispatch();
  const editor = useAppSelector((state) => state.editor);
  const { pages, currentPage, selectedIds, selectionMode, zoom, snapGuides, pointEdit } = editor;
  const page = pages[currentPage];
  const { scrollRef, pageRef, metrics, pageStyle } = useCanvasMetrics(zoom);
  // Kept out of the bar so the menu doesn't inherit the bar's button styling.
  const [pageMenu, setPageMenu] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const pan = useRef(null), spacePressed = useRef(false);
  // Set when the view should jump back to the page: a page change, or Fit.
  const centreOnPage = useRef(true);

  useEffect(() => {
    function key(event) { if (event.code === "Space" && !event.target.closest("input, textarea, [contenteditable='true'], [contenteditable='plaintext-only']")) spacePressed.current = event.type === "keydown"; }
    window.addEventListener("keydown", key); window.addEventListener("keyup", key);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("keyup", key); };
  }, []);

  /* The page sits in the middle of a work area three times its size, so the
     view has to be put back on the page when the page changes or Fit is
     pressed. Zooming with the wheel keeps its own anchor and is left alone. */
  const pageId = pages[currentPage].id;
  useEffect(() => { centreOnPage.current = true; }, [pageId]);
  useEffect(() => {
    const scroller = scrollRef.current, sheet = pageRef.current;
    if (!centreOnPage.current || !scroller || !sheet || !metrics.scale) return;
    centreOnPage.current = false;
    const view = scroller.getBoundingClientRect(), rect = sheet.getBoundingClientRect();
    scroller.scrollLeft += rect.left - view.left - (view.width - rect.width) / 2;
    scroller.scrollTop += rect.top - view.top - (view.height - rect.height) / 2;
  }, [pageId, metrics.scale, metrics.viewWidth, metrics.viewHeight, scrollRef, pageRef]);

  /* Zoom so the design point under (clientX, clientY) stays put. The work area
     grows from its own top-left corner (a page away from the sheet), so the
     anchor is stored in work-area units and the scroll is corrected once the
     new size has actually been laid out, not guessed a frame later. */
  const zoomAnchor = useRef(null);
  const zoomAt = useCallback((next, clientX, clientY) => {
    const work = scrollRef.current?.querySelector(".editor-work-area")?.getBoundingClientRect();
    const oldScale = metrics.scale || metrics.fitScale || .5;
    next = Math.max(.1, Math.min(2, next));
    if (work) zoomAnchor.current = { x: (clientX - work.left) / oldScale, y: (clientY - work.top) / oldScale, clientX, clientY };
    dispatch(zoomChanged(next));
  }, [dispatch, metrics.scale, metrics.fitScale, scrollRef]);
  useLayoutEffect(() => {
    const anchor = zoomAnchor.current, scroller = scrollRef.current;
    const work = scroller?.querySelector(".editor-work-area")?.getBoundingClientRect();
    if (!anchor || !work || !metrics.scale) return;
    zoomAnchor.current = null;
    scroller.scrollLeft += work.left + anchor.x * metrics.scale - anchor.clientX;
    scroller.scrollTop += work.top + anchor.y * metrics.scale - anchor.clientY;
  }, [metrics.scale, scrollRef]);

  useEffect(() => {
    const scroller = scrollRef.current; if (!scroller) return;
    function wheel(event) {
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      // Where the pointer sits on the page, so that point stays under it while the zoom changes.
      zoomAt((metrics.scale || metrics.fitScale || .5) * Math.exp(-event.deltaY * .002), event.clientX, event.clientY);
    }
    scroller.addEventListener("wheel", wheel, { passive: false }); return () => scroller.removeEventListener("wheel", wheel);
  }, [zoomAt, metrics.scale, metrics.fitScale, scrollRef]);

  /* One page of room on every side, in real pixels at the current zoom. A
     percentage would be measured against a parent that is itself sized by its
     content, which collapses the sheet to nothing. */
  const workStyle = metrics.scale ? { width: `${CANVAS_WIDTH * 3 * metrics.scale}px`, height: `${CANVAS_HEIGHT * 3 * metrics.scale}px` } : undefined;
  const selectedElements = page.elements.filter((element) => selectedIds.includes(element.id));
  // Hidden layers selected from the Layers panel get no frame; the canvas cannot transform what it does not show.
  const framedElements = selectedElements.filter((element) => effectiveVisible(page, element));
  const selectionLocked = selectedElements.some((element) => effectiveLocked(page, element));

  function canvasPointerDown(event) {
    // Anything but an element or one of its handles: the press is a marquee.
    if (event.button !== 0 || event.target.closest("[data-element-id], .editor-resize-handle, .editor-rotate-handle")) return;
    // A press away from the shape being edited leaves point editing first.
    if (pointEdit) dispatch(pointEditFinished());
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
    const ids = elementsInRect(page.elements.filter((element) => canvasSelectable(page, element)), marquee);
    dispatch(canvasLayersSelected([...marquee.base, ...ids])); setMarquee(null);
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
        {/* The view holds everything that scrolls or overlays the canvas; the
            page strip and zoom sit below it so the (3x page) work area can
            never push them out of sight. */}
        <div className="editor-canvas-view">
        <EditorPageBar onAnimate={onAnimate} />
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
              <div className="editor-page" data-page-id={pages[currentPage].id}>
                {/* The work area is the page plus a page of room on every side.
                    Pressing anywhere in it — on the sheet or out on the grey —
                    starts a marquee, so an element parked off-stage can be
                    picked up the same way as one on the page. */}
                <div className="editor-work-area" style={workStyle}
                  onPointerDown={canvasPointerDown} onPointerMove={canvasPointerMove} onPointerUp={canvasPointerUp} onPointerCancel={() => setMarquee(null)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    const hit = event.target.closest("[data-element-id]");
                    const id = hit?.dataset.elementId;
                    if (id && !selectedIds.includes(id)) dispatch(elementSelected(id));
                    setContextMenu({ x: event.clientX, y: event.clientY, target: id ? "element" : "canvas" });
                  }}>
                <div className="editor-page-frame" style={pageStyle}>
                <div className="editor-canvas-meta"><span>{CANVAS_WIDTH} × {CANVAS_HEIGHT} px</span></div>
                <div
                  ref={pageRef}
                  className="editor-blank-canvas"
                  role="group"
                  tabIndex={0}
                  aria-label={`Canvas for page ${currentPage + 1}, ${CANVAS_WIDTH} by ${CANVAS_HEIGHT} pixels`}
                  style={{ background: page.background?.type === "COLOR" ? page.background.value : "#fff" }}
                >
                  {page.elements.map((element) => effectiveVisible(page, element) && <EditorElement key={element.id} element={element} pageId={page.id}
                    sheetRef={pageRef} scale={metrics.scale} selected={selectedIds.includes(element.id)} selectedCount={framedElements.length}
                    locked={effectiveLocked(page, element)} pointKeys={pointEdit?.elementId === element.id ? pointEdit.keys : null} />)}
                  {framedElements.length > 1 && <EditorGroupSelectionFrame elements={framedElements} sheetRef={pageRef} locked={selectionLocked} />}
                  {marquee && <span className="editor-marquee" style={{ left: `${Math.min(marquee.left, marquee.right) / 19.2}%`, top: `${Math.min(marquee.top, marquee.bottom) / 10.8}%`,
                    width: `${Math.abs(marquee.right - marquee.left) / 19.2}%`, height: `${Math.abs(marquee.bottom - marquee.top) / 10.8}%` }} />}
                  {snapGuides.map((guide) => <span key={`${guide.axis}:${guide.value}`} className={`editor-snap-guide is-${guide.axis}`}
                    style={guide.axis === "x" ? { left: `${guide.value / 19.2}%` } : { top: `${guide.value / 10.8}%` }} />)}
                  {previewing && <div className="editor-animation-canvas-preview"><AnimationSurface page={page} preview onDone={onPreviewDone} /></div>}
                </div>
                </div>
                </div>
              </div>
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
          onZoom={(value) => {
            if (value === null) { centreOnPage.current = true; dispatch(zoomChanged(null)); return; }
            const view = scrollRef.current?.getBoundingClientRect();
            if (view) zoomAt(value, view.left + view.width / 2, view.top + view.height / 2);
            else dispatch(zoomChanged(value));
          }}
          showRulers={showRulers}
          onToggleRulers={onToggleRulers}
        />
      </div>

      {contextMenu && (
        <EditorContextMenu
          x={contextMenu.x} y={contextMenu.y}
          label={contextMenu.target === "element" ? "Element options" : "Page options"}
          items={contextMenu.target === "element"
            ? elementMenuItems({ count: selectedIds.length, locked: selectionLocked,
              pages: pages.map((item, index) => pageLabel(item, index)), currentPage,
              canGroup: canGroup(page, selectedIds), canUngroup: !!selectedGroup(editor),
              canForward: stepLayers(page, selectedIds, "forward", selectionMode) !== page.elements,
              canBackward: stepLayers(page, selectedIds, "backward", selectionMode) !== page.elements })
            : canvasMenuItems({ canPaste, hasElements: page.elements.length > 0 })}
          onClose={() => setContextMenu(null)}
          onAction={(id) => {
            if (id === "duplicate") { dispatch(selectionCopied()); dispatch(selectionPasted()); }
            if (id === "copy") dispatch(selectionCopied());
            if (id === "paste") dispatch(selectionPasted());
            if (id === "delete") dispatch(elementDeleted());
            if (id.startsWith("move-to-page:")) dispatch(layersMovedToPage({ pageIndex: Number(id.split(":")[1]) }));
            if (["forward", "backward", "front", "back"].includes(id)) dispatch(layersStepped({ direction: id }));
            if (id === "group") dispatch(selectionGrouped());
            if (id === "ungroup") dispatch(groupUngrouped());
            if (id === "select-all") dispatch(canvasAllSelected());
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
          name={pageLabel(pages[pageMenu.index], pageMenu.index)}
          onRename={(name) => dispatch(targetChanged({ target: pageTarget(pages[pageMenu.index].id), changes: { name } }))}
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
