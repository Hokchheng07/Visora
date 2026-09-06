import { elementStyle } from "./elementGeometry.js";
import { shapeName } from "./shapeCatalog.js";
import { useElementDrag } from "./useElementDrag.js";
import EditorSelectionFrame from "./EditorSelectionFrame.jsx";
import { useAppDispatch } from "../redux/hook.js";
import { elementSelected } from "../redux/editorSlice.js";

export function ShapeArtwork({ element }) {
  return <span className={`editor-element-art editor-shape-${element.shape}`} style={{ background: element.fill, opacity: element.opacity }} aria-hidden="true" />;
}

// Shared by display mode and page thumbnails. No listeners or selection UI.
export function StaticElement({ element }) {
  return <span className="editor-static-element" style={{ ...elementStyle(element), rotate: `${element.rotation}deg` }}><ShapeArtwork element={element} /></span>;
}

export default function EditorElement({ element, pageId, sheetRef, scale, selected }) {
  const { targetRef, triggerRef } = useElementDrag(element, pageId, sheetRef, scale);
  const dispatch = useAppDispatch();
  return (
    <div ref={targetRef} className={`editor-element${selected ? " is-selected" : ""}`} style={elementStyle(element)} data-element-id={element.id}>
      {/* Translation belongs to the outer wrapper. Rotation stays inside it,
          so dragging a rotated shape still follows the screen's axes. */}
      <div className="editor-element-rotation" style={{ rotate: `${element.rotation}deg` }}>
        <div ref={triggerRef} className="editor-element-hit" role="button" tabIndex={0}
          aria-label={`${shapeName(element.shape)} shape`} aria-pressed={selected}
          onPointerDown={(event) => { if (event.button === 0) event.stopPropagation(); }}
          onClick={() => dispatch(elementSelected(element.id))}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); dispatch(elementSelected(element.id)); }
          }}>
          <ShapeArtwork element={element} />
        </div>
        {selected && <EditorSelectionFrame element={element} sheetRef={sheetRef} />}
      </div>
    </div>
  );
}
