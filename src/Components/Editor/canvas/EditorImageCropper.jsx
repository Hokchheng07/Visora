import { useEffect, useRef } from "react";
import { Check, ZoomIn } from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { cropFinished, elementTransformed, gestureCancelled, gestureFinished, gestureStarted, targetChanged } from "../../redux/editorSlice.js";
import { cropDragDelta, DEFAULT_CROP, MAX_ZOOM, normalizeCrop, panCrop } from "../model/imageCrop.js";
import { bounds } from "../model/elementGeometry.js";
import { elementsTarget } from "../inspector/inspectorEdit.js";

/*
 * The cropper drawn over a photo while it is being cropped.
 *
 * The frame does not move: the element's own box is the crop, resized with the
 * ordinary handles like any other element. What this adds is control of the
 * photo inside it — drag to slide it about, the slider to push in — which is
 * the half of cropping the selection frame cannot do.
 *
 *   Drag on the photo    slide it inside the frame
 *   Slider / wheel       zoom in and out
 *   Enter, Escape, or a click elsewhere   finish
 *
 * A drag is one canvas gesture and so one undo step, and Escape during a drag
 * puts the photo back where it was before the drag rather than ending the mode.
 */
export default function EditorImageCropper({ element, scale }) {
  const dispatch = useAppDispatch();
  const drag = useRef(null);
  const token = `crop:${element.id}`;
  const crop = normalizeCrop(element.crop);
  /* While a gesture is open the document is only written through
     elementTransformed — targetChanged refuses, so that a drag cannot be
     interleaved with edits from elsewhere. One drag is therefore one undo
     step, and the Reset button, which is not a drag, writes the ordinary way. */
  const move = (next) => dispatch(elementTransformed({ token, changes: { crop: normalizeCrop(next) } }));

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape" && drag.current) {
        // A drag in progress is what Escape cancels; the mode stays open.
        event.preventDefault(); event.stopImmediatePropagation();
        dispatch(gestureCancelled(token));
        drag.current = null;
        return;
      }
      if (event.key === "Escape" || event.key === "Enter") { event.preventDefault(); event.stopImmediatePropagation(); dispatch(cropFinished()); }
    }
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); if (drag.current) dispatch(gestureCancelled(token)); };
  }, [dispatch, token]);

  /* A drag is measured on screen and the crop is measured on the page, and at
     36% zoom those are not the same distance: the pointer crosses about three
     page pixels for every screen pixel it moves. Only the drag needs this —
     the canvas is laid out in percentages rather than scaled by a transform,
     so everything drawn here is already at its true size. */
  const unit = 1 / (scale || 1);

  return (
    <div className="editor-crop" data-crop-for={element.id}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { x: event.clientX, y: event.clientY, crop };
        dispatch(gestureStarted(token));
      }}
      onPointerMove={(event) => {
        const active = drag.current;
        if (!active) return;
        const delta = cropDragDelta((event.clientX - active.x) * unit, (event.clientY - active.y) * unit, element.rotation);
        move(panCrop(active.crop, delta.x, delta.y, element.w, element.h));
      }}
      onPointerUp={() => { if (drag.current) { drag.current = null; dispatch(gestureFinished(token)); } }}
      onPointerCancel={() => { if (drag.current) { drag.current = null; dispatch(gestureCancelled(token)); } }}
      onDoubleClick={(event) => { event.stopPropagation(); dispatch(cropFinished()); }}>
      {/* Thirds, as every crop tool draws them. Purely a guide: nothing here is draggable. */}
      <span className="editor-crop-grid" aria-hidden="true" />
    </div>
  );
}

/* The controls sit beside the rotated crop layer, not inside it. Rotating a
   photo must not rotate its slider, labels or hit targets. Place the bar below
   the rotated frame's screen-space bounds so 90° and diagonal photos work too. */
export function EditorImageCropToolbar({ element, pageId }) {
  const dispatch = useAppDispatch();
  const token = `crop:${element.id}`;
  const target = elementsTarget(pageId, [element.id]);
  const crop = normalizeCrop(element.crop);
  const bottom = bounds(element).bottom - element.y;
  const move = (next) => dispatch(elementTransformed({ token, changes: { crop: normalizeCrop(next) } }));
  const commit = (next) => dispatch(targetChanged({ target, changes: { crop: normalizeCrop(next) } }));

  return (
    <div className="editor-crop-bar" style={{ top: `${bottom / 19.2}cqw` }}
      onPointerDown={(event) => event.stopPropagation()}>
      <ZoomIn size={15} aria-hidden="true" />
      <input type="range" aria-label="Crop zoom" min={1} max={MAX_ZOOM} step={0.01} value={crop.zoom}
        onPointerDown={() => dispatch(gestureStarted(token))}
        onChange={(event) => move({ ...crop, zoom: event.target.valueAsNumber })}
        onPointerUp={() => dispatch(gestureFinished(token))} />
      <button type="button" className="editor-crop-reset" onClick={() => commit(DEFAULT_CROP)}
        disabled={crop.x === DEFAULT_CROP.x && crop.y === DEFAULT_CROP.y && crop.zoom === DEFAULT_CROP.zoom}>Reset</button>
      <button type="button" className="editor-crop-done" onClick={() => dispatch(cropFinished())}>
        <Check size={15} aria-hidden="true" /> Done
      </button>
    </div>
  );
}
