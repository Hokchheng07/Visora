import { useEffect, useId, useRef, useState } from "react";
import { elementStyle } from "../model/elementGeometry.js";
import { shapeDefinition, shapeName } from "../model/shapeCatalog.js";
import { filterId, hasVisibleEffects } from "../model/effectsFilter.js";
import { shapePath } from "../model/vectorPath.js";
import { gradientVector, normalizeGradient, strokePaint } from "../model/shapePaint.js";
import TimerArtwork from "../timer/TimerArtwork.jsx";
import ImageArtwork from "./ImageArtwork.jsx";
import { isOrderedList, listLines, normalizeListStyle } from "../model/textLists.js";
import { useElementDrag } from "./useElementDrag.js";
import EditorSelectionFrame from "./EditorSelectionFrame.jsx";
import EditorVectorEditor from "./EditorVectorEditor.jsx";
import EditorImageCropper, { EditorImageCropToolbar } from "./EditorImageCropper.jsx";
import { useAppDispatch, useAppStore } from "../../redux/hook.js";
import { cropStarted, elementSelected, pointEditStarted, targetChanged } from "../../redux/editorSlice.js";
import { elementsTarget } from "../inspector/inspectorEdit.js";
import { clockTickMs, formatClock, isClockKind } from "../model/clockText.js";
import { textStrokeStyle } from "../model/textStroke.js";
import { imageUrlFor } from "./imageSource.js";

/* Current Time and Date read their words live from the clock, never from the
   document — the value ticks in the component, so a running clock never rewrites
   the design or floods undo. A plain text layer returns its own content and
   never starts a timer. */
