import { useEffect, useId, useRef, useState } from "react";
import { elementStyle } from "./elementGeometry.js";
import { shapeDefinition, shapeName } from "./shapeCatalog.js";
import { filterId, hasVisibleEffects } from "./effectsFilter.js";
import { shapePath } from "./vectorPath.js";
import { gradientVector, normalizeGradient, strokePaint } from "./shapePaint.js";
import TimerArtwork from "./TimerArtwork.jsx";
import { useElementDrag } from "./useElementDrag.js";
import EditorSelectionFrame from "./EditorSelectionFrame.jsx";
import { useAppDispatch, useAppStore } from "../redux/hook.js";
import { elementSelected, targetChanged } from "../redux/editorSlice.js";
import { elementsTarget } from "./inspectorEdit.js";

/*
 * Every shape is an SVG path built from point data (vectorPath.js) in the
 * element's own pixels: viewBox 0 0 w h matches the box, so the SVG scales
 * evenly on every surface and stroke widths and corner radii are canvas pixels.
 *
 * Stroke position: SVG only strokes on the centre of the edge, so an inside
 * stroke is a double-width stroke clipped to the shape, and an outside stroke is
 * a double-width stroke with the shape masked out. Clip and mask ids come from
 * useId, so the canvas, page strip and display mode never share one — a
 * definition inside a hidden thumbnail would otherwise stop working elsewhere.
 *
 * Shadows are an SVG filter defined once for the whole editor
 * (EditorEffectDefs) and applied to the effects wrapper, never to the path.
 *
 * A gradient fill is a <linearGradient> in the same local defs, measured in the
 * shape's own box, so one definition is right at every size the shape is drawn.
 * `fill` stays the solid colour underneath it, which is what a client that
 * cannot resolve the definition still sees.
 */
export function ShapeArtwork({ element }) {
  const id = useId().replace(/:/g, "");
  const preset = shapeDefinition(element.shape);
  const w = element.w || preset?.w || 100, h = element.h || preset?.h || 100;
  const d = shapePath({ shape: element.shape, vector: element.vector, w, h, cornerRadius: element.cornerRadius || 0, cornerRadii: element.cornerRadii, flipX: element.flipX, flipY: element.flipY });
  const gradient = normalizeGradient(element.gradient);
  const fillOn = (!!element.fill || !!gradient) && element.fillVisible !== false;
  const ramp = gradient && gradientVector(gradient.angle);
  const strokeWidth = element.strokeWidth || 0;
  const strokeOn = !!element.stroke && element.stroke !== "transparent" && element.strokeVisible !== false && strokeWidth > 0;
  const align = strokeOn ? element.strokeAlign || "inside" : null;
  const margin = strokeWidth * 2 + 2;
  const effects = hasVisibleEffects(element);

  const svg = (
    <svg className="editor-element-art editor-vector-art" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true"
      style={effects ? undefined : { opacity: element.opacity }}>
      {((align && align !== "center") || gradient) && (
        <defs>
          {gradient && (
            <linearGradient id={`fill-${id}`} x1={ramp.x1} y1={ramp.y1} x2={ramp.x2} y2={ramp.y2}>
              {gradient.stops.map((stop, index) => (
                <stop key={`${stop.offset}-${index}`} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
              ))}
            </linearGradient>
          )}
          {align === "inside" && <clipPath id={`clip-${id}`}><path d={d} /></clipPath>}
          {align === "outside" && (
            <mask id={`mask-${id}`} maskUnits="userSpaceOnUse" x={-margin} y={-margin} width={w + margin * 2} height={h + margin * 2}>
              <rect x={-margin} y={-margin} width={w + margin * 2} height={h + margin * 2} fill="white" />
              <path d={d} fill="black" />
            </mask>
          )}
        </defs>
      )}
      {fillOn && <path d={d} fill={gradient ? `url(#fill-${id})` : element.fill} fillOpacity={element.fillOpacity ?? 1} />}
      {strokeOn && (
        <path d={d} fill="none" stroke={element.stroke} strokeOpacity={element.strokeOpacity ?? 1}
          strokeWidth={align === "center" ? strokeWidth : strokeWidth * 2} {...strokePaint(element)}
          clipPath={align === "inside" ? `url(#clip-${id})` : undefined} mask={align === "outside" ? `url(#mask-${id})` : undefined} />
      )}
    </svg>
  );
  if (!effects) return svg;
  return (
    <span className="editor-element-art editor-element-effects" style={{ filter: `url(#${filterId(element.id)})`, opacity: element.opacity }} aria-hidden="true">
      {svg}
    </span>
  );
}

