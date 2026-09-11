import { useEffect, useRef, useState } from "react";
import { elementStyle } from "./elementGeometry.js";
import { shapeDefinition, shapeName } from "./shapeCatalog.js";
import TimerArtwork from "./TimerArtwork.jsx";
import { useElementDrag } from "./useElementDrag.js";
import EditorSelectionFrame from "./EditorSelectionFrame.jsx";
import { useAppDispatch } from "../redux/hook.js";
import { elementChanged, elementSelected } from "../redux/editorSlice.js";

export function ShapeArtwork({ element }) {
  const definition = shapeDefinition(element.shape);
  if (definition?.paths) return <svg className="editor-element-art editor-vector-art" viewBox="0 0 100 100" preserveAspectRatio="none"
    style={{ color: element.fill, opacity: element.opacity }} aria-hidden="true">{definition.paths.map((path, index) => <path key={index} d={path} fill="currentColor" fillRule="evenodd" />)}</svg>;
  return <span className={`editor-element-art editor-shape-${element.shape}`} style={{ color: element.fill, background: element.fill, opacity: element.opacity }} aria-hidden="true" />;
}

export function ElementArtwork({ element, editable = false, onCommit, onCancel, editRef }) {
  if (element.type === "timer") return <TimerArtwork element={element} />;
  if (element.type !== "text") return <ShapeArtwork element={element} />;
  const style = { color: element.fill, opacity: element.opacity, fontFamily: element.fontFamily, fontSize: `${element.fontSize / 19.2}cqw`,
    fontWeight: element.fontWeight, fontStyle: element.fontStyle, textAlign: element.textAlign, lineHeight: element.lineHeight,
    justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
    letterSpacing: `${element.letterSpacing / 19.2}cqw` };
  return <span ref={editRef} className="editor-element-art editor-text-art" style={style} contentEditable={editable} suppressContentEditableWarning
    onBlur={(event) => onCommit?.(event.currentTarget.textContent || "")}
    onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.currentTarget.textContent = element.content; onCancel?.(); event.currentTarget.blur(); }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") event.currentTarget.blur();
    }}>{element.content}</span>;
}

// Shared by display mode and page thumbnails. No listeners or selection UI.
export function StaticElement({ element }) {
  if (element.visible === false) return null;
  return <span className="editor-static-element" data-element-id={element.id} style={{ ...elementStyle(element), rotate: `${element.rotation}deg` }}><ElementArtwork element={element} /></span>;
}

export default function EditorElement({ element, pageId, sheetRef, scale, selected, selectedCount = 1 }) {
  const { targetRef, triggerRef } = useElementDrag(element, pageId, sheetRef, scale);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const editRef = useRef(null);
  useEffect(() => {
    if (!editing || !editRef.current) return;
    editRef.current.focus();
    const selection = window.getSelection(), range = document.createRange();
    range.selectNodeContents(editRef.current); selection.removeAllRanges(); selection.addRange(range);
  }, [editing]);
  if (element.visible === false) return null;
  return (
    <div ref={targetRef} className={`editor-element${selected ? " is-selected" : ""}`} style={elementStyle(element)} data-element-id={element.id}>
      {/* Translation belongs to the outer wrapper. Rotation stays inside it,
          so dragging a rotated shape still follows the screen's axes. */}
      <div className="editor-element-rotation" style={{ rotate: `${element.rotation}deg` }}>
        <div ref={triggerRef} className="editor-element-hit" role="button" tabIndex={0}
          aria-label={element.type === "text" ? `Text: ${element.content}` : element.type === "timer" ? "Countdown timer" : `${shapeName(element.shape)} shape`} aria-pressed={selected}
          onPointerDown={(event) => { if (event.button === 0) event.stopPropagation(); }}
          onDoubleClick={(event) => { if (element.type === "text") { event.stopPropagation(); setEditing(true); } }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); dispatch(elementSelected(element.id)); }
          }}>
          <ElementArtwork element={element} editable={editing} editRef={editRef}
            onCommit={(content) => { setEditing(false); if (content !== element.content) dispatch(elementChanged({ content })); }}
            onCancel={() => { setEditing(false); }} />
        </div>
        {selected && selectedCount === 1 && <EditorSelectionFrame element={element} sheetRef={sheetRef} />}
      </div>
    </div>
  );
}
