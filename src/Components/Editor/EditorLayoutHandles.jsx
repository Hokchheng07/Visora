import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { clampWidth, INSPECTOR_WIDTH, saveInspectorWidth } from "./inspectorWidth.js";

/*
 * The two handles on the editor's side columns.
 *
 * PanelToggle sits on the right edge of the tool panel, on its middle, like
 * Canva's: it collapses the panel and, once collapsed, sits by the rail to open
 * it again. ⌘/ (Ctrl+/ elsewhere) does the same from anywhere in the editor.
 *
 * InspectorResizer is the left edge of the Customize column. Drag it, or focus
 * it and use the arrow keys; double-click puts the default width back.
 */

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const PANEL_SHORTCUT = isMac ? ["⌘", "/"] : ["Ctrl", "/"];

export function PanelToggle({ open, onToggle, controls }) {
  const label = open ? "Collapse" : "Expand";
  return (
    <button type="button" className={`editor-panel-toggle${open ? "" : " is-collapsed"}`} aria-label={`${label} panel`}
      aria-expanded={open} aria-controls={controls} aria-keyshortcuts={isMac ? "Meta+/" : "Control+/"} onClick={onToggle}>
      <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
      <span className="editor-panel-toggle-tip" aria-hidden="true">
        {label}{PANEL_SHORTCUT.map((key) => <kbd key={key}>{key}</kbd>)}
      </span>
    </button>
  );
}

export function InspectorResizer({ width, onResize, onResizing }) {
  const drag = useRef(null);
  const [active, setActive] = useState(false);
  const set = (next) => { const value = clampWidth(next); onResize(value); return value; };
  function end(event) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    saveInspectorWidth(drag.current.width);
    drag.current = null; setActive(false); onResizing?.(false);
  }
  return (
    <div role="separator" tabIndex={0} aria-orientation="vertical" aria-label="Resize Customize panel"
      aria-valuemin={INSPECTOR_WIDTH.min} aria-valuemax={INSPECTOR_WIDTH.max} aria-valuenow={width}
      title="Drag to resize · double-click to reset" className={`editor-inspector-resizer${active ? " is-active" : ""}`}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { pointerId: event.pointerId, x: event.clientX, start: width, width };
        setActive(true); onResizing?.(true);
      }}
      // The column grows leftwards, so moving the pointer left widens it.
      onPointerMove={(event) => { if (drag.current?.pointerId === event.pointerId) drag.current.width = set(drag.current.start + drag.current.x - event.clientX); }}
      onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
      onDoubleClick={() => saveInspectorWidth(set(INSPECTOR_WIDTH.initial))}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 48 : 16;
        const next = { ArrowLeft: width + step, ArrowRight: width - step, Home: INSPECTOR_WIDTH.max, End: INSPECTOR_WIDTH.min }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        saveInspectorWidth(set(next));
      }} />
  );
}
