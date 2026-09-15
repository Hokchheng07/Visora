import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical,
  Eye, EyeOff, FlipHorizontal2, FlipVertical2, Link2, Link2Off, Minus, Plus, RotateCw, SquareRoundCorner, Sun,
} from "lucide-react";
import { useAppDispatch } from "../redux/hook.js";
import { selectionAligned, targetChanged } from "../redux/editorSlice.js";
import { STROKE_ALIGNS } from "./editorDocument.js";
import {
  ButtonRow, ColourRow, FieldLabel, IconAction, InspectorSection, NumberField, ResetStyle, SelectField,
} from "./EditorInspectorFields.jsx";
import { normalizeRotation } from "./inspectorEdit.js";
import EffectsSection from "./InspectorEffects.jsx";

/*
 * Shape settings, in Figma's order: Position (alignment, X/Y, rotation and
 * flips) → Layout (size and proportion lock) → Appearance (visibility,
 * opacity, corner radius) → Fill → Stroke → Effects.
 *
 * Fill, stroke and effects follow Figma's add / show-hide / remove pattern: a
 * section with nothing in it shows only its title and a + button.
 */

const STROKE_LABELS = { inside: "Inside", center: "Center", outside: "Outside" };
const NEW_FILL = { fill: "#D9D9D9", fillOpacity: 1, fillVisible: true };
const NEW_STROKE = { stroke: "#211D29", strokeWidth: 4, strokeAlign: "inside", strokeOpacity: 1, strokeVisible: true };
const SHAPE_STYLE = { fill: "#AD8DEA", fillOpacity: 1, fillVisible: true, opacity: 1, stroke: null, strokeWidth: 0, cornerRadius: 0, effects: [] };

export default function InspectorShapeBody({ element, target, busy }) {
  const dispatch = useAppDispatch();
  const commit = (changes) => dispatch(targetChanged({ target, changes }));
  const hasFill = !!element.fill;
  const hasStroke = !!element.stroke && element.stroke !== "transparent";
  const ratio = element.h / element.w;
  const align = (edge) => () => dispatch(selectionAligned(edge));

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
          label={element.visible === false ? "Show shape" : "Hide shape"} onClick={() => commit({ visible: element.visible === false })} />}>
        <div className="editor-inspector-grid is-labelled">
          <div><FieldLabel>Opacity</FieldLabel>
            <NumberField label="Opacity" name={<Sun size={13} />} suffix="%" min={0} max={100} value={(element.opacity ?? 1) * 100}
              target={target} property="opacity" disabled={busy} toChanges={(next) => ({ opacity: next / 100 })} /></div>
          <div><FieldLabel>Corner radius</FieldLabel>
            <NumberField label="Corner radius" name={<SquareRoundCorner size={13} />} min={0} max={Math.round(Math.min(element.w, element.h) / 2)}
              value={element.cornerRadius || 0} target={target} property="cornerRadius" disabled={busy} toChanges={(cornerRadius) => ({ cornerRadius })} /></div>
        </div>
      </InspectorSection>

      <InspectorSection title="Fill" action={!hasFill && <IconAction icon={Plus} label="Add fill" disabled={busy} onClick={() => commit(NEW_FILL)} />}>
        {hasFill && (
          <div className="editor-inspector-paint">
            <ColourRow label="Fill" value={element.fill} opacity={element.fillOpacity ?? 1} target={target} disabled={busy}
              dimmed={element.fillVisible === false} toChanges={(fill) => ({ fill })}
              opacityProperty="fillOpacity" toOpacityChanges={(next) => ({ fillOpacity: next / 100 })} />
            <IconAction icon={element.fillVisible === false ? EyeOff : Eye} disabled={busy}
              label={element.fillVisible === false ? "Show fill" : "Hide fill"} onClick={() => commit({ fillVisible: element.fillVisible === false })} />
            <IconAction icon={Minus} label="Remove fill" disabled={busy} onClick={() => commit({ fill: null })} />
          </div>
        )}
      </InspectorSection>

      <InspectorSection title="Stroke" action={!hasStroke && <IconAction icon={Plus} label="Add stroke" disabled={busy} onClick={() => commit(NEW_STROKE)} />}>
        {hasStroke && (
          <>
            <div className="editor-inspector-paint">
              <ColourRow label="Stroke" value={element.stroke} opacity={element.strokeOpacity ?? 1} target={target} disabled={busy}
                property="stroke" dimmed={element.strokeVisible === false} toChanges={(stroke) => ({ stroke })}
                opacityProperty="strokeOpacity" toOpacityChanges={(next) => ({ strokeOpacity: next / 100 })} />
              <IconAction icon={element.strokeVisible === false ? EyeOff : Eye} disabled={busy}
                label={element.strokeVisible === false ? "Show stroke" : "Hide stroke"} onClick={() => commit({ strokeVisible: element.strokeVisible === false })} />
              <IconAction icon={Minus} label="Remove stroke" disabled={busy} onClick={() => commit({ stroke: null, strokeWidth: 0 })} />
            </div>
            <div className="editor-inspector-grid">
              <SelectField label="Stroke position" value={element.strokeAlign || "inside"} disabled={busy}
                options={STROKE_ALIGNS.map((value) => ({ value, label: STROKE_LABELS[value] }))} onChange={(strokeAlign) => commit({ strokeAlign })} />
              <NumberField label="Stroke width" name="≡" min={0} max={50} value={element.strokeWidth || 0} target={target}
                property="strokeWidth" disabled={busy} toChanges={(strokeWidth) => ({ strokeWidth })} />
            </div>
          </>
        )}
      </InspectorSection>

      <EffectsSection element={element} target={target} busy={busy} />

      <ResetStyle disabled={busy} onReset={() => commit(SHAPE_STYLE)} />
    </>
  );
}

