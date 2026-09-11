export const EDITOR_SCHEMA_VERSION = 2;
/* Deliberately still ".v1": the key is where saved work lives, not a statement
   about the schema. Bumping it would orphan every document already on disk —
   the app would look in a new empty slot and quietly show a blank page. The
   version travels *inside* the document instead, and migrateDocument upgrades
   it on read. */
export const EDITOR_STORAGE_KEY = "visora.editor.document.v1";

/* A backdrop is shown on a projector, so a timer that reads 00:00:00 is a dead
   element in front of an audience — one second is the floor. The ceiling keeps
   HH inside two digits. */
export const TIMER_MIN_MS = 1000;
export const TIMER_MAX_MS = 24 * 60 * 60 * 1000;
export const TIMER_SOUNDS = ["chime", "bell", "soft-ding", "none"];
export const TIMER_FORMATS = ["HH:MM:SS", "MM:SS"];

export function defaultTimer(format = "HH:MM:SS") {
  return {
    mode: "COUNTDOWN",
    durationMs: 5 * 60 * 1000,
    format: TIMER_FORMATS.includes(format) ? format : "HH:MM:SS",
    onComplete: { sound: "chime", message: "" },
    /* Three positions, and both of the first two are single buttons that
       rename themselves — Start/Stop and Pause/Resume. startStop has no toggle
       in the panel: hiding it would leave a timer that can neither be started
       nor stopped. */
    controls: { startStop: true, pauseResume: true, reset: true },
  };
}

/* Every timer read from disk or from the API passes through here, so a partial,
   stale or hand-edited document can never put an unrunnable timer on a screen. */
export function normalizeTimer(raw) {
  const base = defaultTimer();
  if (!raw || typeof raw !== "object") return base;
  const duration = Number(raw.durationMs);
  const controls = raw.controls && typeof raw.controls === "object" ? raw.controls : {};
  const onComplete = raw.onComplete && typeof raw.onComplete === "object" ? raw.onComplete : {};
  const sound = TIMER_SOUNDS.includes(onComplete.sound) ? onComplete.sound : base.onComplete.sound;
  return {
    mode: "COUNTDOWN",
    durationMs: Number.isFinite(duration)
      ? Math.min(TIMER_MAX_MS, Math.max(TIMER_MIN_MS, Math.round(duration)))
      : base.durationMs,
    format: TIMER_FORMATS.includes(raw.format) ? raw.format : base.format,
    onComplete: { sound, message: typeof onComplete.message === "string" ? onComplete.message : "" },
    controls: {
      startStop: true,
      /* `pause` is the key an earlier four-position draft wrote. Documents
         saved under it are still readable, so an author who had hidden Pause
         does not silently get it back. */
      pauseResume: (controls.pauseResume ?? controls.pause) !== false,
      reset: controls.reset !== false,
    },
  };
}

export function emptyDocument() {
  return {
    clientSchemaVersion: EDITOR_SCHEMA_VERSION,
    uuid: "backdrop-local",
    name: "Untitled-1",
    version: 0,
    orientation: "LANDSCAPE",
    canvas: { width: 1920, height: 1080 },
    pages: [{ uuid: "page-initial", pageNumber: 1, background: { type: "COLOR", value: "#FFFFFF" }, components: [] }],
  };
}

export function serializeDocument(editor) {
  return {
    clientSchemaVersion: EDITOR_SCHEMA_VERSION,
    uuid: editor.documentId || "backdrop-local",
    name: editor.title || "Untitled-1",
    version: editor.version || 0,
    orientation: "LANDSCAPE",
    canvas: { width: 1920, height: 1080 },
    pages: editor.pages.map((page, pageIndex) => ({
      uuid: page.id,
      pageNumber: pageIndex + 1,
      background: page.background || { type: "COLOR", value: "#FFFFFF" },
      ...(page.animation ? { animation: page.animation } : {}),
      components: page.elements.map((element, layerIndex) => ({
        uuid: element.id,
        type: element.type === "text" ? "TEXT" : element.type === "timer" ? "COUNTDOWN_TIMER" : "SHAPE",
        ...(element.content !== undefined ? { content: element.content } : {}),
        ...(element.shape ? { shape: element.shape } : {}),
        position: { x: element.x, y: element.y },
        size: { width: element.w, height: element.h },
        rotation: element.rotation || 0,
        layerIndex,
        locked: !!element.locked,
        visible: element.visible !== false,
        ...(element.type === "timer" ? { timer: normalizeTimer(element.timer) } : {}),
        styles: element.type === "timer" ? {
          // A timer is typeset like text but has no alignment or tracking of its
          // own; colour rides in `color` so hydrate's existing lookup finds it.
          color: element.fill, fontFamily: element.fontFamily, fontSize: element.fontSize,
          opacity: element.opacity,
        } : element.type === "text" ? {
          fontFamily: element.fontFamily, fontSize: element.fontSize, fontWeight: element.fontWeight,
          fontStyle: element.fontStyle || "normal", textAlign: element.textAlign, color: element.fill,
          lineHeight: element.lineHeight, letterSpacing: element.letterSpacing,
          // hydrateDocument reads styles.opacity for every component type, so
          // leaving it off here silently reset faded text to fully opaque on
          // the next load — and this object is the API payload, so the server
          // would have inherited the same hole.
          opacity: element.opacity,
        } : { fill: element.fill, opacity: element.opacity, stroke: element.stroke, strokeWidth: element.strokeWidth },
        ...(element.animation ? { animation: element.animation } : {}),
      })),
    })),
  };
}

