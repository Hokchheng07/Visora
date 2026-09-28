import { ArrowLeftRight, Check, Minus, Plus } from "lucide-react";
import { defaultGradient, gradientCss, MAX_STOPS, normalizeAngle, normalizeGradient } from "../model/shapePaint.js";
import { DEFAULT_SWATCHES } from "./colourPalette.js";
import { Segmented, SliderNumber, ToolPopover } from "./EditorControls.jsx";

const HEX = /^#[0-9A-F]{6}$/i;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const safeColour = (value, fallback = "#29243A") => (HEX.test(String(value || "")) ? String(value) : fallback);

/*
 * The shared solid/gradient picker used by both canvas backgrounds and text.
 * `onChange` receives the editor's normal paint pair: a solid fallback plus a
 * normalized gradient (or null). The toolbar chip previews gradient colours
 * diagonally so a white first stop cannot look like a clipped cap at 22px;
 * the large preview below always keeps the authored angle.
 */
export default function GradientColourMenu({
  label,
  heading,
  description,
  solid: rawSolid,
  gradient: rawGradient,
  gradientTo = "#705AE0",
  named = false,
  disabled,
  onChange,
}) {
  const gradient = normalizeGradient(rawGradient);
  const solid = safeColour(rawSolid, gradient?.stops?.[0]?.color);
  const paintCss = gradient ? gradientCss(gradient) : solid;
  const chipCss = gradient ? gradientCss({ ...gradient, angle: 45 }) : solid;

  const commitSolid = (fill) => onChange({ fill: safeColour(fill), gradient: null });
  const commitGradient = (paint) => {
    const next = normalizeGradient(paint) || defaultGradient(solid, gradientTo);
    onChange({ fill: next.stops[0].color, gradient: next });
  };
  const withGradient = (changes) => normalizeGradient({ ...gradient, ...changes });
  const withStops = (stops) => withGradient({ stops });

  function setStop(index, changes) {
    commitGradient(withStops(gradient.stops.map((stop, at) => (at === index ? { ...stop, ...changes } : stop))));
  }

  function addStop() {
    let at = 1, widest = -1;
    gradient.stops.forEach((stop, index) => {
      if (!index) return;
      const gap = stop.offset - gradient.stops[index - 1].offset;
      if (gap > widest) { widest = gap; at = index; }
    });
    const before = gradient.stops[at - 1], after = gradient.stops[at];
    commitGradient(withStops([...gradient.stops, {
      offset: (before.offset + after.offset) / 2,
      color: after.color,
      opacity: (before.opacity + after.opacity) / 2,
    }]));
  }

  return (
    <ToolPopover label={label} disabled={disabled} panelClassName="editor-gradient-colour-popover"
      trigger={<>
        <span className="editor-ctl-swatch" style={{ background: chipCss }} aria-hidden="true" />
        {named && <span className="editor-ctl-text">{label}</span>}
      </>}>
      <div className="editor-gradient-colour-head">
        <div><p className="editor-popover-title">{heading}</p><p>{description}</p></div>
        <span className="editor-gradient-colour-mini" style={{ background: paintCss }} aria-hidden="true" />
      </div>

      <Segmented label={`${label} type`} hideLabel value={gradient ? "GRADIENT" : "COLOR"} disabled={disabled}
        options={[{ value: "COLOR", label: "Solid" }, { value: "GRADIENT", label: "Gradient" }]}
        onChange={(type) => type === "GRADIENT"
          ? commitGradient(defaultGradient(solid, gradientTo))
          : commitSolid(gradient?.stops[0].color || solid)} />

      {!gradient ? (
        <>
          <div className="editor-swatch-grid">
            {DEFAULT_SWATCHES.map((colour) => (
              <button type="button" key={colour} className="editor-swatch" style={{ background: colour }}
                aria-label={`Set ${label.toLowerCase()} to ${colour}`} aria-pressed={solid.toLowerCase() === colour.toLowerCase()}
                onClick={() => commitSolid(colour)}>
                {solid.toLowerCase() === colour.toLowerCase() && <Check size={13} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <label className="editor-gradient-colour-custom">
            <span>Custom colour</span>
            <span className="editor-gradient-colour-custom-field">
              <input type="color" value={solid} disabled={disabled} aria-label={`Custom ${label.toLowerCase()}`}
                onChange={(event) => commitSolid(event.target.value)} />
              <code>{solid.toUpperCase()}</code>
            </span>
          </label>
        </>
      ) : (
        <>
          <span className="editor-gradient-colour-preview" style={{ background: gradientCss(gradient) }} aria-hidden="true" />
          <div className="editor-gradient-colour-angle">
            <SliderNumber label="Angle" value={gradient.angle} min={0} max={359} suffix="°" disabled={disabled}
              onChange={(angle) => commitGradient(withGradient({ angle: normalizeAngle(angle) }))} />
            <button type="button" className="editor-gradient-colour-icon" title="Reverse gradient" aria-label="Reverse gradient"
              disabled={disabled} onClick={() => commitGradient(withStops(gradient.stops.map((stop) => ({
                ...stop, offset: Math.round((1 - stop.offset) * 1e4) / 1e4,
              })).reverse()))}>
              <ArrowLeftRight size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="editor-gradient-colour-heading">
            <span>Colour stops</span>
            <button type="button" disabled={disabled || gradient.stops.length >= MAX_STOPS}
              onClick={addStop} aria-label={gradient.stops.length >= MAX_STOPS ? `Maximum ${MAX_STOPS} stops` : "Add gradient stop"}>
              <Plus size={14} aria-hidden="true" /> Add stop
            </button>
          </div>
          <div className="editor-gradient-colour-stops">
            {gradient.stops.map((stop, index) => (
              <div className="editor-gradient-colour-stop" key={`${index}-${stop.offset}`}>
                <input className="editor-gradient-colour-stop-swatch" type="color" value={stop.color} disabled={disabled}
                  aria-label={`Stop ${index + 1} colour`} onChange={(event) => setStop(index, { color: event.target.value })} />
                <span className="editor-gradient-colour-stop-name">{stop.color.toUpperCase()}</span>
                <label><span className="sr-only">Stop {index + 1} position</span>
                  <input type="number" min="0" max="100" step="1" value={Math.round(stop.offset * 100)} disabled={disabled}
                    aria-label={`Stop ${index + 1} position`} onChange={(event) => setStop(index, { offset: clamp(event.target.value, 0, 100) / 100 })} />
                  <small>%</small>
                </label>
                <button type="button" className="editor-gradient-colour-remove" disabled={disabled || gradient.stops.length <= 2}
                  aria-label={`Remove stop ${index + 1}`} onClick={() => commitGradient(withStops(gradient.stops.filter((_stop, at) => at !== index)))}>
                  <Minus size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </ToolPopover>
  );
}