export function ElementArtwork({ element, editable = false, onCommit, onCancel, editRef }) {
  if (element.type === "timer") return <TimerArtwork element={element} />;
  if (element.type !== "text") return <ShapeArtwork element={element} />;
  const style = { color: element.fill, opacity: element.opacity, fontFamily: element.fontFamily, fontSize: `${element.fontSize / 19.2}cqw`,
    fontWeight: element.fontWeight, fontStyle: element.fontStyle, textAlign: element.textAlign, lineHeight: element.lineHeight,
    textDecoration: element.textDecoration === "underline" ? "underline" : "none",
    justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
    letterSpacing: `${element.letterSpacing / 19.2}cqw` };
  /* plaintext-only makes Enter insert a real line break and innerText read it
     back; with a plain contentEditable the browser inserts <div>/<br> and
     textContent drops them, which lost every line break typed on the canvas.
     The key remounts the span after a commit, so React never has to reconcile
     text nodes the browser rearranged while editing. */
  const text = <span key={element.content} ref={editRef} className="editor-element-art editor-text-art" style={style}
    contentEditable={editable ? "plaintext-only" : "false"} suppressContentEditableWarning
    // Pasted text can carry non-breaking spaces; they become plain spaces so saved text matches what was typed.
    onBlur={(event) => onCommit?.(event.currentTarget.innerText.replace(/\u00A0/g, " ").replace(/\n$/, ""))}
    onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.currentTarget.textContent = element.content; onCancel?.(); event.currentTarget.blur(); }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") event.currentTarget.blur();
    }}>{element.content}</span>;
  // Shadows are a filter on a wrapper, never on the editable span itself.
  if (!hasVisibleEffects(element)) return text;
  return <span className="editor-element-art editor-element-effects" style={{ filter: `url(#${filterId(element.id)})` }} aria-hidden={editable ? undefined : "true"}>{text}</span>;
}

// Shared by display mode and page thumbnails. No listeners or selection UI.
// `layered` puts an element with shadows on its own compositor layer (display
// mode). Page thumbnails leave it off: they are still, and many layers cost memory.
export function StaticElement({ element, layered = false }) {
  if (element.visible === false) return null;
  return <span className="editor-static-element" data-element-id={element.id} style={{ ...elementStyle(element), rotate: `${element.rotation}deg`,
    ...(layered && hasVisibleEffects(element) ? { willChange: "transform" } : {}) }}><ElementArtwork element={element} /></span>;
}

/* `locked` (the element's own lock or its group's) makes the element ignore the
   pointer: a press passes through to whatever is behind it, as in Figma. */
export default function EditorElement({ element, pageId, sheetRef, scale, selected, selectedCount = 1, locked = false }) {
  const { targetRef, triggerRef } = useElementDrag(element, pageId, sheetRef, scale);
  const dispatch = useAppDispatch();
  const store = useAppStore();
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
    <div ref={targetRef} className={`editor-element${selected ? " is-selected" : ""}${locked ? " is-locked" : ""}`} data-element-id={element.id}
      /* Phase 0: an element with shadows needs its own layer, or anything moving nearby re-runs its filter every frame. */
      style={hasVisibleEffects(element) ? { ...elementStyle(element), willChange: "transform" } : elementStyle(element)}>
      {/* Translation belongs to the outer wrapper. Rotation stays inside it,
          so dragging a rotated shape still follows the screen's axes. */}
      <div className="editor-element-rotation" style={{ rotate: `${element.rotation}deg` }}>
        {/* While the text is being edited the wrapper stops acting as a button, so the
            editable text is not nested inside one and its keys reach the text. */}
        <div ref={triggerRef} className="editor-element-hit" role={editing ? undefined : "button"} tabIndex={editing ? -1 : 0}
          aria-label={element.type === "text" ? `Text: ${element.content}` : element.type === "timer" ? "Countdown timer" : `${shapeName(element.shape)} shape`} aria-pressed={editing ? undefined : selected}
          onPointerDown={(event) => { if (event.button === 0) event.stopPropagation(); }}
          onDoubleClick={(event) => {
            if (locked) return;
            event.stopPropagation();
            if (element.groupId && store.getState().editor.selectionMode === "group") dispatch(elementSelected(element.id));
            else if (element.type === "text") setEditing(true);
          }}
          onKeyDown={(event) => {
            /* Only when the wrapper itself has focus. Keys typed in the editable text
               bubble through here; handling them blocked every Space. IME composition
               (Khmer commits with Space) is never intercepted. */
            if (editing || event.target !== event.currentTarget || event.nativeEvent.isComposing) return;
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); dispatch(elementSelected(element.id)); }
          }}>
          <ElementArtwork element={element} editable={editing} editRef={editRef}
            onCommit={(content) => { setEditing(false); if (content !== element.content) dispatch(targetChanged({ target: elementsTarget(pageId, [element.id]), changes: { content } })); }}
            onCancel={() => { setEditing(false); }} />
        </div>
        {selected && selectedCount === 1 && <EditorSelectionFrame element={element} sheetRef={sheetRef} locked={locked} />}
      </div>
    </div>
  );
}