/* Upgrades an older document in place of rejecting it. This runs *before* the
   version check on purpose: the check used to return null for any version that
   was not current, which after a bump would have silently swapped every saved
   backdrop for a blank one. Losing someone's work to a version number is a
   worse failure than any schema drift it was guarding against. */
export function migrateDocument(value) {
  const from = value.clientSchemaVersion == null ? 1 : value.clientSchemaVersion;
  if (from > EDITOR_SCHEMA_VERSION) return null;   // written by a newer client; do not guess
  if (from === EDITOR_SCHEMA_VERSION) return value;

  /* 1 -> 2 added the timer. No v1 document can contain one, because the type
     was not insertable then — but a hand-edited or partially-written file
     might, so any timer found is normalised rather than trusted. */
  return {
    ...value,
    clientSchemaVersion: EDITOR_SCHEMA_VERSION,
    pages: value.pages.map((page) => ({
      ...page,
      components: (page.components || []).map((component) => (
        component?.type === "COUNTDOWN_TIMER"
          ? { ...component, timer: normalizeTimer(component.timer) }
          : component
      )),
    })),
  };
}

export function validateDocument(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.pages) || !value.pages.length) return null;
  const migrated = migrateDocument(value);
  if (!migrated) return null;
  const pages = migrated.pages.filter((page) => page && typeof page.uuid === "string" && Array.isArray(page.components));
  if (!pages.length) return null;
  return { ...emptyDocument(), ...migrated, pages, clientSchemaVersion: EDITOR_SCHEMA_VERSION };
}

export function hydrateDocument(document) {
  const value = validateDocument(document) || emptyDocument();
  return {
    documentId: value.uuid,
    title: value.name,
    version: value.version || 0,
    pages: value.pages.map((page) => ({
      id: page.uuid,
      background: page.background || { type: "COLOR", value: "#FFFFFF" },
      ...(page.animation ? { animation: page.animation } : {}),
      elements: page.components.map((component) => ({
        id: component.uuid,
        type: component.type === "TEXT" ? "text" : component.type === "COUNTDOWN_TIMER" ? "timer" : "shape",
        ...(component.content !== undefined ? { content: component.content } : {}),
        ...(component.shape ? { shape: component.shape } : {}),
        x: component.position?.x || 0, y: component.position?.y || 0,
        w: component.size?.width || 320, h: component.size?.height || 180,
        rotation: component.rotation || 0,
        locked: !!component.locked, visible: component.visible !== false,
        fill: component.styles?.color || component.styles?.fill || "#705AE0",
        opacity: component.styles?.opacity ?? 1,
        stroke: component.styles?.stroke || "transparent",
        strokeWidth: component.styles?.strokeWidth || 0,
        ...(component.type === "COUNTDOWN_TIMER" ? {
          // normalizeTimer supplies the whole object when a v1 document, or a
          // truncated one, arrives without it.
          timer: normalizeTimer(component.timer),
          fontFamily: component.styles?.fontFamily || "Poppins",
          fontSize: component.styles?.fontSize || 120,
        } : {}),
        ...(component.type === "TEXT" ? {
          fontFamily: component.styles?.fontFamily || "Poppins",
          fontSize: component.styles?.fontSize || 72,
          fontWeight: component.styles?.fontWeight || 600,
          fontStyle: component.styles?.fontStyle || "normal",
          textAlign: component.styles?.textAlign || "center",
          lineHeight: component.styles?.lineHeight || 1.2,
          letterSpacing: component.styles?.letterSpacing || 0,
        } : {}),
        ...(component.animation ? { animation: component.animation } : {}),
      })),
    })),
  };
}

export function loadLocalDocument(storage = globalThis.localStorage) {
  if (!storage) return null;
  try { return validateDocument(JSON.parse(storage.getItem(EDITOR_STORAGE_KEY))); }
  catch { return null; }
}

export function saveLocalDocument(editor, storage = globalThis.localStorage) {
  if (!storage) return false;
  try { storage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(serializeDocument(editor))); return true; }
  catch { return false; }
}

export function downloadDocument(editor) {
  const blob = new Blob([JSON.stringify(serializeDocument(editor), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(editor.title || "visora-design").replace(/[^a-z0-9-_]+/gi, "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
