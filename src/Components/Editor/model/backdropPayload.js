import { serializeDocument } from "./editorDocument.js";

/*
 * The editor's document <-> the backdrop API's request and response.
 *
 * serializeDocument already writes the API's page/component shape, with a few
 * fields the server's schema cannot hold as they are:
 *   image       the editor writes { fileName }, the server wants a string
 *   lockAspect  the editor writes true/false, the server's field is an object
 *   pageNumber, dynamic, clockFormat   not in the server's component schema
 *   pageNumbers (document level)       not in the backdrop schema
 * `styles` and `settings` are free-form objects on the server, so those
 * fields travel inside them under an `editor` key and are put back on load.
 * Nothing about the design is lost on the way through.
 */

const EXTRA_COMPONENT_FIELDS = ["lockAspect", "pageNumber", "dynamic", "clockFormat"];

/* The server's request types are Java records whose number and true/false
   fields are primitives: a field that is null — or simply missing, which a
   record also reads as null — is refused ("Cannot map `null` into type
   `long`"). So every number and boolean field in the Swagger schema
   (https://visora-api.gital.me/v3/api-docs) is always sent, with the value
   below when the editor has none. Objects may be left out; they can be null.
   `id` is the server's to assign: 0 means "not saved yet". */
const SCHEMA_DEFAULTS = {
  page: { id: 0 },
  component: { id: 0, rotation: 0, locked: false, visible: true, flipX: false, flipY: false },
  group: { visible: true, locked: false },
  animation: { delayMs: 0, durationMs: 0 },
  transition: { delayMs: 0, durationMs: 0 },
  point: { x: 0, y: 0 },
  size: { width: 0, height: 0 },
};
const withoutNulls = (value) => Object.fromEntries(Object.entries(value || {}).filter(([, item]) => item !== null && item !== undefined));
const filled = (value, defaults) => ({ ...defaults, ...withoutNulls(value) });

function toComponent(component, layerIndex) {
  const editor = {}, rest = {};
  for (const [key, value] of Object.entries(withoutNulls(component))) {
    if (key === "id") continue;
    if (EXTRA_COMPONENT_FIELDS.includes(key)) editor[key] = value;
    else rest[key] = value;
  }
  return {
    ...SCHEMA_DEFAULTS.component,
    layerIndex,
    ...rest,
    position: filled(component.position, SCHEMA_DEFAULTS.point),
    size: filled(component.size, SCHEMA_DEFAULTS.size),
    ...(component.image ? { image: component.image.fileName || "" } : {}),
    styles: { ...(component.styles || {}), ...(Object.keys(editor).length ? { editor } : {}) },
  };
}

function fromComponent(component) {
  const { editor = {}, ...styles } = component.styles || {};
  return {
    ...component,
    ...editor,
    ...(typeof component.image === "string" ? { image: { fileName: component.image } } : {}),
    styles,
  };
}

/** The body for POST /backdrops (and PATCH, which also wants `version`). */
export function toBackdropRequest(document, { thumbnail } = {}) {
  const { uuid: _uuid, remoteId: _remoteId, pageNumbers, version, ...rest } = document;
  return {
    ...withoutNulls(rest),
    ...(thumbnail ? { thumbnail } : {}),
    ...(version ? { version } : {}),
    settings: { ...(document.settings || {}), ...(pageNumbers ? { editor: { pageNumbers } } : {}) },
    ...(document.canvas ? { canvas: filled(document.canvas, SCHEMA_DEFAULTS.size) } : {}),
    pages: document.pages.map((page, index) => {
      const { id: _id, ...rest } = withoutNulls(page);
      return {
        ...SCHEMA_DEFAULTS.page, pageNumber: index + 1, ...rest,
        ...(page.transition ? { transition: filled(page.transition, SCHEMA_DEFAULTS.transition) } : {}),
        ...(page.groups ? { groups: page.groups.map((group) => filled(group, SCHEMA_DEFAULTS.group)) } : {}),
        ...(page.animations ? { animations: page.animations.map((row) => filled(row, SCHEMA_DEFAULTS.animation)) } : {}),
        components: (page.components || []).map(toComponent),
      };
    }),
  };
}

/** A GET /backdrops/{uuid} (or /templates/{uuid}) `data`, as a document hydrateDocument reads. */
export function fromBackdropResponse(data) {
  const pageNumbers = data?.settings?.editor?.pageNumbers;
  return {
    ...data,
    ...(pageNumbers ? { pageNumbers } : {}),
    pages: (data?.pages || []).map((page) => ({ ...page, components: (page.components || []).map(fromComponent) })),
  };
}

/** The editor state as the API wants it. */
export const editorToBackdropRequest = (editor, options) => toBackdropRequest(serializeDocument(editor), options);

/* Pictures carried inside the design as data: URLs (stickers pasted or
   imported). Uploading them first and keeping only their file names keeps the
   request small — a few of them can make a design megabytes of text. */
export const isInlineImage = (src) => typeof src === "string" && src.startsWith("data:image/");

export function inlineImageSources(document) {
  const found = new Set();
  document.pages.forEach((page) => (page.components || []).forEach((component) => {
    if (isInlineImage(component.image?.fileName)) found.add(component.image.fileName);
    if (isInlineImage(component.styles?.fillImage)) found.add(component.styles.fillImage);
  }));
  return [...found];
}

/** The document with each inline picture swapped for its uploaded file name. */
export function replaceImageSources(document, fileNames) {
  const swap = (src) => fileNames.get(src) || src;
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      components: (page.components || []).map((component) => ({
        ...component,
        ...(component.image ? { image: { ...component.image, fileName: swap(component.image.fileName) } } : {}),
        ...(component.styles?.fillImage ? { styles: { ...component.styles, fillImage: swap(component.styles.fillImage) } } : {}),
      })),
    })),
  };
}

/** A data: URL as a File, for POST /storage. */
export function dataUrlToFile(dataUrl, name = "image") {
  const [head, body] = String(dataUrl).split(",");
  const type = /data:([^;]+)/.exec(head)?.[1] || "image/png";
  const bytes = head.includes(";base64") ? Uint8Array.from(atob(body), (char) => char.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(body));
  const extension = type.split("/")[1]?.replace("svg+xml", "svg") || "png";
  return new File([bytes], `${name}.${extension}`, { type });
}
