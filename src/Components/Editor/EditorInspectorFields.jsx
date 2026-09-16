import { useCallback, useEffect, useRef, useState } from "react";
import { Check, RotateCcw, RotateCw } from "lucide-react";
import { useAppDispatch } from "../redux/hook.js";
import { targetChanged } from "../redux/editorSlice.js";
import { ToolPopover } from "./EditorControls.jsx";
import { normalizeRotation, parseHex, useEditSession } from "./inspectorEdit.js";

/*
 * The inspector's building blocks. Every body in the Customize column is
 * assembled from these, so a field looks and behaves the same wherever it
 * appears.
 *
 * One field anatomy throughout: a 32px frame, an 8px radius, a short label or
 * icon inside the frame on the left, the value, and a unit on the right. Labels
 * that sit inside the field are also scrub handles — drag them sideways to
 * change the number, as in Figma — so every number is both typeable and
 * draggable without a separate slider row.
 *
 * Two ways a field writes to the document:
 *  - continuous input (scrubbing, the colour picker) opens an edit session, so
 *    one drag is one undo step;
 *  - typed input keeps a local draft and commits once, on Enter or blur.
 * Both address a target captured when the edit begins, never "whatever is
 * selected now". Targets, the session hook and the parsers live in
 * inspectorEdit.js.
 */

