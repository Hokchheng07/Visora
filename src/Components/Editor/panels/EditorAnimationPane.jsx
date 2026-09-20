import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Play, Square, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook.js";
import { animationChanged, animationMoved, animationRemoved, elementSelected, pageTransitionChanged, targetChanged } from "../../redux/editorSlice.js";
import { buildSteps, rowVisible, timingBounds, validateTimeline } from "../animation/animationTimeline.js";
import { presetLabel, transitionPresets } from "../animation/animationPresets.js";
import { effectiveLocked, layerLabel } from "../model/layerModel.js";
import { useEditSession } from "../inspector/inspectorEdit.js";

function TimingField({ label, value, property, target, toChanges, min = 0, max = 60000, disabled, onBeforeEdit }) {
  const dispatch = useAppDispatch(), session = useEditSession();
  return <label className="editor-animation-timing"><span>{label}<small>seconds</small></span>
    <div><input type="range" aria-label={`${label} slider`} min={min} max={max} step={10} value={value} disabled={disabled}
      onPointerDown={() => { onBeforeEdit?.(); session.begin(target, property); }}
      onChange={(event) => { onBeforeEdit?.(); session.update(target, property, toChanges(Number(event.target.value))); }}
      onKeyUp={session.finish} onBlur={session.finish} onKeyDown={(event) => { if (event.key === "Escape") session.cancel(); }} />
      <input type="number" aria-label={label} min={min / 1000} max={max / 1000} step="0.01" value={Number((value / 1000).toFixed(3))} disabled={disabled}
        onChange={(event) => { onBeforeEdit?.(); const n = Number(event.target.value) * 1000; if (Number.isFinite(n) && n >= min && n <= max) dispatch(targetChanged({ target, changes: toChanges(Math.round(n)) })); }} /></div>
  </label>;
}