function useClockContent(element) {
  const kind = element.dynamic;
  const format = element.clockFormat;
  const live = isClockKind(kind);
  /* The current time is reactive state, not a bare new Date() read in render:
     the React Compiler memoises this component, and a value read from outside
     React (the clock) is not a dependency it can see, so it would cache the
     first reading forever. Ticking `now` is the dependency that recomputes it. */
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!live) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), clockTickMs(kind, format));
    return () => clearInterval(id);
  }, [live, kind, format]);
  return live ? formatClock(kind, format, new Date(now)) : element.content;
}

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
export function ShapeArtwork({ element, fit = false }) {
  const id = useId().replace(/:/g, "");
  const preset = shapeDefinition(element.shape);
  const w = element.w || preset?.w || 100, h = element.h || preset?.h || 100;
  const d = shapePath({ shape: element.shape, vector: element.vector, w, h, cornerRadius: element.cornerRadius || 0, cornerRadii: element.cornerRadii, flipX: element.flipX, flipY: element.flipY });
  const gradient = normalizeGradient(element.gradient);
  const fillImageUrl = element.fillImage && element.fillVisible !== false ? imageUrlFor(element.fillImage) : null;
  const fillOn = (!!element.fill || !!gradient) && element.fillVisible !== false;
  const ramp = gradient && gradientVector(gradient.angle);
  const strokeWidth = element.strokeWidth || 0;
  const strokeOn = !!element.stroke && element.stroke !== "transparent" && element.strokeVisible !== false && strokeWidth > 0;
  const align = strokeOn ? element.strokeAlign || "inside" : null;
  const margin = strokeWidth * 2 + 2;
  const effects = hasVisibleEffects(element);

  const svg = (
    <svg className="editor-element-art editor-vector-art" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio={fit ? "xMidYMid meet" : "none"} aria-hidden="true"
      style={effects ? undefined : { opacity: element.opacity }}>
      {((align && align !== "center") || gradient || fillImageUrl) && (
        <defs>
          {gradient && (
            <linearGradient id={`fill-${id}`} x1={ramp.x1} y1={ramp.y1} x2={ramp.x2} y2={ramp.y2}>
              {gradient.stops.map((stop, index) => (
                <stop key={`${stop.offset}-${index}`} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
              ))}
            </linearGradient>
          )}
          {fillImageUrl && <clipPath id={`imgclip-${id}`}><path data-morph-path="" d={d} /></clipPath>}
          {align === "inside" && <clipPath id={`clip-${id}`}><path data-morph-path="" d={d} /></clipPath>}
          {align === "outside" && (
            <mask id={`mask-${id}`} maskUnits="userSpaceOnUse" x={-margin} y={-margin} width={w + margin * 2} height={h + margin * 2}>
              <rect x={-margin} y={-margin} width={w + margin * 2} height={h + margin * 2} fill="white" />
              <path data-morph-path="" d={d} fill="black" />
            </mask>
          )}
        </defs>
      )}
      {fillOn && <path data-morph-path="" data-morph-fill="" d={d} fill={gradient ? `url(#fill-${id})` : element.fill} fillOpacity={element.fillOpacity ?? 1} />}
      {/* An image fill sits over the solid fallback, clipped to the shape and covering the box like object-fit: cover. */}
      {fillImageUrl && <image href={fillImageUrl} x="0" y="0" width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath={`url(#imgclip-${id})`} />}
      {strokeOn && (
        <path data-morph-path="" d={d} fill="none" stroke={element.stroke} strokeOpacity={element.strokeOpacity ?? 1}
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

/* One tab character, and taking one back off the start of the caret's line.
   The text is stored with real tabs, so what is typed is what is saved. */
const TAB = "\t";

function outdent(node) {
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0).cloneRange();
  range.setStart(node, 0);
  const before = range.toString();
  // Only a tab immediately behind the caret comes off; nothing else moves.
  if (!before.endsWith(TAB)) return;
  selection.collapseToEnd();
  const back = selection.getRangeAt(0);
  back.setStart(back.startContainer, Math.max(0, back.startOffset - 1));
  selection.removeAllRanges();
  selection.addRange(back);
  document.execCommand("insertText", false, "");
}

export function ElementArtwork({ element, editable = false, onCommit, onCancel, onDraft, draft, editRef }) {
  // Always first: a dynamic clock ticks through this even though only text draws it.
  const liveContent = useClockContent(element);
  if (element.type === "timer") return <TimerArtwork element={element} />;
  if (element.type === "image") return <ImageArtwork element={element} />;
  if (element.type !== "text") return <ShapeArtwork element={element} />;
  // A live clock is never edited by hand, so it always shows the generated value.
  const content = editable && !isClockKind(element.dynamic) ? element.content : liveContent;
  const style = { color: element.fill, opacity: element.opacity, fontFamily: element.fontFamily, fontSize: `${element.fontSize / 19.2}cqw`,
    fontWeight: element.fontWeight, fontStyle: element.fontStyle, textAlign: element.textAlign, lineHeight: element.lineHeight,
    textDecoration: element.textDecoration === "underline" ? "underline" : "none",
    justifyContent: element.textAlign === "left" ? "flex-start" : element.textAlign === "right" ? "flex-end" : "center",
    letterSpacing: `${element.letterSpacing / 19.2}cqw`, ...textStrokeStyle(element) };
  /* plaintext-only makes Enter insert a real line break and innerText read it
     back; with a plain contentEditable the browser inserts <div>/<br> and
     textContent drops them, which lost every line break typed on the canvas.
     The key remounts the span after a commit, so React never has to reconcile
     text nodes the browser rearranged while editing. */
  /* A list shows each line as a list item. The words are still typed as plain
     text — a contentEditable list would let the browser rebuild the items as
     it likes, which is the trap plaintext-only avoids — so while the box is
     being edited the markers come from a copy of the list underneath it,
     whose own text is invisible. Both layers share this typography and the
     same indent, so every marker stays level with its line as the text wraps
     and rewraps under the cursor. */
  const listStyle = normalizeListStyle(element.listStyle);
  const inside = listStyle && !editable && !(element.textAlign === "left" || !element.textAlign);
  if (listStyle && !editable) {
    const List = isOrderedList(listStyle) ? "ol" : "ul";
    const list = (
      <span className="editor-element-art editor-text-art editor-list-art" style={style}>
        <List className={`editor-text-list${inside ? " is-inside" : ""}`} style={{ listStyleType: listStyle }}>
          {listLines(content).map((line, index) => <li key={index}><span>{line || "\u00A0"}</span></li>)}
        </List>
      </span>
    );
    if (!hasVisibleEffects(element)) return list;
    return <span className="editor-element-art editor-element-effects" style={{ filter: `url(#${filterId(element.id)})` }} aria-hidden="true">{list}</span>;
  }
  /* A live clock's words are set on the span at mount, and React does not
     reconcile the children of a contentEditable node afterwards — so the key
     carries the live value, remounting the span each tick to commit it. */
  const text = <span key={isClockKind(element.dynamic) ? `clock-${content}` : element.content} ref={editRef} className={`editor-element-art editor-text-art${listStyle ? ` editor-text-listing${isOrderedList(listStyle) ? " is-ordered" : ""}` : ""}`} style={style}
    contentEditable={editable ? "plaintext-only" : "false"} suppressContentEditableWarning
    // Pasted text can carry non-breaking spaces; they become plain spaces so saved text matches what was typed.
    onBlur={(event) => onCommit?.(event.currentTarget.innerText.replace(/\u00A0/g, " ").replace(/\n$/, ""))}
    onInput={(event) => onDraft?.(event.currentTarget.innerText.replace(/\u00A0/g, " ").replace(/\n$/, ""))}
    onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.currentTarget.textContent = element.content; onCancel?.(); event.currentTarget.blur(); }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") event.currentTarget.blur();
      /* Tab indents the text instead of leaving the box. In a text box being
         typed into, leaving on Tab is the surprise — every other editor
         indents — and the box can still be left with Escape or a click. */
      if (event.key === "Tab" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        if (event.shiftKey) outdent(event.currentTarget);
        else document.execCommand("insertText", false, TAB);
        onDraft?.(event.currentTarget.innerText.replace(/\u00A0/g, " ").replace(/\n$/, ""));
      }
    }}>{content}</span>;
  /* The markers, under the text being typed. `aria-hidden` and no pointer:
     it is the same words twice, and only the editable copy may be reached. */
  const markers = editable && listStyle ? (
    <span className="editor-element-art editor-text-art editor-list-art editor-list-markers" style={style} aria-hidden="true">
      {(() => {
        const List = isOrderedList(listStyle) ? "ol" : "ul";
        return (
          <List className="editor-text-list" style={{ listStyleType: listStyle }}>
            {listLines(draft ?? element.content).map((line, index) => <li key={index}><span>{line || "\u00A0"}</span></li>)}
          </List>
        );
      })()}
    </span>
  ) : null;
  if (markers) return <>{markers}{text}</>;
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
export default function EditorElement({ element, pageId, sheetRef, scale, selected, selectedCount = 1, locked = false, pointKeys = null, cropping = false }) {
  const { targetRef, triggerRef } = useElementDrag(element, pageId, sheetRef, scale);
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const [editing, setEditing] = useState(false);
  /* The words as they are being typed. Only a list needs them — its markers
     are drawn from a second copy of the text and have to rewrap with it — so
     a text box without one never sets this and never re-renders per key. */
  const [draft, setDraft] = useState(null);
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
          aria-label={element.type === "text" ? (element.pageNumber ? `Page number ${element.content}` : element.dynamic === "time" ? "Current time" : element.dynamic === "date" ? "Current date" : `Text: ${element.content}`) : element.type === "timer" ? (element.timer?.mode === "STOPWATCH" ? "Stopwatch" : "Countdown timer") : element.type === "image" ? (element.name ? `Image: ${element.name}` : "Image") : `${shapeName(element.shape)} shape`} aria-pressed={editing ? undefined : selected}
          onPointerDown={(event) => { if (event.button === 0) event.stopPropagation(); }}
          onDoubleClick={(event) => {
            if (locked) return;
            event.stopPropagation();
            if (element.groupId && store.getState().editor.selectionMode === "group") dispatch(elementSelected(element.id));
            // A page number's digits, and a clock's words, are generated — there is nothing to type.
            else if (element.type === "text" && !element.pageNumber && !isClockKind(element.dynamic)) { setDraft(element.content); setEditing(true); }
            // Double-clicking a shape opens its points, as in Figma.
            else if (element.type === "shape") dispatch(pointEditStarted(element.id));
            // Double-clicking a photo crops it, as in Canva.
            else if (element.type === "image") dispatch(cropStarted(element.id));
          }}
          onKeyDown={(event) => {
            /* Only when the wrapper itself has focus. Keys typed in the editable text
               bubble through here; handling them blocked every Space. IME composition
               (Khmer commits with Space) is never intercepted. */
            if (editing || event.target !== event.currentTarget || event.nativeEvent.isComposing) return;
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); dispatch(elementSelected(element.id)); }
          }}>
          <ElementArtwork element={element} editable={editing} editRef={editRef} draft={draft}
            onDraft={element.listStyle ? setDraft : undefined}
            onCommit={(content) => { setEditing(false); setDraft(null); if (content !== element.content) dispatch(targetChanged({ target: elementsTarget(pageId, [element.id]), changes: { content } })); }}
            onCancel={() => { setEditing(false); setDraft(null); }} />
        </div>
        {/* The cropper sits beside the selection frame, not instead of it: the
            frame is what resizes the crop, and the cropper moves the photo in it. */}
        {selected && selectedCount === 1 && cropping && <EditorImageCropper element={element} scale={scale} />}
        {selected && selectedCount === 1 && (pointKeys
          ? <EditorVectorEditor element={element} pageId={pageId} sheetRef={sheetRef} scale={scale} keys={pointKeys} />
          : <EditorSelectionFrame element={element} sheetRef={sheetRef} locked={locked} />)}
      </div>
      {selected && selectedCount === 1 && cropping && <EditorImageCropToolbar element={element} pageId={pageId} />}
    </div>
  );
}
