import { ChevronLeft, Image, ImageOff, Loader2, Search, Sparkles, Upload, X } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { useReducedMotion } from "motion/react";
import { editorSidebarItems } from "../shell/editorSidebarConfig";
import { shapeCatalog } from "../model/shapeCatalog.js";
import { usePanelDragInsert } from "./usePanelDragInsert.js";
import EditorLayersPanel from "./EditorLayersPanel.jsx";
import { IMAGE_TYPES, useImageUpload } from "./useImageUpload.js";
import { useUploadHistory, withDocumentImages } from "./uploadHistory.js";
import { getStorageUrl } from "../../API/storageApi";
import { useCurrentUser } from "../../Account/useCurrentUser";
import { ShapeArtwork } from "../canvas/EditorElement.jsx";
import TimerArtwork from "../timer/TimerArtwork.jsx";
import { defaultTimer } from "../model/editorDocument.js";
import { DEFAULT_EDITOR_TEXT_COLOR } from "../model/editorDefaults.js";
import { KHMER_ELEMENTS, khmerGroups, khmerSections, librarySrc } from "../model/khmerElements.js";
import { useAppDispatch, useAppSelector } from "../../redux/hook.js";
import { animationAdded, imageInserted, pageTransitionChanged, textInserted, timerInserted } from "../../redux/editorSlice.js";
import { presetLabel, transitionPresets } from "../animation/animationPresets.js";
import { ballDemo } from "../animation/animationBallDemo.js";
import { insertionRows, PRESETS, removeAnimationRows, validateTimeline } from "../animation/animationTimeline.js";
import { effectiveLocked } from "../model/layerModel.js";

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

/* One element tile. The tile's own picture reports the element's proportions,
   so a new element needs no size written down beside its file. */
function LibraryTile({ item, onAdd }) {
  return (
    <button type="button" className={`editor-khmer-tile${item.wide ? " is-wide" : ""}`}
      title={item.name} aria-label={`Add ${item.label}`}
      onClick={(event) => onAdd(item, event.currentTarget.querySelector("img"))}>
      <img src={item.src} alt="" loading="lazy" draggable={false} />
    </button>
  );
}

/* The Elements panel opens on its groups — Khmer elements, Graphics — and a
   click enters one. Searching looks across every group at once, so nothing is
   hidden behind a card. */
