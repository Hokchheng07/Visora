import { normalizeEffects } from "./effectsFilter.js";
import { cleanName, normalizeGroups } from "./layerModel.js";
import { cornerRadiiFor } from "./vectorPath.js";
import { normalizeVector } from "./vectorEdit.js";
import { normalizeCrop, serializeCrop } from "./imageCrop.js";
import { normalizeGradient, strokeJoinOf, strokeStyleOf, miterAngleOf } from "./shapePaint.js";
import { migrateAnimations, normalizeTransition, repairTimeline } from "../animation/animationTimeline.js";
import { normalizePageNumbers } from "./pageNumbers.js";
import { normalizeListStyle } from "./textLists.js";
import { DEFAULT_EDITOR_TEXT_COLOR } from "./editorDefaults.js";
import { defaultClockFormat, isClockKind } from "./clockText.js";

export const EDITOR_SCHEMA_VERSION = 4;
export const STROKE_ALIGNS = ["inside", "center", "outside"];
const unit = (value, fallback = 1) => (Number.isFinite(Number(value)) ? Math.min(1, Math.max(0, Number(value))) : fallback);

/* Shape styles, v3. New fields are written only when they differ from the
   default, so an untouched shape saves exactly as it did in v2. `fill: null`
   means the shape has no fill; a stroke of "transparent" (the v2 spelling)
   means no stroke. */
