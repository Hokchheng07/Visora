import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";

/*
 * The toolbar vocabulary. Everything in the property bar, the context menu and
 * the object bubble is built from these six, which is what stops the editor
 * looking like a collection of separately-styled widgets.
 *
 * Headless UI carries the parts that hand-rolled popovers get wrong — focus
 * return to the trigger on close, aria-expanded, and flip-to-stay-in-viewport
 * via the `anchor` prop. It ships unstyled, so the hand-written CSS in
 * editor.css stays in charge of how any of it looks.
 */

/* 1. Icon button. The tooltip carries the name and the shortcut, because the
      bar has no room for either and this is where people learn them. */
export function IconButton({ icon: Icon, label, shortcut, active, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`editor-ctl editor-ctl-icon${active ? " is-on" : ""} ${className}`}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : !!active}
      title={shortcut ? `${label} (${shortcut})` : label}
      {...props}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}

/* 2. Split stepper. The middle is a real input: typing 72 beats clicking + 24
      times, and arrow keys step it without leaving the keyboard. */
export function Stepper({ value, min = 1, max = 999, step = 1, onChange, label, disabled }) {
  const clamp = (next) => Math.max(min, Math.min(max, Math.round(next)));
  return (
    <div className="editor-ctl editor-ctl-stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - step))}>&minus;</button>
      <input type="text" inputMode="numeric" aria-label={label} value={Math.round(value)} disabled={disabled}
        onChange={(event) => { const next = Number(event.target.value.replace(/[^0-9.]/g, "")); if (!Number.isNaN(next)) onChange(clamp(next)); }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          const jump = (event.shiftKey ? 10 : 1) * (event.key === "ArrowUp" ? 1 : -1);
          onChange(clamp(value + jump));
        }} />
      <button type="button" aria-label={`Increase ${label}`} disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + step))}>+</button>
    </div>
  );
}

/* 3. Popover. One wrapper so every panel in the editor opens, closes, flips and
      returns focus the same way. */
export function ToolPopover({ label, disabled, children, trigger, className = "", panelClassName = "" }) {
  return (
    <Popover className="editor-ctl-popover-root">
      <PopoverButton as="button" type="button" disabled={disabled}
        className={`editor-ctl editor-ctl-trigger ${className}`} aria-label={label} title={label}>
        {trigger}
        <ChevronDown size={12} className="editor-ctl-caret" aria-hidden="true" />
      </PopoverButton>
      <PopoverPanel anchor={{ to: "bottom start", gap: 8, padding: 12 }}
        className={`editor-popover ${panelClassName}`}>
        {children}
      </PopoverPanel>
    </Popover>
  );
}

/* 4. Swatch button. Replaces <input type="color">, whose OS picker drops the
      user out of Visora entirely. Custom is still reachable, just not first. */
const DEFAULT_SWATCHES = [
  "#705AE0", "#A78DFF", "#DA4EC9", "#FFC21C", "#72BFF1", "#2F7A55", "#C4443E", "#F07A2B",
  "#FFFFFF", "#F2F1F6", "#C9C6D4", "#8C8799", "#4A4460", "#29243A", "#15131D", "#000000",
];

export function SwatchButton({ value, onChange, label = "Colour", disabled, named = false, swatches = DEFAULT_SWATCHES }) {
  return (
    <ToolPopover label={label} disabled={disabled} panelClassName="editor-popover-swatches"
      trigger={<>
        <span className="editor-ctl-swatch" style={{ background: value }} aria-hidden="true" />
        {named && <span className="editor-ctl-text">{label}</span>}
      </>}>
      <p className="editor-popover-title">Document colours</p>
      <div className="editor-swatch-grid">
        {swatches.map((colour) => (
          <button type="button" key={colour} className="editor-swatch" style={{ background: colour }}
            aria-label={colour} aria-pressed={value?.toLowerCase() === colour.toLowerCase()}
            onClick={() => onChange(colour)}>
            {value?.toLowerCase() === colour.toLowerCase() && <Check size={13} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <label className="editor-popover-custom">
        <span>Custom</span>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={`Custom ${label.toLowerCase()}`} />
      </label>
    </ToolPopover>
  );
}

/* 5. Slider + number, always as a pair. The slider is for feel, the number for
      precision; neither on its own is enough to set line spacing with. */
export function SliderNumber({ label, value, min, max, step = 1, suffix = "", onChange, disabled }) {
  return (
    <div className="editor-field">
      <div className="editor-field-head">
        <span>{label}</span>
        <input type="text" inputMode="decimal" aria-label={label} disabled={disabled}
          value={`${Number(value.toFixed(2))}${suffix}`}
          onChange={(event) => {
            const next = Number(event.target.value.replace(/[^0-9.-]/g, ""));
            if (!Number.isNaN(next)) onChange(Math.max(min, Math.min(max, next)));
          }} />
      </div>
      <input className="editor-slider" type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        aria-label={label} onChange={(event) => onChange(event.target.valueAsNumber)} />
    </div>
  );
}

/* 6. Segmented control, for two to four exclusive options. Past four it should
      become a menu — a row of six segments is unreadable at this size. */
export function Segmented({ label, value, options, onChange, disabled }) {
  return (
    <div className="editor-field">
      {label && <div className="editor-field-head"><span>{label}</span></div>}
      <div className="editor-segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button type="button" key={option.value} disabled={disabled}
            className={option.value === value ? "is-on" : ""} aria-pressed={option.value === value}
            title={option.label} onClick={() => onChange(option.value)}>
            {option.icon ? <option.icon size={15} aria-hidden="true" /> : option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Menu row. One height for every row, shortcut right-aligned. Disabled rows
   stay visible so the menu does not change height between elements. */
export function MenuRow({ icon: Icon, label, shortcut, danger, disabled, onSelect }) {
  return (
    <button type="button" className={`editor-menu-row${danger ? " is-danger" : ""}`} disabled={disabled}
      onClick={onSelect}>
      {Icon ? <Icon size={16} aria-hidden="true" /> : <span className="editor-menu-gap" aria-hidden="true" />}
      <span>{label}</span>
      {shortcut && <kbd>{shortcut}</kbd>}
    </button>
  );
}

export function MenuDivider() {
  return <hr className="editor-menu-divider" />;
}
