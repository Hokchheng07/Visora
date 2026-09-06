import { Image, Search, Sparkles, Upload } from "lucide-react";
import { createPortal } from "react-dom";
import { editorSidebarItems } from "./editorSidebarConfig";
import { shapeCatalog } from "./shapeCatalog.js";
import { usePanelDragInsert } from "./usePanelDragInsert.js";
import EditorLayersPanel from "./EditorLayersPanel.jsx";

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
      <span className={`editor-shape editor-shape-${shape.id}`} aria-hidden="true" />
      <span className="editor-shape-label">{shape.label}</span>
    </button>
    {ghost && createPortal(<div className="editor-shape-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">
      <span className={`editor-ghost-art editor-shape-${shape.id}`} />
    </div>, document.body)}
  </>;
}

function ShapePreviews() {
  return (
    <div className="editor-shape-grid" aria-label="Shape previews">
      {shapeCatalog.map((shape) => <ShapeTile key={shape.id} shape={shape} />)}
    </div>
  );
}

function ElementsPanel() {
  return (
    <>
      <div className="editor-panel-search"><Search size={16} aria-hidden="true" /><input aria-label="Search elements" placeholder="Search elements…" disabled /></div>
      <h3 className="editor-panel-subtitle">Lines & shapes</h3>
      <ShapePreviews />
      <h3 className="editor-panel-subtitle">Graphics</h3>
      <div className="editor-graphic-grid" aria-label="Graphic previews">
        {["✦", "↝", "❀", "♡"].map((glyph, index) => <span key={index} aria-hidden="true">{glyph}</span>)}
      </div>
    </>
  );
}

function TextPanel() {
  return (
    <div className="editor-text-options">
      <button type="button" disabled className="editor-panel-primary">Add a text box</button>
      <h3 className="editor-panel-subtitle">Default text styles</h3>
      <button type="button" disabled className="editor-text-heading">Add a heading</button>
      <button type="button" disabled className="editor-text-subheading">Add a subheading</button>
      <button type="button" disabled>Add body text</button>
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
      {activeTool === "timer" && <TimerPanel />}
      {activeTool === "layers" && <EditorLayersPanel />}
    </aside>
  );
}
