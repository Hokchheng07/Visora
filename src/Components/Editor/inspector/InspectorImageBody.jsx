import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical,
  Eye, EyeOff, FlipHorizontal2, FlipVertical2, Link2, Link2Off, RotateCw, SquareRoundCorner, Sun,
} from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { selectionAligned, targetChanged } from "../../redux/editorSlice.js";
import { ButtonRow, ColourRow, FieldLabel, IconAction, InspectorSection, NumberField, ResetStyle } from "./EditorInspectorFields.jsx";
import { normalizeRotation } from "./inspectorEdit.js";
import EffectsSection from "./InspectorEffects.jsx";
import { KHMER_GOLD, libraryElement } from "../model/khmerElements.js";

/*
 * Image settings, in the same order as a shape's: Position → Layout →
 * Appearance → Effects. An image has no fill or stroke of its own; the photo
 * is its paint. The proportion lock starts on, as photos usually want.
 */

const IMAGE_STYLE = { opacity: 1, cornerRadius: 0, flipX: false, flipY: false, effects: [], fill: null };
const KHMER_SWATCHES = [KHMER_GOLD, "#FFFFFF", "#C4443E", "#705AE0", "#111111"];

export default function InspectorImageBody({ element, target, busy }) {
  const dispatch = useAppDispatch();
  const commit = (changes) => dispatch(targetChanged({ target, changes }));
  const align = (edge) => () => dispatch(selectionAligned(edge));
  const ratio = element.h / element.w;
  const maxRadius = Math.round(Math.min(element.w, element.h) / 2);
  // Built-in Khmer vectors take a colour; uploaded photos do not.
  const library = libraryElement(element.src);
  const recolourable = !!library?.recolour;

  return (
    <>
      <InspectorSection title="Position">
        <FieldLabel>Alignment</FieldLabel>
        <div className="editor-inspector-row">
          <ButtonRow label="Align horizontally on the page" disabled={busy} items={[
            { id: "left", label: "Align left", icon: AlignStartVertical, onClick: align("left") },
            { id: "center", label: "Align horizontal centres", icon: AlignCenterVertical, onClick: align("center") },
            { id: "right", label: "Align right", icon: AlignEndVertical, onClick: align("right") },
          ]} />
          <ButtonRow label="Align vertically on the page" disabled={busy} items={[
            { id: "top", label: "Align top", icon: AlignStartHorizontal, onClick: align("top") },
            { id: "middle", label: "Align vertical centres", icon: AlignCenterHorizontal, onClick: align("middle") },
            { id: "bottom", label: "Align bottom", icon: AlignEndHorizontal, onClick: align("bottom") },
          ]} />
        </div>
        <FieldLabel>Position</FieldLabel>
        <div className="editor-inspector-grid">
          <NumberField label="X position" name="X" value={element.x} target={target} property="x" disabled={busy} toChanges={(x) => ({ x })} />
          <NumberField label="Y position" name="Y" value={element.y} target={target} property="y" disabled={busy} toChanges={(y) => ({ y })} />
        </div>
        <FieldLabel>Rotation</FieldLabel>
        <div className="editor-inspector-grid">
          <NumberField label="Rotation" name={<RotateCw size={13} />} suffix="°" value={normalizeRotation(element.rotation || 0)}
            target={target} property="rotation" disabled={busy} normalize={normalizeRotation} toChanges={(rotation) => ({ rotation })} />
          <ButtonRow label="Rotate and flip" disabled={busy} items={[
            { id: "rotate", label: "Rotate 90° right", icon: RotateCw, onClick: () => commit({ rotation: normalizeRotation((element.rotation || 0) + 90) }) },
            { id: "flipX", label: "Flip horizontal", icon: FlipHorizontal2, pressed: !!element.flipX, onClick: () => commit({ flipX: !element.flipX }) },
            { id: "flipY", label: "Flip vertical", icon: FlipVertical2, pressed: !!element.flipY, onClick: () => commit({ flipY: !element.flipY }) },
          ]} />
        </div>
      </InspectorSection>

      <InspectorSection title="Layout">
        <FieldLabel>Dimensions</FieldLabel>
        <div className="editor-inspector-dimensions">
          <NumberField label="Width" name="W" min={24} value={element.w} target={target} property="w" disabled={busy}
            toChanges={(w) => (element.lockAspect ? { w, h: w * ratio } : { w })} />
          <NumberField label="Height" name="H" min={24} value={element.h} target={target} property="h" disabled={busy}
            toChanges={(h) => (element.lockAspect ? { h, w: h / ratio } : { h })} />
          <IconAction icon={element.lockAspect ? Link2 : Link2Off} disabled={busy} pressed={!!element.lockAspect}
            label={element.lockAspect ? "Proportions locked" : "Lock proportions"} className={element.lockAspect ? "is-on" : ""}
            onClick={() => commit({ lockAspect: !element.lockAspect })} />
        </div>
      </InspectorSection>

      <InspectorSection title="Appearance"
        action={<IconAction icon={element.visible === false ? EyeOff : Eye} disabled={busy}
          label={element.visible === false ? "Show image" : "Hide image"} onClick={() => commit({ visible: element.visible === false })} />}>
        <div className="editor-inspector-grid is-labelled">
          <div><FieldLabel>Opacity</FieldLabel>
            <NumberField label="Opacity" name={<Sun size={13} />} suffix="%" min={0} max={100} value={(element.opacity ?? 1) * 100}
              target={target} property="opacity" disabled={busy} toChanges={(next) => ({ opacity: next / 100 })} /></div>
          <div><FieldLabel>Corner radius</FieldLabel>
            <NumberField label="Corner radius" name={<SquareRoundCorner size={13} />} min={0} max={maxRadius} value={element.cornerRadius || 0}
              target={target} property="cornerRadius" disabled={busy} toChanges={(cornerRadius) => ({ cornerRadius })} /></div>
        </div>
      </InspectorSection>

      {recolourable && (
        <InspectorSection title="Colour">
          <ColourRow label="Colour" value={element.fill || library?.color || KHMER_GOLD} target={target} disabled={busy}
            toChanges={(fill) => ({ fill })} quickSwatches={KHMER_SWATCHES} />
        </InspectorSection>
      )}

      <EffectsSection element={element} target={target} busy={busy} />

      <ResetStyle disabled={busy} onReset={() => commit(IMAGE_STYLE)} />
    </>
  );
}