function ElementsPanel() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState(null);
  const term = query.trim().toLowerCase();
  const matches = KHMER_ELEMENTS.filter((item) => item.label.toLowerCase().includes(term));
  const groups = khmerGroups(matches);
  const group = groups.find((entry) => entry.id === openGroup);
  const sections = khmerSections(matches, term ? null : group?.id);

  /* The tile's picture reports the element's proportions, so a new element
     needs no size written down beside its file. Tiles load lazily, so a click
     on one that has not finished loading measures the file itself first. */
  const add = (item, picture) => {
    const place = (width, height) => dispatch(imageInserted(librarySrc(item.id), { width, height }, item.name));
    if (picture?.naturalWidth) return place(picture.naturalWidth, picture.naturalHeight);
    const probe = new window.Image();
    probe.onload = () => place(probe.naturalWidth, probe.naturalHeight);
    probe.onerror = () => place(undefined, undefined);
    probe.src = item.src;
    return undefined;
  };

  return (
    <>
      <div className="editor-panel-search"><Search size={16} aria-hidden="true" /><input aria-label="Search elements" placeholder="Search elements…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>

      {!term && !group && (
        <div className="editor-group-grid">
          {groups.map((entry) => (
            <button key={entry.id} type="button" className="editor-group-card" onClick={() => setOpenGroup(entry.id)}>
              <span className={`editor-group-thumb${entry.preview.length === 1 ? " is-single" : ""}`} aria-hidden="true">
                {entry.preview.map((item) => <img key={item.id} src={item.src} alt="" loading="lazy" />)}
              </span>
              <strong>{entry.label}</strong>
              <small>{entry.blurb} · {entry.count}</small>
            </button>
          ))}
        </div>
      )}

      {!term && group && (
        <button type="button" className="editor-group-back" onClick={() => setOpenGroup(null)}>
          <ChevronLeft size={16} aria-hidden="true" /><span>{group.label}</span>
        </button>
      )}

      {(term || group) && sections.map((section) => (
        <section key={section.id}>
          <h3 className="editor-panel-subtitle">{section.label}</h3>
          <div className="editor-khmer-grid">
            {section.items.map((item) => <LibraryTile key={item.id} item={item} onAdd={add} />)}
          </div>
        </section>
      ))}

      {term && !sections.length && <p className="editor-panel-empty">No elements match “{query}”.</p>}
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

// One saved upload. Clicking it puts the picture on the page again without
// uploading it a second time; the small × only forgets it from this list, and
// is not offered while the picture is used on the design.
function UploadTile({ item, onUse, onForget }) {
  const [broken, setBroken] = useState(false);
  const label = item.name || "Uploaded image";
  return (
    <li className="editor-upload-tile">
      <button type="button" className="editor-upload-use" onClick={() => onUse(item)} aria-label={`Add ${label} to the page`} title={label}>
        {broken
          ? <span className="editor-upload-missing"><ImageOff size={20} strokeWidth={1.5} aria-hidden="true" /></span>
          : <img src={getStorageUrl(item.fileName)} alt="" loading="lazy" draggable={false} onError={() => setBroken(true)} />}
      </button>
      {!item.inUse && (
        <button type="button" className="editor-upload-forget" onClick={() => onForget(item.fileName)} aria-label={`Remove ${label} from your uploads`} title="Remove from list">
          <X size={12} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

function UploadPanel() {
  const dispatch = useAppDispatch();
  const inputRef = useRef(null);
  const account = useCurrentUser();
  const pages = useAppSelector((state) => state.editor.pages);
  // one list per account; the username arrives with the profile
  const { uploads, remember, forget } = useUploadHistory(account.user?.username || account.user?.email || "");
  const { uploadImage, isUploading, error } = useImageUpload({ onUploaded: remember });
  const shown = withDocumentImages(uploads, pages);

  // Uploading needs the login token, so a signed-out visitor is sent to sign in.
  if (!account.isSignedIn) {
    return (
      <div className="editor-empty-state">
        <span className="editor-empty-icon"><Image size={28} strokeWidth={1.4} aria-hidden="true" /></span>
        <h3>Sign in to upload</h3>
        <p>Your images are stored in your Visora account.</p>
        <Link to="/auth/login" className="editor-panel-primary editor-upload-signin">Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(",")} hidden
        onChange={(event) => {
          uploadImage(event.target.files?.[0]);
          // clear it, so choosing the same file again still triggers onChange
          event.target.value = "";
        }} />
      <button type="button" className="editor-panel-primary" disabled={isUploading} aria-busy={isUploading}
        onClick={() => inputRef.current?.click()}>
        {isUploading
          ? <><Loader2 size={17} className="editor-spin" aria-hidden="true" />Uploading…</>
          : <><Upload size={17} aria-hidden="true" />Upload an image</>}
      </button>
      {error && <p className="editor-upload-error" role="alert">{error}</p>}
      {shown.length ? (
        <>
          <h3 className="editor-panel-subtitle">Your uploads</h3>
          <ul className="editor-upload-grid" aria-label="Your uploads">
            {shown.map((item) => (
              <UploadTile key={item.fileName} item={item} onForget={forget}
                onUse={(picked) => dispatch(imageInserted(picked.fileName, { width: picked.width, height: picked.height }, picked.name))} />
            ))}
          </ul>
        </>
      ) : (
        <div className="editor-empty-state">
          <span className="editor-empty-icon"><Image size={28} strokeWidth={1.4} aria-hidden="true" /></span>
          <h3>Make it your own</h3>
          <p>PNG, JPG, WebP or GIF, up to 10 MB. Your uploads will appear here.</p>
        </div>
      )}
    </>
  );
}

/* Two tiles, one per kind of timer. Each preview is the real TimerArtwork, so
   the tile shows exactly what a click puts on the page. Nothing is set here:
   format, colours and which buttons show are all in the Customize sidebar once
   the timer is on the page, the way Canva and Figma add first and style after. */
const TIMER_KINDS = [
  { mode: "COUNTDOWN", title: "Countdown", hint: "Counts down to zero, with Start, Pause and Reset" },
  { mode: "STOPWATCH", title: "Stopwatch", hint: "Counts up from zero, with Start/Stop and Reset" },
];

function TimerPreview({ mode }) {
  const element = { id: `preview-${mode}`, type: "timer", w: 900, h: 460, fill: DEFAULT_EDITOR_TEXT_COLOR, opacity: 1, fontFamily: "Poppins", fontSize: 120,
    timer: defaultTimer("HH:MM:SS", {}, mode) };
  // A slice of a 1920px-wide sheet around a 900px timer, so cqw sizes match the canvas.
  return (
    <span className="editor-timer-sample" aria-hidden="true">
      <span className="editor-timer-sample-sheet"><TimerArtwork element={element} /></span>
    </span>
  );
}

function TimerPanel() {
  const dispatch = useAppDispatch();
  return (
    <>
      <p className="editor-panel-description">Pick a timer to add it. Change its colours and buttons in Customize.</p>
      <div className="editor-timer-kinds">
        {TIMER_KINDS.map(({ mode, title, hint }) => (
          <button key={mode} type="button" className="editor-timer-preview" aria-label={`Add a ${title.toLowerCase()}`} title={hint}
            onClick={() => dispatch(timerInserted(mode))}>
            <TimerPreview mode={mode} />
            <span className="editor-timer-kind"><b>{title}</b></span>
          </button>
        ))}
      </div>
    </>
  );
}

function AnimationPreview({ preset, active, disabled, reason, kind, onChoose }) {
  const ballRef = useRef(null), shadowRef = useRef(null), runningRef = useRef([]); const reduceMotion = useReducedMotion();

  /* The start pose is written as plain inline styles rather than through the
     animation library: a zero-length animation there stays alive and keeps
     overriding the real one, which left the ball stuck invisible. The pose
     goes into `transform`, the same property the library animates — CSS
     `scale`/`translate` would sit on top of it and pin the ball in place. */
  function pose(node, frame) {
    const { duration: _duration, ease: _ease, opacity, scaleX = 1, scaleY = 1, translateX = 0, translateY = 0, ...rest } = frame;
    node.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    if (opacity !== undefined) node.style.opacity = opacity;
    Object.entries(rest).forEach(([key, value]) => { node.style[key] = value; });
  }

  function clear(node) {
    if (!node) return;
    node.style.cssText = "";
  }
  function stop() {
    runningRef.current.forEach((animation) => animation.revert?.());
    runningRef.current = [];
    clear(ballRef.current); clear(shadowRef.current);
  }
  function play() {
    stop(); if (!ballRef.current) return;
    const demo = ballDemo(preset.id, kind, reduceMotion); if (!demo) return;
    const run = (target, frames) => {
      if (!target) return [];
      const [first, ...rest] = frames;
      if (first?.duration !== 0) return [animate(target, { keyframes: frames })];
      pose(target, first);
      return rest.length ? [animate(target, { keyframes: rest })] : [];
    };
    runningRef.current = [...run(ballRef.current, demo.ball), ...run(shadowRef.current, demo.shadow)];
  }
  useEffect(() => stop, []);
  return <button type="button" className={`editor-animation-preview${active ? " is-active" : ""}`} disabled={disabled} title={reason}
    aria-pressed={active} onPointerEnter={(event) => { if (event.pointerType === "mouse" && window.matchMedia?.("(hover: hover)").matches) play(); }} onPointerLeave={stop}
    onFocus={play} onBlur={stop} onClick={() => { play(); onChoose(preset.id); }}>
    <span className="editor-animation-stage" aria-hidden="true">
      <span ref={shadowRef} className="editor-ball-shadow" />
      <span ref={ballRef} className="editor-ball" />
    </span>
    <span>{preset.label}</span>
  </button>;
}

function AnimationsPanel({ mode: controlledMode, onModeChange, onPreview }) {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedIds, gesture } = useAppSelector((state) => state.editor);
  const page = pages[currentPage];
  const trigger = page.animations?.some((row) => row.trigger === "click") ? "click" : "with";
  const locked = page.elements.some((element) => selectedIds.includes(element.id) && effectiveLocked(page, element));
  const [localMode, setLocalMode] = useState("page");
  const mode = controlledMode || localMode;
  const setMode = onModeChange || setLocalMode;
  const targets = selectedIds;

  return <>
    <div className="editor-animation-tabs" role="tablist" aria-label="Animation type">
      <button type="button" role="tab" aria-selected={mode === "page"} onClick={() => setMode("page")}>Page</button>
      <button type="button" role="tab" aria-selected={mode === "element"} onClick={() => setMode("element")}>Element</button>
    </div>

    {mode === "page" ? <section role="tabpanel" aria-label="Page animations">
      <p className="editor-panel-description">Choose how this page arrives. Elements with their own animations keep them.</p>
      <div className="editor-animation-grid" aria-label="Page transition presets">{transitionPresets.map((preset) => <AnimationPreview key={preset.id} preset={preset}
        active={preset.id === (page.transition?.preset || "none")} disabled={!!gesture} onChoose={(id) => {
          dispatch(pageTransitionChanged({ ...page.transition, preset: id }));
          onPreview?.({ type: "page" });
        }} />)}</div>
    </section> : <section role="tabpanel" aria-label="Element animations">
    <p className="editor-panel-description">{selectedIds.length
      ? `Choose an animation for ${selectedIds.length === 1 ? "the selected element" : `the ${selectedIds.length} selected elements`}.`
      : "Select an element on the canvas to animate it."}</p>

    {Object.entries(PRESETS).map(([kind, presets]) => <section key={kind}><h3 className="editor-panel-subtitle">{kind[0].toUpperCase() + kind.slice(1)}</h3>
      <div className="editor-animation-grid" aria-label={`${kind} presets`}>{["none", ...presets].map((preset) => {
        const chosen = new Set(targets), existing = new Set();
        const rank = { entrance: 0, emphasis: 1, exit: 2 };
        const applyTrigger = kind !== "entrance" && (page.animations || []).some((row) => chosen.has(row.elementId) && rank[row.kind] < rank[kind]) ? "after" : trigger;
        const replaced = preset === "none" ? removeAnimationRows(page, new Set((page.animations || []).filter((row) => row.kind === kind && chosen.has(row.elementId)).map((row) => row.id))) : (page.animations || []).map((row) => {
          if (kind === "emphasis" || row.kind !== kind || !chosen.has(row.elementId)) return row;
          existing.add(row.elementId); return { ...row, preset };
        });
        const candidate = preset === "none" ? [] : insertionRows(page, targets.filter((id) => !existing.has(id)), kind, preset, applyTrigger);
        const proposed = [...replaced, ...candidate];
        const errors = validateTimeline({ ...page, animations: proposed });
        const active = targets.length > 0 && targets.every((id) => preset === "none"
          ? !(page.animations || []).some((row) => row.elementId === id && row.kind === kind)
          : (page.animations || []).some((row) => row.elementId === id && row.kind === kind && row.preset === preset));
        const reason = !targets.length ? "Select an element first"
          : locked ? "Unlock the selection to animate it"
          : errors.length ? "Already added, overlapping, or out of order. Adjust the existing animation timing in the Animation settings." : undefined;
        return <AnimationPreview key={preset} kind={kind} preset={{ id: preset, label: preset === "none" ? "None" : presetLabel({ kind, preset }) }} active={active} disabled={!!reason || !!gesture} reason={reason}
          onChoose={() => {
            dispatch(animationAdded({ kind, preset, trigger: applyTrigger }));
            if (preset !== "none") onPreview?.({ type: "element", elementIds: targets, kind, preset });
          }} />;
      })}</div></section>)}
    </section>}
  </>;
}

export default function EditorToolPanel({ activeTool, isOpen = true, ref, animationMode, onAnimationModeChange, onAnimationPreview }) {
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
      {activeTool === "animations" && <AnimationsPanel mode={animationMode} onModeChange={onAnimationModeChange} onPreview={onAnimationPreview} />}
      {activeTool === "timer" && <TimerPanel />}
      {activeTool === "layers" && <EditorLayersPanel />}
    </aside>
  );
}