export default function EditorAnimationPane({ docked, onClose, previewing, onPreview, onStopPreview }) {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedIds, gesture } = useAppSelector((state) => state.editor);
  const page = pages[currentPage], rows = page.animations || [], steps = buildSteps(page);
  const [chosen, setChosen] = useState(null), [message, setMessage] = useState("");
  const selected = rows.find((row) => row.id === chosen && selectedIds.includes(row.elementId)) || rows.find((row) => selectedIds.includes(row.elementId));
  const element = selected && page.elements.find((item) => item.id === selected.elementId);
  const chosenElements = page.elements.filter((item) => selectedIds.includes(item.id));
  const selectionRows = rows.filter((row) => selectedIds.includes(row.elementId));
  const busy = !!gesture || (element && effectiveLocked(page, element));
  const bounds = useMemo(() => selected ? { delayMs: timingBounds(page, selected.id, "delayMs"), durationMs: timingBounds(page, selected.id, "durationMs") } : null, [page, selected]);
  const target = selected && { kind: "animation", pageId: page.id, rowId: selected.id };
  const pageTarget = { kind: "page", pageId: page.id };
  function move(id, to) {
    onStopPreview(); const next = [...rows], from = rows.findIndex((row) => row.id === id);
    if (from < 0) return;
    const [row] = next.splice(from, 1); next.splice(to, 0, row);
    if (validateTimeline({ ...page, animations: next }).length) { setMessage("That move would overlap animations or put them out of order."); return; }
    setMessage(""); dispatch(animationMoved({ id, to }));
  }
  function change(changes) {
    onStopPreview();
    if (validateTimeline({ ...page, animations: rows.map((row) => row.id === selected.id ? { ...row, ...changes } : row) }).length) {
      setMessage("That timing would overlap animations or put them out of order."); return;
    }
    setMessage(""); dispatch(animationChanged({ id: selected.id, changes }));
  }
  return <aside className={`editor-inspector editor-animation-pane ${docked ? "is-docked" : "is-drawer"}`} aria-label="Animation settings">
    <header className="editor-inspector-head"><h2>Animate</h2>{!docked && <button type="button" aria-label="Close animation settings" onClick={onClose}><X size={18} /></button>}</header>
    <section className="editor-animation-section"><h3>Page transition</h3>
      <select aria-label="Page transition" disabled={!!gesture} value={page.transition?.preset || "none"} onChange={(event) => { onStopPreview(); dispatch(pageTransitionChanged({ ...page.transition, preset: event.target.value })); }}>
        {transitionPresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.id === "none" ? "None" : preset.label}</option>)}
      </select>
      {page.transition && ["durationMs", "delayMs"].map((property) => <TimingField key={property} label={`Transition ${property === "delayMs" ? "delay" : "duration"}`} value={page.transition[property]} property={property} target={pageTarget}
        disabled={!!gesture} onBeforeEdit={onStopPreview} toChanges={(value) => ({ transition: { ...page.transition, [property]: value } })} />)}
      <p className="editor-panel-description">Slides advance when you click Next.</p>
    </section>
    {/* What the panel is talking about. Without it, "Pick an element" reads as
        "nothing is selected" even when something is. */}
    <section className="editor-animation-section editor-animation-selection" aria-label="Selection">
      <h3>Selected</h3>
      {chosenElements.length === 0 && <p className="editor-panel-empty">Nothing selected. Click an element on the canvas.</p>}
      {chosenElements.length === 1 && <div className="editor-animation-selected">
        <strong>{layerLabel(chosenElements[0])}</strong>
        <small>{selectionRows.length ? `${selectionRows.length} animation${selectionRows.length === 1 ? "" : "s"}` : "No animation yet"}</small>
      </div>}
      {chosenElements.length > 1 && <div className="editor-animation-selected">
        <strong>{chosenElements.length} elements selected</strong>
        <small>{selectionRows.length ? `${selectionRows.length} animation${selectionRows.length === 1 ? "" : "s"} between them` : "No animations yet"}</small>
      </div>}
    </section>
    <section className="editor-animation-section"><div className="editor-animation-section-title"><h3>Animation order</h3>
      <button type="button" className="editor-animation-preview-toggle" disabled={!!gesture} onClick={previewing ? onStopPreview : onPreview}>{previewing ? <Square size={14} /> : <Play size={14} />}{previewing ? "Stop" : "Preview"}</button></div>
      {/* This list is per element, so the empty line talks about the selection,
          never about the page. */}
      {!rows.length && <p className="editor-panel-empty">{chosenElements.length > 1
        ? "These elements have no entrance or exit animation yet. Choose one in the Animate panel on the left."
        : chosenElements.length
          ? "This element has no entrance or exit animation yet. Choose one in the Animate panel on the left."
          : "Pick an element, then choose an animation."}</p>}
      {steps.filter((step) => step.rows.length).map((step) => <div key={step.index} className="editor-animation-step"><h4>{step.index ? `Click ${step.index}` : "On entry"}</h4>
        <ol>{step.rows.map((row) => {
          const item = page.elements.find((e) => e.id === row.elementId), index = rows.findIndex((r) => r.id === row.id), locked = item && effectiveLocked(page, item);
          return <li key={row.id} className={`${selectedIds.includes(row.elementId) ? "is-highlighted" : ""} ${selected?.id === row.id ? "is-active" : ""} ${rowVisible(page, row) ? "" : "is-hidden"}`}
            draggable={!locked && !gesture} onDragStart={(event) => { onStopPreview(); event.dataTransfer.setData("text/visora-animation", row.id); }} onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); move(event.dataTransfer.getData("text/visora-animation"), index); }}>
            <button type="button" className="editor-animation-row" aria-label={`${row.kind} ${item ? layerLabel(item) : "Missing element"} ${presetLabel(row)}`} aria-pressed={selected?.id === row.id} onClick={() => { setChosen(row.id); dispatch(elementSelected(row.elementId)); }}>
              <span className={`editor-animation-badge is-${row.kind}`}>{row.kind}</span><strong>{item ? layerLabel(item) : "Missing element"}</strong><small>{presetLabel(row)} · {(row.start / 1000).toFixed(2)}s{!rowVisible(page, row) ? " · Hidden" : ""}</small>
            </button>
            <span className="editor-animation-reorder"><button type="button" aria-label={`Move ${presetLabel(row)} up`} disabled={!!gesture || locked || !index} onClick={() => move(row.id, index - 1)}><ArrowUp size={13} /></button>
              <button type="button" aria-label={`Move ${presetLabel(row)} down`} disabled={!!gesture || locked || index === rows.length - 1} onClick={() => move(row.id, index + 1)}><ArrowDown size={13} /></button></span>
          </li>;
        })}</ol></div>)}
      {message && <p role="status" className="editor-animation-message">{message}</p>}
    </section>
    {selected && <section className="editor-animation-section"><h3>{presetLabel(selected)}</h3>
      <label className="editor-animation-trigger">Start<select aria-label="Animation trigger" disabled={busy} value={selected.trigger} onChange={(event) => change({ trigger: event.target.value })}>
        <option value="click">On click</option><option value="with">With previous</option><option value="after">After previous</option>
      </select></label>
      {["delayMs", "durationMs"].map((property) => <TimingField key={property} label={`Animation ${property === "delayMs" ? "delay" : "duration"}`} value={selected[property]} property={property}
        target={target} {...bounds[property]} disabled={busy} onBeforeEdit={onStopPreview} toChanges={(value) => ({ [property]: value })} />)}
      <button type="button" className="editor-animation-remove" disabled={busy} onClick={() => { onStopPreview(); dispatch(animationRemoved(selected.id)); }}><Trash2 size={14} />Remove animation</button>
    </section>}
  </aside>;
}
