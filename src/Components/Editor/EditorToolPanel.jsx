import { Image, Search, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import { editorSidebarItems } from "./editorSidebarConfig";
import { shapeCatalog } from "./shapeCatalog.js";
import { usePanelDragInsert } from "./usePanelDragInsert.js";
import EditorLayersPanel from "./EditorLayersPanel.jsx";
import { ShapeArtwork } from "./EditorElement.jsx";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementChanged, pageAnimationChanged, textInserted } from "../redux/editorSlice.js";
import { animationPresets, compileAnimation } from "./animationPresets.js";

// Templates stay placeholders until the template API is connected.
function TemplatesPanel() {
  return (
    <>
      <div className="editor-panel-search" aria-label="Template search (coming soon)">
        <Search size={16} aria-hidden="true" />
        <input type="search" aria-label="Search templates" placeholder="Search templates…" disabled />
      </div>
      <div className="editor-categories" aria-label="Template categories">
        {["All", "Graduation", "Seminar", "Event"].map((label, index) => (
          <button type="button" disabled key={label} className={index === 0 ? "is-active" : ""}>{label}</button>
        ))}
      </div>
      <div className="editor-template-list" aria-label="Template placeholders">
        {[0, 1, 2, 3].map((index) => (
          <div className={`editor-template-placeholder editor-template-tone-${index % 3}`} key={index} role="img" aria-label={`Template preview placeholder ${index + 1}`}>
            <div className="editor-template-paper" aria-hidden="true">
              <span className="editor-template-orbit" />
              <Image size={25} strokeWidth={1.25} />
              <span className="editor-placeholder-line" />
              <span className="editor-placeholder-line short" />
              <Sparkles className="editor-template-spark" size={20} strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>
      <button type="button" disabled className="editor-view-more">View more templates</button>
    </>
  );
}

function ShapeTile({ shape }) {
  const { events, ghost } = usePanelDragInsert(shape.id);
  return <>
    <button type="button" className="editor-shape-tile" aria-label={`Add ${shape.label.toLowerCase()}`} title={`${shape.label} · click or drag onto the page`} {...events}>
      <span className="editor-shape" aria-hidden="true"><ShapeArtwork element={{ type: "shape", shape: shape.id, fill: "#ad8dea", opacity: 1 }} /></span>
      <span className="editor-shape-label">{shape.label}</span>
    </button>
    {ghost && createPortal(<div className="editor-shape-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">
      <ShapeArtwork element={{ type: "shape", shape: shape.id, fill: "#ad8dea", opacity: 1 }} />
    </div>, document.body)}
  </>;
}

function ShapePreviews({ query: controlledQuery, onQueryChange, showSearch = true }) {
  const [localQuery, setLocalQuery] = useState("");
  const query = controlledQuery ?? localQuery;
  const setQuery = onQueryChange || setLocalQuery;
  const filtered = shapeCatalog.filter((shape) => `${shape.label} ${shape.category}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <>{showSearch && <div className="editor-panel-search"><Search size={16} aria-hidden="true" /><input aria-label="Search shapes" placeholder="Search shapes…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>}
      <div className="editor-shape-grid" aria-label="Shape previews">{filtered.map((shape) => <ShapeTile key={shape.id} shape={shape} />)}</div></>
  );
}

function ElementsPanel() {
  const [query, setQuery] = useState("");
  const graphics = [
    { name: "Sparkle", glyph: "✦" },
    { name: "Flourish", glyph: "↝" },
    { name: "Flower", glyph: "❀" },
    { name: "Heart", glyph: "♡" },
  ].filter((graphic) => graphic.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <div className="editor-panel-search"><Search size={16} aria-hidden="true" /><input aria-label="Search elements" placeholder="Search elements…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <h3 className="editor-panel-subtitle">Graphics</h3>
      <div className="editor-graphic-grid" aria-label="Graphic previews">
        {graphics.map(({ name, glyph }) => <span key={name} role="img" aria-label={name} title={name}>{glyph}</span>)}
      </div>
      {!graphics.length && <p className="editor-panel-empty">No elements match “{query}”.</p>}
    </>
  );
}

function TextPanel() {
  const dispatch = useAppDispatch();
  return (
    <div className="editor-text-options">
      <button type="button" className="editor-panel-primary" onClick={() => dispatch(textInserted("body"))}>Add a text box</button>
      <h3 className="editor-panel-subtitle">Default text styles</h3>
      <button type="button" className="editor-text-heading" onClick={() => dispatch(textInserted("heading"))}>Add a heading</button>
      <button type="button" className="editor-text-subheading" onClick={() => dispatch(textInserted("subheading"))}>Add a subheading</button>
      <button type="button" onClick={() => dispatch(textInserted("body"))}>Add body text</button>
    </div>
  );
}

function UploadPanel() {
  return (
    <>
      <button type="button" disabled className="editor-panel-primary"><Upload size={17} aria-hidden="true" />Upload an image</button>
      <div className="editor-empty-state">
        <span className="editor-empty-icon"><Image size={28} strokeWidth={1.4} aria-hidden="true" /></span>
        <h3>Make it your own</h3>
        <p>Your uploaded images will appear here.</p>
      </div>
    </>
  );
}

function TimerPanel() {
  return (
    <>
      <p className="editor-panel-description">A countdown for every occasion.</p>
      <div className="editor-timer-preview"><span>00 : 00 : 00</span><small>HOURS <span>MINUTES</span> SECONDS</small></div>
      <div className="editor-timer-preview light"><span>00:00</span><small>MINUTES & SECONDS</small></div>
      <button type="button" disabled className="editor-panel-primary">Add a timer</button>
    </>
  );
}

function AnimationPreview({ preset, active, disabled, onChoose }) {
  const demoRef = useRef(null), runningRef = useRef(null); const reduceMotion = useReducedMotion();
  function stop() { runningRef.current?.revert(); runningRef.current = null; }
  function play() {
    stop(); if (!demoRef.current || preset.id === "none") return;
    const params = compileAnimation({ preset: preset.id, duration: 620 }, reduceMotion);
    runningRef.current = animate(demoRef.current, params);
  }
  useEffect(() => stop, []);
  return <button type="button" className={`editor-animation-preview${active ? " is-active" : ""}`} disabled={disabled}
    aria-pressed={active} onPointerEnter={(event) => { if (event.pointerType !== "touch") play(); }} onPointerLeave={stop}
    onFocus={play} onBlur={stop} onClick={() => { play(); onChoose(preset.id); }}>
    <span className="editor-animation-stage" aria-hidden="true"><span ref={demoRef} className="editor-animation-demo"><i /><i /><i /></span></span>
    <span>{preset.label}</span>
  </button>;
}

function AnimationsPanel() {
  const dispatch = useAppDispatch(); const [mode, setMode] = useState("page");
  const { pages, currentPage, selectedId, selectedIds } = useAppSelector((state) => state.editor);
  const page = pages[currentPage]; const element = page.elements.find((item) => item.id === selectedId);
  const currentPreset = mode === "page" ? page.animation?.preset || "none" : element?.animation?.preset || "none";
  const presets = mode === "page" ? animationPresets.filter((preset) => preset.id !== "pulse") : animationPresets;
  function choose(preset) {
    if (mode === "page") dispatch(pageAnimationChanged(preset));
    else if (selectedIds.length) dispatch(elementChanged({ animation: preset === "none" ? undefined : { preset } }));
  }
  return <>
    <div className="editor-animation-modes" role="tablist" aria-label="Animation target">
      <button type="button" role="tab" aria-selected={mode === "page"} onClick={() => setMode("page")}>Page</button>
      <button type="button" role="tab" aria-selected={mode === "element"} onClick={() => setMode("element")}>Element</button>
    </div>
    <p className="editor-panel-description">{mode === "page" ? `Animate page ${currentPage + 1} when it appears.` : selectedIds.length ? `Animate ${selectedIds.length === 1 ? "the selected element" : `${selectedIds.length} selected elements`}.` : "Select an element on the canvas first."}</p>
    <div className="editor-animation-grid" aria-label={`${mode} animation presets`}>
      {presets.map((preset) => <AnimationPreview key={preset.id} preset={preset} active={preset.id === currentPreset}
        disabled={mode === "element" && !selectedIds.length} onChoose={choose} />)}
    </div>
  </>;
}

export default function EditorToolPanel({ activeTool, isOpen = true, ref }) {
  const activeItem = editorSidebarItems.find((item) => item.id === activeTool);
  return (
    <aside
      ref={ref}
      className={`editor-tool-panel${isOpen ? "" : " is-collapsed"}`}
      id={`editor-panel-${activeTool}`}
      role="tabpanel"
      aria-labelledby={`editor-tab-${activeTool}`}
      tabIndex={isOpen ? 0 : -1}
      inert={!isOpen}
    >
      <h2>{activeItem?.label}</h2>
      {activeTool === "templates" && <TemplatesPanel />}
      {activeTool === "elements" && <ElementsPanel />}
      {activeTool === "text" && <TextPanel />}
      {activeTool === "images" && <UploadPanel />}
      {activeTool === "shapes" && <><p className="editor-panel-description editor-shapes-hint">Click to add, or drag onto your page.</p><ShapePreviews /></>}
      {activeTool === "animations" && <AnimationsPanel />}
      {activeTool === "timer" && <TimerPanel />}
      {activeTool === "layers" && <EditorLayersPanel />}
    </aside>
  );
}