export function InspectorSection({ title, action, children, className = "" }) {
  return (
    <section className={`editor-inspector-group ${className}`}>
      {(title || action) && (
        <div className="editor-inspector-group-head">
          {title && <h3>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* A text input that edits a draft and commits once. `context` is captured on
   focus and handed back to onCommit, so the commit reaches the element that was
   selected when typing began. Escape puts the last committed value back.

   A pending draft is also committed when the field unmounts. Clicking another
   element changes the selection on pointerdown, which swaps the inspector body
   before the browser moves focus, so the field is gone before it could blur. */
export function DraftInput({ value, parse, onCommit, context, onStep, multiline = false, inputRef, className = "", ...props }) {
  const [draft, setDraft] = useState(null);
  const captured = useRef(context);
  const pending = useRef(null);
  const shown = draft ?? String(value);

  function commit() {
    if (draft === null) return;
    const parsed = parse(draft);
    setDraft(null);
    pending.current = null;
    if (parsed !== null && String(parsed) !== String(value)) onCommit(parsed, captured.current);
  }
  // Refs are written from effects, not during render (the React Compiler relies on that).
  useEffect(() => { pending.current = draft === null ? null : commit; });
  useEffect(() => () => pending.current?.(), []);

  // A multiline draft keeps Enter for new lines; Ctrl or Cmd + Enter commits.
  const Field = multiline ? "textarea" : "input";
  return (
    <Field
      {...(multiline ? {} : { type: "text" })}
      ref={inputRef}
      className={className}
      {...props}
      value={shown}
      onFocus={(event) => { captured.current = context; setDraft(String(value)); props.onFocus?.(event); }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => { commit(); props.onBlur?.(event); }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) { event.preventDefault(); commit(); setDraft(String(parse(draft ?? "") ?? value)); return; }
        if (event.key === "Escape" && draft !== null) {
          // Handled here so the editor's Escape (deselect) does not also run.
          event.preventDefault(); event.stopPropagation(); setDraft(String(value)); return;
        }
        if (onStep && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
          event.preventDefault();
          const step = (event.shiftKey ? 10 : 1) * (event.key === "ArrowUp" ? 1 : -1);
          const next = onStep(parse(draft ?? String(value)) ?? value, step);
          if (next !== null && next !== undefined) { onCommit(next, captured.current); setDraft(String(next)); }
        }
      }}
    />
  );
}

const clampTo = (min, max) => (value) => Math.min(max, Math.max(min, value));
const roundTo = (decimals) => (value) => Math.round(value * 10 ** decimals) / 10 ** decimals;
const parseNumber = (clamp, round) => (raw) => {
  const cleaned = String(raw).replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || Number.isNaN(Number(cleaned))) return null;
  return clamp(round(Number(cleaned)));
};

/* A number in a field frame. The label (a letter or an icon) scrubs: drag it
   sideways and the value follows the pointer, one session per drag; a plain
   click on it focuses the input instead. Arrow keys step by `step`, with Shift
   by ten steps. */
export function NumberField({
  label, name, value, min = -Infinity, max = Infinity, step = 1, decimals = 0, suffix, target, property,
  toChanges, disabled, normalize, placeholder, className = "",
}) {
  const dispatch = useAppDispatch();
  const session = useEditSession();
  const inputRef = useRef(null);
  const scrub = useRef(null);
  const settle = (number) => (normalize ? normalize(number) : clampTo(min, max)(roundTo(decimals)(number)));
  const parse = (raw) => { const number = parseNumber((n) => n, (n) => n)(raw); return number === null ? null : settle(number); };
  const shown = Number.isFinite(value) ? roundTo(decimals)(value) : "";

  return (
    <label className={`editor-inspector-number ${className}`}>
      {name !== undefined && (
        <span className="editor-inspector-scrub" aria-hidden="true" title={disabled ? undefined : `Drag to change ${label.toLowerCase()}`}
          onPointerDown={(event) => {
            if (disabled || event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture?.(event.pointerId);
            scrub.current = { x: event.clientX, start: Number.isFinite(value) ? value : 0, moved: false };
          }}
          onPointerMove={(event) => {
            const drag = scrub.current;
            if (!drag) return;
            const dx = event.clientX - drag.x;
            if (!drag.moved && Math.abs(dx) < 3) return;
            drag.moved = true;
            const next = settle(drag.start + Math.round(dx / 2) * step * (event.shiftKey ? 10 : 1));
            session.update(target, property, toChanges(next));
          }}
          onPointerUp={() => {
            const drag = scrub.current;
            scrub.current = null;
            if (drag?.moved) session.finish(); else inputRef.current?.focus();
          }}
          onLostPointerCapture={() => { if (scrub.current?.moved) session.finish(); scrub.current = null; }}>
          {name}
        </span>
      )}
      <DraftInput inputRef={inputRef} inputMode="decimal" aria-label={label} disabled={disabled} value={shown} parse={parse} placeholder={placeholder}
        context={target}
        onCommit={(next, captured) => dispatch(targetChanged({ target: captured, changes: toChanges(next) }))}
        onStep={(current, direction) => settle(current + direction * step)} />
      {suffix && <small>{suffix}</small>}
    </label>
  );
}

export function LayoutFields({ element, target, disabled }) {
  const field = (key, name, label, extra = {}) => (
    <NumberField label={label} name={name} value={element[key]} target={target} property={key} disabled={disabled}
      toChanges={(next) => ({ [key]: next })} {...extra} />
  );
  return (
    <div className="editor-inspector-grid">
      {field("x", "X", "X position")}
      {field("y", "Y", "Y position")}
      {field("w", "W", "Width", { min: 24 })}
      {field("h", "H", "Height", { min: 24 })}
      <NumberField label="Rotation" name={<RotateCw size={13} />} suffix="°" value={normalizeRotation(element.rotation || 0)}
        target={target} property="rotation" disabled={disabled} normalize={normalizeRotation} toChanges={(rotation) => ({ rotation })} />
    </div>
  );
}

const SWATCHES = [
  "#705AE0", "#A78DFF", "#DA4EC9", "#FFC21C", "#72BFF1", "#2F7A55", "#C4443E", "#F07A2B",
  "#FFFFFF", "#F2F1F6", "#C9C6D4", "#8C8799", "#4A4460", "#29243A", "#15131D", "#000000",
];

/* Colour, as one row in one frame: swatch (opens document colours and a custom
   picker), hex, and optionally opacity. Swatches and typed values commit once;
   dragging in the custom picker is one session. */
export function ColourRow({ label, value, opacity, target, property = "fill", toChanges, disabled, quickSwatches,
  toOpacityChanges = (next) => ({ opacity: next / 100 }), opacityProperty = "opacity", dimmed = false }) {
  const dispatch = useAppDispatch();
  const session = useEditSession();
  const safe = parseHex(value) || "#000000";
  // The picker lives in a popover panel that mounts later, so its native
  // `change` listener is attached from a callback ref rather than an effect.
  const pickerRef = useCallback((picker) => {
    if (!picker) return undefined;
    picker.addEventListener("change", session.finish);
    return () => picker.removeEventListener("change", session.finish);
  }, [session.finish]);
  const commit = (colour) => dispatch(targetChanged({ target, changes: toChanges(colour) }));

  return (
    <>
      <div className={`editor-inspector-frame editor-inspector-colour${disabled ? " is-disabled" : ""}${dimmed ? " is-dimmed" : ""}`}>
        <ToolPopover label={`${label}: choose`} disabled={disabled} className="editor-inspector-swatch-trigger" panelClassName="editor-popover-swatches"
          trigger={<span className="editor-inspector-swatch" style={{ background: safe }} aria-hidden="true" />}>
          <p className="editor-popover-title">Document colours</p>
          <div className="editor-swatch-grid">
            {SWATCHES.map((colour) => (
              <button type="button" key={colour} className="editor-swatch" style={{ background: colour }}
                aria-label={colour} aria-pressed={safe === colour} onClick={() => commit(colour)}>
                {safe === colour && <Check size={13} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <label className="editor-popover-custom">
            <span>Custom</span>
            <input ref={pickerRef} type="color" value={safe.toLowerCase()} aria-label={`Custom ${label.toLowerCase()}`}
              onChange={(event) => session.update(target, property, toChanges(event.target.value.toUpperCase()))}
              onBlur={session.finish} />
          </label>
        </ToolPopover>
        <DraftInput className="editor-inspector-hex" aria-label={`${label} hex`} disabled={disabled} spellCheck={false} maxLength={7}
          value={safe.slice(1)} context={target}
          parse={(raw) => parseHex(raw)?.slice(1) ?? null}
          onCommit={(digits, captured) => dispatch(targetChanged({ target: captured, changes: toChanges(`#${digits}`) }))} />
        {opacity !== undefined && (
          <NumberField className="is-bare" label={`${label} opacity`} name="" suffix="%" min={0} max={100} value={opacity * 100}
            target={target} property={opacityProperty} disabled={disabled} toChanges={toOpacityChanges} />
        )}
      </div>
      {quickSwatches && (
        <div className="editor-inspector-quick" role="group" aria-label={`${label} presets`}>
          {quickSwatches.map((colour) => (
            <button type="button" key={colour} style={{ background: colour }} disabled={disabled}
              aria-label={colour} aria-pressed={safe === colour.toUpperCase()} onClick={() => commit(colour)} />
          ))}
        </div>
      )}
    </>
  );
}

export function ToggleRow({ label, checked, disabled, locked, onChange }) {
  return (
    <label className={`editor-toggle${locked ? " is-locked" : ""}`}>
      <span>{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled || locked} onChange={(event) => onChange(event.target.checked)} />
      <span className="editor-toggle-track" aria-hidden="true" />
    </label>
  );
}

export function ResetStyle({ disabled, onReset, children = "Reset style" }) {
  return (
    <button type="button" className="editor-inspector-reset" disabled={disabled} onClick={onReset}>
      <RotateCcw size={14} aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}

/* Font size: type any size, or pick a common one from the list, as in Canva.
   The list is the usual type scale; typed values outside it still work. */
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120, 128];

export function FontSizeField({ value, target, disabled, min = 8, max = 400 }) {
  const dispatch = useAppDispatch();
  const current = Math.round(value);
  return (
    <div className={`editor-inspector-frame editor-inspector-fontsize${disabled ? " is-disabled" : ""}`}>
      <NumberField label="Font size" suffix="px" min={min} max={max} value={value} target={target} property="fontSize"
        disabled={disabled} className="is-flush" toChanges={(fontSize) => ({ fontSize })} />
      <ToolPopover label="Font sizes" disabled={disabled} anchor="bottom end" className="editor-inspector-fontsize-toggle"
        panelClassName="editor-popover-list editor-fontsize-list" trigger={null}>
        {({ close }) => FONT_SIZES.map((size) => (
          <button key={size} type="button" className={`editor-menu-row${size === current ? " is-on" : ""}`} aria-pressed={size === current}
            onClick={() => { dispatch(targetChanged({ target, changes: { fontSize: size } })); close(); }}>
            {size === current ? <Check size={14} aria-hidden="true" /> : <span className="editor-menu-gap" aria-hidden="true" />}
            <span>{size}</span>
          </button>
        ))}
      </ToolPopover>
    </div>
  );
}

/* A labelled native select that commits on change. Native, not a custom menu:
   it is keyboard-complete, and on phones it opens the system picker. */
export function SelectField({ label, value, options, onChange, disabled, style }) {
  return (
    <select className="editor-inspector-select" aria-label={label} value={value} disabled={disabled} style={style}
      onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option.value} value={option.value} style={option.style}>{option.label}</option>)}
    </select>
  );
}

/* A grouped set of icon buttons in one frame: toggles (B, I, U) or one-of
   choices (alignment). Each item: { id, label, icon, pressed, onClick }. */
export function ButtonRow({ label, items, disabled }) {
  return (
    <div className="editor-inspector-buttons" role="group" aria-label={label}>
      {items.map(({ id, label: name, icon: Icon, pressed, onClick, disabled: itemDisabled }) => (
        <button type="button" key={id} className={pressed ? "is-on" : ""} aria-label={name} title={name}
          aria-pressed={pressed === undefined ? undefined : pressed} disabled={disabled || itemDisabled} onClick={onClick}>
          <Icon size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/* Text that shows on the canvas as it is typed. Every keystroke updates the
   element, and the whole typing run is one edit session, so it is one undo
   step; it ends on blur, and Escape puts back the text from before. */
export function LiveTextArea({ label, value, target, property, toChanges, disabled, className = "", ...props }) {
  const session = useEditSession();
  return (
    <textarea {...props} className={className} aria-label={label} disabled={disabled} value={value}
      onChange={(event) => session.update(target, property, toChanges(event.target.value))}
      onBlur={session.finish}
      onKeyDown={(event) => {
        if (event.key === "Escape" && session.cancel()) { event.preventDefault(); event.stopPropagation(); event.currentTarget.blur(); }
      }} />
  );
}

/* A small grey label above a field or a row of fields, as in Figma's panel. */
export function FieldLabel({ children }) {
  return <span className="editor-inspector-label">{children}</span>;
}

/* A borderless icon button for row and section actions (show/hide, add, remove). */
export function IconAction({ icon: Icon, label, onClick, disabled, pressed, className = "" }) {
  return (
    <button type="button" className={`editor-inspector-icon ${className}`} aria-label={label} title={label} disabled={disabled}
      aria-pressed={pressed} onClick={onClick}>
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}
