import { ArrowLeftRight, Minus, Plus, RotateCw, Settings2 } from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { targetChanged } from "../../redux/editorSlice.js";
import {
  defaultGradient, gradientCss, MAX_STOPS, MITER_ANGLE, normalizeAngle, normalizeGradient,
  strokeJoinOf, strokeStyleOf, STROKE_JOINS, STROKE_STYLES, strokeDashOf, miterAngleOf,
} from "../model/shapePaint.js";
import { ButtonRow, ColourRow, FieldLabel, IconAction, NumberField, SelectField } from "./EditorInspectorFields.jsx";
import { ToolPopover } from "../ui/EditorControls.jsx";

/*
 * The two paint controls that need more than one field: a gradient fill and
 * the stroke's style.
 *
 * Both edit one object at a time — the whole gradient, or the stroke's style
 * fields — and send it as a single change, so a stop dragged across its
 * neighbour and a dash width typed in a pop-up are each one undo step.
 */

const STYLE_LABELS = { solid: "Solid", dashed: "Dashed", dotted: "Dotted" };
const JOIN_LABELS = { miter: "Sharp corners", round: "Round corners", bevel: "Cut corners" };

export function FillPaint({ element, target, busy }) {
  const dispatch = useAppDispatch();
  const gradient = normalizeGradient(element.gradient);
  const commit = (changes) => dispatch(targetChanged({ target, changes }));
  /* Every write goes back through the normalizer, so stops stay sorted and in
     range however they were edited — a stop dragged past its neighbour simply
     takes its place, as in Figma. */
  const withGradient = (changes) => ({ gradient: normalizeGradient({ ...gradient, ...changes }) });
  const withStops = (stops) => withGradient({ stops });
  const setStop = (index, changes) => withStops(gradient.stops.map((stop, at) => (at === index ? { ...stop, ...changes } : stop)));

  function addStop() {
    // The widest gap between neighbours is where a new stop has room.
    let at = 0, widest = -1;
    gradient.stops.forEach((stop, index) => {
      const gap = index ? stop.offset - gradient.stops[index - 1].offset : 0;
      if (gap > widest) { widest = gap; at = index; }
    });
    const before = gradient.stops[Math.max(0, at - 1)], after = gradient.stops[at];
    commit(withStops([...gradient.stops, { offset: (before.offset + after.offset) / 2, color: after.color, opacity: after.opacity }]));
  }

  return (
    <>
      <div className="editor-inspector-grid">
        <SelectField label="Fill type" value={gradient ? "LINEAR" : "SOLID"} disabled={busy}
          options={[{ value: "SOLID", label: "Solid" }, { value: "LINEAR", label: "Linear" }]}
          onChange={(type) => commit(type === "LINEAR"
            ? { gradient: defaultGradient(element.fill || "#D9D9D9"), fill: element.fill || "#D9D9D9" }
            : { gradient: null, fill: gradient?.stops[0].color || element.fill })} />
        {gradient && (
          <div className="editor-inspector-paint">
            <NumberField label="Gradient angle" name={<RotateCw size={13} />} suffix="°" value={gradient.angle} target={target}
              property="gradient" disabled={busy} normalize={normalizeAngle} toChanges={(angle) => withGradient({ angle })} />
            <IconAction icon={ArrowLeftRight} label="Reverse gradient" disabled={busy}
              onClick={() => commit(withStops(gradient.stops.map((stop) => ({ ...stop, offset: Math.round((1 - stop.offset) * 1e4) / 1e4 })).reverse()))} />
          </div>
        )}
      </div>

      {gradient && (
        <>
          <span className="editor-gradient-preview" style={{ background: gradientCss(gradient) }} aria-hidden="true" />
          <div className="editor-inspector-group-head">
            <FieldLabel>Stops</FieldLabel>
            <IconAction icon={Plus} label={gradient.stops.length >= MAX_STOPS ? `Up to ${MAX_STOPS} stops` : "Add stop"}
              disabled={busy || gradient.stops.length >= MAX_STOPS} onClick={addStop} />
          </div>
          {gradient.stops.map((stop, index) => (
            <div className="editor-inspector-paint" key={`${index}-${stop.offset}`}>
              <NumberField className="editor-gradient-offset" label={`Stop ${index + 1} position`} name="" suffix="%" min={0} max={100}
                value={stop.offset * 100} target={target} property={`gradient-stop-${index}`} disabled={busy}
                toChanges={(next) => setStop(index, { offset: next / 100 })} />
              <ColourRow label={`Stop ${index + 1} colour`} value={stop.color} opacity={stop.opacity} target={target} disabled={busy}
                property={`gradient-stop-${index}`} toChanges={(color) => setStop(index, { color })}
                opacityProperty={`gradient-stop-${index}`} toOpacityChanges={(next) => setStop(index, { opacity: next / 100 })} />
              <IconAction icon={Minus} label={`Remove stop ${index + 1}`} disabled={busy || gradient.stops.length <= 2}
                onClick={() => commit(withStops(gradient.stops.filter((_item, at) => at !== index)))} />
            </div>
          ))}
        </>
      )}
    </>
  );
}

