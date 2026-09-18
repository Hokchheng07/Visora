import { useRef } from "react";
import { Eye, EyeOff, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { targetChanged } from "../../redux/editorSlice.js";
import { ToolPopover } from "../ui/EditorControls.jsx";
import { MAX_EFFECTS, normalizeEffects } from "../model/effectsFilter.js";
import { ColourRow, FieldLabel, IconAction, InspectorSection, NumberField, SelectField } from "./EditorInspectorFields.jsx";
import { useEditSession } from "./inspectorEdit.js";

/*
 * The Effects section, shared by text and shapes: up to four drop or inner
 * shadows, each a row with its settings pop-up, type, show/hide and remove.
 */

const NEW_EFFECT = { type: "DROP_SHADOW", visible: true, x: 0, y: 12, blur: 24, spread: 0, color: "#000000", opacity: 0.25 };
const EFFECT_LABELS = { DROP_SHADOW: "Drop shadow", INNER_SHADOW: "Inner shadow" };
const PAD_RANGE = 100;

export default function EffectsSection({ element, target, busy }) {
  const dispatch = useAppDispatch();
  const effects = normalizeEffects(element.effects);
  return (
    <InspectorSection title="Effects" action={
      <IconAction icon={Plus} label={effects.length >= MAX_EFFECTS ? `Up to ${MAX_EFFECTS} effects` : "Add effect"}
        disabled={busy || effects.length >= MAX_EFFECTS}
        onClick={() => dispatch(targetChanged({ target, changes: { effects: [...effects, NEW_EFFECT] } }))} />}>
      {effects.map((effect, index) => (
        <EffectRow key={index} index={index} effect={effect} effects={effects} target={target} busy={busy} />
      ))}
    </InspectorSection>
  );
}

function EffectRow({ index, effect, effects, target, busy }) {
  const dispatch = useAppDispatch();
  const withEffect = (patch) => ({ effects: effects.map((item, position) => (position === index ? { ...item, ...patch } : item)) });
  const commit = (patch) => dispatch(targetChanged({ target, changes: withEffect(patch) }));
  return (
    <div className={`editor-inspector-paint${effect.visible ? "" : " is-dimmed"}`}>
      <ToolPopover label={`${EFFECT_LABELS[effect.type]} settings`} disabled={busy} anchor="left start"
        className="editor-inspector-icon" panelClassName="editor-popover-effect"
        trigger={<SlidersHorizontal size={15} aria-hidden="true" />}>
        <EffectSettings effect={effect} target={target} withEffect={withEffect} commit={commit} busy={busy} />
      </ToolPopover>
      <SelectField label={`Effect ${index + 1} type`} value={effect.type} disabled={busy}
        options={Object.entries(EFFECT_LABELS).map(([value, label]) => ({ value, label }))} onChange={(type) => commit({ type })} />
      <IconAction icon={effect.visible ? Eye : EyeOff} label={effect.visible ? "Hide effect" : "Show effect"} disabled={busy}
        onClick={() => commit({ visible: !effect.visible })} />
      <IconAction icon={Minus} label="Remove effect" disabled={busy}
        onClick={() => dispatch(targetChanged({ target, changes: { effects: effects.filter((_, position) => position !== index) } }))} />
    </div>
  );
}

/* The shadow pop-up from the prototype: type, a direction pad with X and Y,
   blur, spread and colour. The pad and every field label scrub as one session. */
function EffectSettings({ effect, target, withEffect, commit, busy }) {
  const session = useEditSession();
  const padRef = useRef(null);
  const clampPad = (value) => Math.max(-PAD_RANGE, Math.min(PAD_RANGE, value));
  const knob = { left: `${50 + clampPad(effect.x) / PAD_RANGE * 42}%`, top: `${50 + clampPad(effect.y) / PAD_RANGE * 42}%` };

  function fromPointer(event) {
    const rect = padRef.current.getBoundingClientRect(), half = rect.width * 0.42;
    let x = clampPad((event.clientX - rect.left - rect.width / 2) / half * PAD_RANGE);
    let y = clampPad((event.clientY - rect.top - rect.height / 2) / half * PAD_RANGE);
    if (event.shiftKey) {
      const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4), distance = Math.hypot(x, y);
      x = Math.cos(angle) * distance; y = Math.sin(angle) * distance;
    }
    session.update(target, "effects", withEffect({ x: Math.round(x), y: Math.round(y) }));
  }

  return (
    <div className="editor-effect-settings">
      <div className="editor-effect-type" role="radiogroup" aria-label="Shadow type">
        {Object.entries(EFFECT_LABELS).map(([type, label]) => (
          <button type="button" key={type} role="radio" aria-checked={effect.type === type} disabled={busy} onClick={() => commit({ type })}>{label}</button>
        ))}
      </div>
      <div className="editor-effect-direction">
        <div ref={padRef} className="editor-effect-pad" role="group" tabIndex={0}
          aria-label="Shadow direction. Drag, or use arrow keys; Shift moves 10."
          onPointerDown={(event) => { if (busy) return; event.currentTarget.setPointerCapture?.(event.pointerId); fromPointer(event); }}
          onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture?.(event.pointerId)) fromPointer(event); }}
          onPointerUp={session.finish} onLostPointerCapture={session.finish}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 10 : 1;
            const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
            if (!moves) return;
            event.preventDefault(); event.stopPropagation();
            commit({ x: effect.x + moves[0], y: effect.y + moves[1] });
          }}>
          <span className="editor-effect-line" style={{ width: `${Math.hypot(clampPad(effect.x), clampPad(effect.y)) / PAD_RANGE * 42}%`,
            rotate: `${Math.atan2(effect.y, effect.x)}rad` }} aria-hidden="true" />
          <span className="editor-effect-knob" style={knob} aria-hidden="true" />
        </div>
        <div className="editor-effect-xy">
          <NumberField label="Shadow X" name="X" min={-400} max={400} value={effect.x} target={target} property="effects" disabled={busy} toChanges={(x) => withEffect({ x })} />
          <NumberField label="Shadow Y" name="Y" min={-400} max={400} value={effect.y} target={target} property="effects" disabled={busy} toChanges={(y) => withEffect({ y })} />
        </div>
      </div>
      <div className="editor-inspector-grid is-labelled">
        <div><FieldLabel>Blur</FieldLabel>
          <NumberField label="Blur" name="B" min={0} max={200} value={effect.blur} target={target} property="effects" disabled={busy} toChanges={(blur) => withEffect({ blur })} /></div>
        <div><FieldLabel>Spread</FieldLabel>
          <NumberField label="Spread" name="S" min={0} max={100} value={effect.spread} target={target} property="effects" disabled={busy} toChanges={(spread) => withEffect({ spread })} /></div>
      </div>
      <FieldLabel>Colour</FieldLabel>
      <ColourRow label="Shadow colour" value={effect.color} opacity={effect.opacity} target={target} property="effects" disabled={busy}
        toChanges={(color) => withEffect({ color })} opacityProperty="effects" toOpacityChanges={(next) => withEffect({ opacity: next / 100 })} />
    </div>
  );
}
