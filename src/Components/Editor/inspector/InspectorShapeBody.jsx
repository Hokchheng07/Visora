import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical,
  Eye, EyeOff, FlipHorizontal2, FlipVertical2, Link2, Link2Off, Minus, Plus, RotateCw, Scan, SquareRoundCorner, Sun,
} from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { selectionAligned, targetChanged } from "../../redux/editorSlice.js";
import { STROKE_ALIGNS } from "../model/editorDocument.js";
import { CORNER_NAMES, cornerRadiiFor, INDEPENDENT_CORNER_SHAPES } from "../model/vectorPath.js";
import {
  ButtonRow, ColourRow, FieldLabel, IconAction, InspectorSection, NumberField, ResetStyle, SelectField,
} from "./EditorInspectorFields.jsx";
import { normalizeRotation } from "./inspectorEdit.js";
import EffectsSection from "./InspectorEffects.jsx";
import { FillPaint, StrokeSettings } from "./InspectorPaint.jsx";
import InspectorVectorSection from "./InspectorVectorSection.jsx";
import { gradientCss, normalizeGradient } from "../model/shapePaint.js";

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
const SHAPE_STYLE = { fill: "#AD8DEA", fillOpacity: 1, fillVisible: true, opacity: 1, stroke: null, strokeWidth: 0, cornerRadius: 0, cornerRadii: null,
  gradient: null, fillImage: null, strokeStyle: "solid", strokeDash: null, strokeJoin: "miter", miterAngle: 28.96, effects: [] };
// The corner icon rounds its top right, so each field turns it to point at its own corner.
const CORNER_TURNS = [-90, 0, 90, 180];

export default function InspectorShapeBody({ element, target, busy, pointKeys = null }) {
  const dispatch = useAppDispatch();
  const commit = (changes) => dispatch(targetChanged({ target, changes }));
  const gradient = normalizeGradient(element.gradient);
  const hasFill = !!element.fill || !!gradient || !!element.fillImage;
  const hasStroke = !!element.stroke && element.stroke !== "transparent";
  const ratio = element.h / element.w;
  const align = (edge) => () => dispatch(selectionAligned(edge));
  const maxRadius = Math.round(Math.min(element.w, element.h) / 2);
  const canSplitCorners = !element.vector && INDEPENDENT_CORNER_SHAPES.has(element.shape);
  const radii = cornerRadiiFor(element.shape, element.vector, element.cornerRadii);
  const mixed = !!radii && radii.some((value) => value !== radii[0]);
  const radius = radii ? radii[0] : element.cornerRadius || 0;

  return (
    <>
      {/* Editing points swaps the box settings for Figma's Vector panel; paint stays. */}
      {pointKeys ? <InspectorVectorSection element={element} target={target} keys={pointKeys} busy={busy} /> : <>
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
            <div className="editor-inspector-radius">
              {/* With corners split, typing here sets all four at once; "Mixed" means they differ. */}
              <NumberField label="Corner radius" name={<SquareRoundCorner size={13} />} min={0} max={maxRadius}
                value={mixed ? Number.NaN : radius} placeholder={mixed ? "Mixed" : undefined} target={target} property="cornerRadius" disabled={busy}
                toChanges={(cornerRadius) => (radii ? { cornerRadius, cornerRadii: [cornerRadius, cornerRadius, cornerRadius, cornerRadius] } : { cornerRadius })} />
              {canSplitCorners && (
                <IconAction icon={Scan} disabled={busy} pressed={!!radii} className={radii ? "is-on" : ""}
                  label={radii ? "Use one radius for all corners" : "Independent corners"}
                  onClick={() => commit(radii ? { cornerRadius: Math.max(...radii), cornerRadii: null } : { cornerRadii: [radius, radius, radius, radius] })} />
              )}
            </div></div>
        </div>
        {radii && (
          <div className="editor-inspector-grid editor-inspector-corners">
            {[0, 1, 3, 2].map((corner) => (
              <NumberField key={corner} label={`${CORNER_NAMES[corner]} radius`} min={0} max={maxRadius} value={radii[corner]}
                name={<SquareRoundCorner size={13} style={{ rotate: `${CORNER_TURNS[corner]}deg` }} />}
                target={target} property={`cornerRadii.${corner}`} disabled={busy}
                toChanges={(next) => ({ cornerRadii: radii.map((value, index) => (index === corner ? next : value)) })} />
            ))}
          </div>
        )}
      </InspectorSection>

      </>}

      <InspectorSection title="Fill" action={!hasFill && <IconAction icon={Plus} label="Add fill" disabled={busy} onClick={() => commit(NEW_FILL)} />}>
        {hasFill && (
          <>
            <div className={`editor-inspector-paint${element.fillVisible === false ? " is-dimmed" : ""}`}>
              {gradient ? (
                // The ramp itself stands in for the swatch and hex of a solid fill.
                <div className="editor-inspector-frame editor-gradient-row">
                  <span className="editor-gradient-swatch" style={{ background: gradientCss(gradient) }} aria-hidden="true" />
                  <span className="editor-gradient-label">Linear</span>
                  <NumberField className="is-bare" label="Fill opacity" name="" suffix="%" min={0} max={100} value={(element.fillOpacity ?? 1) * 100}
                    target={target} property="fillOpacity" disabled={busy} toChanges={(next) => ({ fillOpacity: next / 100 })} />
                </div>
              ) : (
                <ColourRow label="Fill" value={element.fill} opacity={element.fillOpacity ?? 1} target={target} disabled={busy}
                  dimmed={element.fillVisible === false} toChanges={(fill) => ({ fill })}
                  opacityProperty="fillOpacity" toOpacityChanges={(next) => ({ fillOpacity: next / 100 })} />
              )}
              <IconAction icon={element.fillVisible === false ? EyeOff : Eye} disabled={busy}
                label={element.fillVisible === false ? "Show fill" : "Hide fill"} onClick={() => commit({ fillVisible: element.fillVisible === false })} />
              <IconAction icon={Minus} label="Remove fill" disabled={busy} onClick={() => commit({ fill: null, gradient: null })} />
            </div>
            <FillPaint element={element} target={target} busy={busy} />
          </>
        )}
      </InspectorSection>

      <InspectorSection title="Stroke" action={hasStroke
        ? <StrokeSettings element={element} target={target} busy={busy} />
        : <IconAction icon={Plus} label="Add stroke" disabled={busy} onClick={() => commit(NEW_STROKE)} />}>
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

      {!pointKeys && <ResetStyle disabled={busy} onReset={() => commit(SHAPE_STYLE)} />}
    </>
  );
}