/* Dashes, corners and the miter angle: rarely changed, so they sit behind the
   Stroke section's settings button rather than taking four rows. */
export function StrokeSettings({ element, target, busy }) {
  const dispatch = useAppDispatch();
  const commit = (changes) => dispatch(targetChanged({ target, changes }));
  const style = strokeStyleOf(element.strokeStyle);
  const join = strokeJoinOf(element.strokeJoin);
  const dash = strokeDashOf(element) || { dash: 0, gap: 0 };

  return (
    <ToolPopover label="Stroke settings" disabled={busy} className="editor-inspector-icon" anchor="left start"
      panelClassName="editor-popover-effect" trigger={<Settings2 size={15} aria-hidden="true" />}>
      <p className="editor-popover-title">Stroke settings</p>
      <div className="editor-inspector-grid is-labelled">
        <div><FieldLabel>Style</FieldLabel>
          <SelectField label="Stroke style" value={style} disabled={busy}
            options={STROKE_STYLES.map((value) => ({ value, label: STYLE_LABELS[value] }))}
            onChange={(next) => commit({ strokeStyle: next, strokeDash: null })} /></div>
        <div><FieldLabel>Corners</FieldLabel>
          <ButtonRow label="Corner join" disabled={busy} items={STROKE_JOINS.map((value) => ({
            id: value, label: JOIN_LABELS[value], icon: joinIcon(value), pressed: join === value, onClick: () => commit({ strokeJoin: value }),
          }))} /></div>
      </div>
      {style !== "solid" && (
        <div className="editor-inspector-grid is-labelled">
          <div><FieldLabel>Dash</FieldLabel>
            <NumberField label="Dash length" name="" suffix="px" min={0} max={200} value={dash.dash} target={target} property="strokeDash"
              disabled={busy || style === "dotted"} toChanges={(next) => ({ strokeDash: [next, dash.gap] })} /></div>
          <div><FieldLabel>Gap</FieldLabel>
            <NumberField label="Dash gap" name="" suffix="px" min={0} max={200} value={dash.gap} target={target} property="strokeDash"
              disabled={busy} toChanges={(next) => ({ strokeDash: [dash.dash, next] })} /></div>
        </div>
      )}
      {join === "miter" && (
        <div className="editor-inspector-grid is-labelled">
          <div><FieldLabel>Miter angle</FieldLabel>
            <NumberField label="Miter angle" name="" suffix="°" decimals={2} min={MITER_ANGLE.min} max={MITER_ANGLE.max}
              value={miterAngleOf(element.miterAngle)} target={target} property="miterAngle" disabled={busy}
              toChanges={(miterAngle) => ({ miterAngle })} /></div>
        </div>
      )}
      <p className="editor-inspector-hint">Corners sharper than the miter angle are cut off instead of running to a point.</p>
    </ToolPopover>
  );
}

// Small inline marks rather than icon-font shapes: each one draws its own corner.
function joinIcon(kind) {
  const path = kind === "miter" ? "M3 13V3h10" : kind === "round" ? "M3 13V8a5 5 0 0 1 5-5h5" : "M3 13V6l3-3h7";
  return function JoinMark(props) {
    return (
      <svg viewBox="0 0 16 16" width={props.size || 15} height={props.size || 15} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d={path} />
      </svg>
    );
  };
}
