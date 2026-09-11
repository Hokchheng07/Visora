export const EDITOR_SCHEMA_VERSION = 1;
export const EDITOR_STORAGE_KEY = "visora.editor.document.v1";

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
        styles: element.type === "text" ? {
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

export function validateDocument(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.pages) || !value.pages.length) return null;
  if (value.clientSchemaVersion != null && value.clientSchemaVersion !== EDITOR_SCHEMA_VERSION) return null;
  const pages = value.pages.filter((page) => page && typeof page.uuid === "string" && Array.isArray(page.components));
  if (!pages.length) return null;
  return { ...emptyDocument(), ...value, pages, clientSchemaVersion: EDITOR_SCHEMA_VERSION };
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