function imageStyles(element) {
  const effects = normalizeEffects(element.effects);
  const crop = serializeCrop(element.crop);
  return {
    opacity: element.opacity,
    // An uncropped photo writes nothing, so old documents save as they did.
    ...(crop ? { crop } : {}),
    // Only library vectors take a colour; a photo has none.
    ...(/^#[0-9A-F]{6}$/i.test(element.fill || "") ? { fill: element.fill.toUpperCase() } : {}),
    ...(element.cornerRadius > 0 ? { cornerRadius: element.cornerRadius } : {}),
    ...(effects.length ? { effects } : {}),
  };
}

function hydrateImage(component) {
  const styles = component.styles || {};
  const fileName = component.image?.fileName;
  return {
    src: typeof fileName === "string" ? fileName : "",
    ...(/^#[0-9A-F]{6}$/i.test(styles.fill || "") ? { fill: styles.fill.toUpperCase() } : {}),
    cornerRadius: Math.max(0, Number(styles.cornerRadius) || 0),
    effects: normalizeEffects(styles.effects),
    crop: normalizeCrop(styles.crop),
    flipX: !!component.flipX, flipY: !!component.flipY,
    // photos resize in proportion unless someone turned the lock off
    lockAspect: component.lockAspect !== false,
  };
}

function shapeStyles(element) {
  const hasStroke = !!element.stroke && element.stroke !== "transparent";
  const effects = normalizeEffects(element.effects);
  // Per-corner radii are saved only when the corners differ; four equal corners save as one cornerRadius.
  const radii = cornerRadiiFor(element.shape, element.vector, element.cornerRadii);
  const sameCorners = !!radii && radii.every((value) => value === radii[0]);
  const radius = sameCorners ? radii[0] : element.cornerRadius;
  const gradient = normalizeGradient(element.gradient);
  const dashed = hasStroke && strokeStyleOf(element.strokeStyle) !== "solid";
  const join = hasStroke ? strokeJoinOf(element.strokeJoin) : "miter";
  return {
    fill: element.fill ?? null, opacity: element.opacity,
    stroke: hasStroke ? element.stroke : "transparent", strokeWidth: hasStroke ? element.strokeWidth || 0 : 0,
    ...(element.fill && unit(element.fillOpacity) !== 1 ? { fillOpacity: unit(element.fillOpacity) } : {}),
    ...(element.fill && element.fillVisible === false ? { fillVisible: false } : {}),
    ...(dashed ? { strokeStyle: strokeStyleOf(element.strokeStyle) } : {}),
    ...(dashed && Array.isArray(element.strokeDash) && element.strokeDash.length === 2 ? { strokeDash: element.strokeDash.map(Number) } : {}),
    ...(join !== "miter" ? { strokeJoin: join } : {}),
    ...(hasStroke && join === "miter" && miterAngleOf(element.miterAngle) !== 28.96 ? { miterAngle: miterAngleOf(element.miterAngle) } : {}),
    ...(hasStroke ? {
      strokeAlign: STROKE_ALIGNS.includes(element.strokeAlign) ? element.strokeAlign : "inside",
      ...(unit(element.strokeOpacity) !== 1 ? { strokeOpacity: unit(element.strokeOpacity) } : {}),
      ...(element.strokeVisible === false ? { strokeVisible: false } : {}),
    } : {}),
    ...(radius > 0 ? { cornerRadius: radius } : {}),
    // v3 paint. A gradient rides beside `fill`, which stays the solid fallback.
    ...(gradient ? { gradient } : {}),
    // An image fill is stored as the storage fileName, like an image element's src; `fill` stays the fallback underneath.
    ...(element.fillImage ? { fillImage: element.fillImage } : {}),
    ...(radii && !sameCorners ? { cornerRadii: radii } : {}),
    ...(effects.length ? { effects } : {}),
  };
}

/* Stroke fields for a text or timer element — a -webkit-text-stroke outline, so
   no align, dash or join, just colour, width and its optional opacity/hidden.
   Written only when a real stroke is set, so an untouched element saves exactly
   as it did before the outline existed. */
function textStrokeSave(element) {
  const hasStroke = !!element.stroke && element.stroke !== "transparent" && (element.strokeWidth || 0) > 0;
  if (!hasStroke) return {};
  return {
    stroke: element.stroke, strokeWidth: element.strokeWidth,
    ...(unit(element.strokeOpacity) !== 1 ? { strokeOpacity: unit(element.strokeOpacity) } : {}),
    ...(element.strokeVisible === false ? { strokeVisible: false } : {}),
  };
}

// The old CSS rounded rectangle used 18% of its box; the nearest circular radius.
export const legacyCornerRadius = (component) => Math.round(Math.min(component.size?.width || 0, component.size?.height || 0) * 0.18);

function hydrateShape(component) {
  const styles = component.styles || {};
  const stroke = styles.stroke && styles.stroke !== "transparent" ? styles.stroke : null;
  /* A custom shape whose points are missing or broken cannot be drawn, so it
     loads as a plain rectangle rather than as nothing at all. */
  const vector = component.shape === "custom" ? normalizeVector(component.vector) : null;
  return {
    ...(component.shape === "custom" ? (vector ? { vector } : { shape: "rectangle" }) : {}),
    fill: styles.fill === null ? null : styles.fill || "#AD8DEA",
    fillOpacity: unit(styles.fillOpacity), fillVisible: styles.fillVisible !== false,
    stroke, strokeWidth: stroke ? Math.min(50, Math.max(0, Number(styles.strokeWidth) || 0)) : 0,
    strokeAlign: STROKE_ALIGNS.includes(styles.strokeAlign) ? styles.strokeAlign : "inside",
    strokeOpacity: unit(styles.strokeOpacity), strokeVisible: styles.strokeVisible !== false,
    cornerRadius: Number.isFinite(Number(styles.cornerRadius)) && styles.cornerRadius !== null ? Math.max(0, Number(styles.cornerRadius))
      : component.shape === "rounded-rectangle" ? legacyCornerRadius(component) : 0,
    cornerRadii: cornerRadiiFor(component.shape, component.vector, styles.cornerRadii),
    effects: normalizeEffects(styles.effects),
    gradient: normalizeGradient(styles.gradient),
    fillImage: typeof styles.fillImage === "string" && styles.fillImage ? styles.fillImage : null,
    strokeStyle: strokeStyleOf(styles.strokeStyle),
    strokeDash: Array.isArray(styles.strokeDash) && styles.strokeDash.length === 2 ? styles.strokeDash.map(Number) : null,
    strokeJoin: strokeJoinOf(styles.strokeJoin),
    miterAngle: miterAngleOf(styles.miterAngle),
    flipX: !!component.flipX, flipY: !!component.flipY, lockAspect: !!component.lockAspect,
  };
}
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
/* Two kinds of timer share one element type (COUNTDOWN_TIMER) and one object:
   a countdown runs down from durationMs; a stopwatch counts up from zero with
   only Start/Stop and Reset. Keeping one type means the backend's hasTimer and
   export rules keep working unchanged. */
export const TIMER_MODES = ["COUNTDOWN", "STOPWATCH"];
// A stopwatch always reads hours, minutes and whole seconds (00:01:30); whole
// seconds keep the digits still on a projector instead of flickering hundredths.
export const STOPWATCH_FORMAT = "HH:MM:SS";

/* Button fills by role. Stop shares the first position with Start, so it has
   its own colour even though both never show at once. */
export const TIMER_BUTTON_COLORS = { start: "#2F7A55", pause: "#C98A12", stop: "#C4443E", reset: "#6B6575" };
const TIMER_HEX = /^#[0-9A-F]{6}$/i;

export function defaultTimer(format = "HH:MM:SS", buttonColors = {}, mode = "COUNTDOWN") {
  return {
    mode: TIMER_MODES.includes(mode) ? mode : "COUNTDOWN",
    durationMs: 5 * 60 * 1000,
    format: TIMER_FORMATS.includes(format) ? format : "HH:MM:SS",
    onComplete: { sound: "chime", message: "" },
    /* Three positions, and both of the first two are single buttons that
       rename themselves — Start/Stop and Pause/Resume. startStop has no toggle
       in the panel: hiding it would leave a timer that can neither be started
       nor stopped. */
    controls: { startStop: true, pauseResume: true, reset: true },
    buttonColors: normalizeButtonColors(buttonColors),
  };
}

export function normalizeButtonColors(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return Object.fromEntries(Object.entries(TIMER_BUTTON_COLORS).map(([role, fallback]) =>
    [role, TIMER_HEX.test(source[role]) ? source[role].toUpperCase() : fallback]));
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
  /* The countdown's own settings (duration, format, completion, Pause) are
     kept on a stopwatch too, unused, so switching a timer to Stopwatch and back
     in the sidebar gives the countdown back as it was. Only serializeTimer
     decides what a stopwatch actually saves. */
  return {
    mode: TIMER_MODES.includes(raw.mode) ? raw.mode : "COUNTDOWN",
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
    buttonColors: normalizeButtonColors(raw.buttonColors),
  };
}

/* What a timer saves. A stopwatch writes only what it uses — mode, its fixed
   format, Start/Stop and Reset, and its button colours — so the document never
   carries a duration or a completion sound that does nothing. */
export function serializeTimer(raw) {
  const timer = normalizeTimer(raw);
  if (timer.mode !== "STOPWATCH") return timer;
  return {
    mode: "STOPWATCH",
    format: STOPWATCH_FORMAT,
    controls: { startStop: true, reset: timer.controls.reset },
    // Start, Stop and Reset only: a stopwatch has no Pause button to colour.
    buttonColors: { start: timer.buttonColors.start, stop: timer.buttonColors.stop, reset: timer.buttonColors.reset },
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
    // Written only when switched on, so a design without numbers saves as before.
    ...(normalizePageNumbers(editor.pageNumbers).enabled ? { pageNumbers: normalizePageNumbers(editor.pageNumbers) } : {}),
    pages: editor.pages.map((page, pageIndex) => ({
      uuid: page.id,
      pageNumber: pageIndex + 1,
      // v3 layer fields. Written only when set, so an unnamed, ungrouped page saves as before.
      ...(cleanName(page.name) ? { name: cleanName(page.name) } : {}),
      background: page.background || { type: "COLOR", value: "#FFFFFF" },
      ...(normalizeTransition(page.transition) ? { transition: normalizeTransition(page.transition) } : {}),
      animations: repairTimeline(page),
      ...(page.groups?.length ? { groups: page.groups.map((group) => ({ uuid: group.id, name: group.name, visible: group.visible !== false, locked: !!group.locked })) } : {}),
      components: page.elements.map((element, layerIndex) => ({
        uuid: element.id,
        ...(element.morphId ? { morphId: element.morphId } : {}),
        type: element.type === "text" ? "TEXT" : element.type === "timer" ? "COUNTDOWN_TIMER" : element.type === "image" ? "IMAGE" : "SHAPE",
        ...(cleanName(element.name) ? { name: cleanName(element.name) } : {}),
        // A page-number text layer; its content is rewritten to the page's number on load.
        ...(element.type === "text" && element.pageNumber ? { pageNumber: true } : {}),
        // A live text layer (Current Time / Date); its words are generated from the clock on every surface.
        ...(element.type === "text" && isClockKind(element.dynamic) ? { dynamic: element.dynamic, clockFormat: element.clockFormat || defaultClockFormat(element.dynamic) } : {}),
        ...(element.groupId ? { groupUuid: element.groupId } : {}),
        ...(element.content !== undefined ? { content: element.content } : {}),
        ...(element.shape ? { shape: element.shape } : {}),
        // A point-edited shape carries its points; a preset never does.
        ...(element.shape === "custom" && normalizeVector(element.vector) ? { vector: normalizeVector(element.vector) } : {}),
        ...(element.flipX ? { flipX: true } : {}),
        ...(element.flipY ? { flipY: true } : {}),
        // images default to locked, so an unlocked one has to say so
        ...(element.lockAspect ? { lockAspect: true } : element.type === "image" ? { lockAspect: false } : {}),
        position: { x: element.x, y: element.y },
        size: { width: element.w, height: element.h },
        rotation: element.rotation || 0,
        layerIndex,
        locked: !!element.locked,
        visible: element.visible !== false,
        ...(element.type === "timer" ? { timer: serializeTimer(element.timer) } : {}),
        // Only the storage fileName is saved; the link is rebuilt when drawn.
        ...(element.type === "image" ? { image: { fileName: element.src } } : {}),
        styles: element.type === "image" ? imageStyles(element) : element.type === "timer" ? {
          // A timer is typeset like text but has no alignment or tracking of its
          // own; colour rides in `color` so hydrate's existing lookup finds it.
          color: element.fill, fontFamily: element.fontFamily, fontSize: element.fontSize,
          opacity: element.opacity,
          ...textStrokeSave(element),
        } : element.type === "text" ? {
          fontFamily: element.fontFamily, fontSize: element.fontSize, fontWeight: element.fontWeight,
          fontStyle: element.fontStyle || "normal", textAlign: element.textAlign, color: element.fill,
          lineHeight: element.lineHeight, letterSpacing: element.letterSpacing,
          ...textStrokeSave(element),
          // v3. Sent only when set, so a plain text box stays byte-identical to v2.
          ...(element.textDecoration === "underline" ? { textDecoration: "underline" } : {}),
          ...(normalizeListStyle(element.listStyle) ? { listStyle: normalizeListStyle(element.listStyle) } : {}),
          ...(normalizeEffects(element.effects).length ? { effects: normalizeEffects(element.effects) } : {}),
          // hydrateDocument reads styles.opacity for every component type, so
          // leaving it off here silently reset faded text to fully opaque on
          // the next load — and this object is the API payload, so the server
          // would have inherited the same hole.
          opacity: element.opacity,
        } : shapeStyles(element),
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

  /* 2 -> 3 only added optional fields (textDecoration, effects, page and layer
     names, groups); a missing one means "off", so a v2 document needs no rewriting.
     1 -> 2 added the timer. No v1 document can contain one, because the type
     was not insertable then — but a hand-edited or partially-written file
     might, so any timer found is normalised rather than trusted. */
  return {
    ...value,
    clientSchemaVersion: EDITOR_SCHEMA_VERSION,
    pages: value.pages.map((page) => {
      const migrated = migrateAnimations({ ...page, id: page.uuid, elements: (page.components || []).map((component) => ({ ...component, id: component.uuid })) });
      const { animation: _old, ...rest } = page;
      return ({
      ...rest,
      transition: migrated.transition,
      animations: migrated.animations,
      components: (page.components || []).map((component) => (
        component?.type === "COUNTDOWN_TIMER"
          ? (({ animation: _animation, ...item }) => ({ ...item, timer: normalizeTimer(item.timer) }))(component)
          : (({ animation: _animation, ...item }) => item)(component)
      )),
    }); }),
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

/* Groups from disk or the API are trusted no further than their shape: a
   group id used on two pages gets a new id on the second, and normalizeGroups
   then drops dangling references, gathers split groups and removes empty ones. */
function hydrateGroups(groups, seen) {
  return (Array.isArray(groups) ? groups : []).filter((group) => group && typeof group.uuid === "string").map((group, index) => {
    let id = group.uuid, copy = 1;
    while (seen.has(id)) id = `${group.uuid}~${copy++}`;
    seen.add(id);
    return { id, source: group.uuid, name: cleanName(group.name) || `Group ${index + 1}`, visible: group.visible !== false, locked: group.locked === true };
  });
}

export function hydrateDocument(document) {
  const value = validateDocument(document) || emptyDocument();
  const seenGroups = new Set();
  return {
    documentId: value.uuid,
    title: value.name,
    pageNumbers: normalizePageNumbers(value.pageNumbers),
    version: value.version || 0,
    pages: value.pages.map((page) => {
      const groups = hydrateGroups(page.groups, seenGroups);
      const groupIds = new Map(groups.map((group) => [group.source, group.id]));
      const hydrated = normalizeGroups({
        id: page.uuid,
        ...(cleanName(page.name) ? { name: cleanName(page.name) } : {}),
        background: page.background || { type: "COLOR", value: "#FFFFFF" },
        ...(normalizeTransition(page.transition) ? { transition: normalizeTransition(page.transition) } : {}),
        animations: page.animations || [],
        groups: groups.map(({ source: _source, ...group }) => group),
        elements: page.components.map((component) => ({
          id: component.uuid,
          ...(typeof component.morphId === "string" && component.morphId ? { morphId: component.morphId } : {}),
          type: component.type === "TEXT" ? "text" : component.type === "COUNTDOWN_TIMER" ? "timer" : component.type === "IMAGE" ? "image" : "shape",
          ...(cleanName(component.name) ? { name: cleanName(component.name) } : {}),
          ...(component.type === "TEXT" && component.pageNumber === true ? { pageNumber: true } : {}),
          ...(component.type === "TEXT" && isClockKind(component.dynamic) ? { dynamic: component.dynamic, clockFormat: component.clockFormat || defaultClockFormat(component.dynamic) } : {}),
          ...(groupIds.has(component.groupUuid) ? { groupId: groupIds.get(component.groupUuid) } : {}),
          ...(component.content !== undefined ? { content: component.content } : {}),
          ...(component.shape ? { shape: component.shape } : {}),
          x: component.position?.x || 0, y: component.position?.y || 0,
          w: component.size?.width || 320, h: component.size?.height || 180,
          rotation: component.rotation || 0,
          locked: !!component.locked, visible: component.visible !== false,
          fill: component.styles?.color || component.styles?.fill || DEFAULT_EDITOR_TEXT_COLOR,
          opacity: component.styles?.opacity ?? 1,
          stroke: component.styles?.stroke || "transparent",
          strokeWidth: component.styles?.strokeWidth || 0,
          ...(component.type === "COUNTDOWN_TIMER" ? {
            // normalizeTimer supplies the whole object when a v1 document, or a
            // truncated one, arrives without it.
            timer: normalizeTimer(component.timer),
            fontFamily: component.styles?.fontFamily || "Poppins",
            fontSize: component.styles?.fontSize || 120,
            strokeOpacity: unit(component.styles?.strokeOpacity), strokeVisible: component.styles?.strokeVisible !== false,
          } : {}),
          ...(component.type === "SHAPE" ? hydrateShape(component) : {}),
          ...(component.type === "IMAGE" ? hydrateImage(component) : {}),
          ...(component.type === "TEXT" ? {
            fontFamily: component.styles?.fontFamily || "Poppins",
            fontSize: component.styles?.fontSize || 72,
            fontWeight: component.styles?.fontWeight || 600,
            fontStyle: component.styles?.fontStyle || "normal",
            textAlign: component.styles?.textAlign || "center",
            lineHeight: component.styles?.lineHeight || 1.2,
            letterSpacing: component.styles?.letterSpacing || 0,
            textDecoration: component.styles?.textDecoration === "underline" ? "underline" : "none",
            listStyle: normalizeListStyle(component.styles?.listStyle),
            effects: normalizeEffects(component.styles?.effects),
            strokeOpacity: unit(component.styles?.strokeOpacity), strokeVisible: component.styles?.strokeVisible !== false,
          } : {}),
        })),
      });
      hydrated.animations = repairTimeline(hydrated);
      return hydrated;
    }),
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

/*
 * Import: the other half of Export. Reads a .json file and gives back the
 * editor state it describes (the same shape hydrateDocument returns), or
 * throws an Error with a message fit to show the user.
 *
 * validateDocument runs first on purpose: hydrateDocument quietly turns
 * anything it cannot read into an empty design, and loading that would wipe
 * the user's work without a word.
 */
export async function readDocumentFile(file) {
  if (!file) throw new Error("No file was chosen.");
  let json;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new Error("This file isn't valid JSON. Choose a design exported from Visora.");
  }
  const checked = validateDocument(json);
  if (!checked) throw new Error("This file isn't a Visora design, or it was made by a newer version.");
  return hydrateDocument(checked);
}
