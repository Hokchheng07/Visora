import { nanoid } from "@reduxjs/toolkit";
import { serializeDocument } from "./editorDocument.js";

/*
 * Publishing a backdrop as a reusable template.
 *
 * Not connected to the API yet. For now publishing is a stand-in that always
 * succeeds and keeps the record in memory only (see publishTemplate), so the
 * modal and My Designs can be designed and tested. `publishTemplate` is the
 * single seam the real API will slot into — swap the marked block for the
 * calls and every caller keeps working. The record already carries the serialized document and a thumbnail,
 * which is what that endpoint will want.
 *
 * The thumbnail is the first page rendered to an image (see renderPage), passed
 * in by the modal. It is only a starting point: the dashboard's Edit Template
 * form can replace it later, so it is stored as its own field, not derived.
 */

export const PUBLISHED_TEMPLATES_KEY = "visora.templates.published";
export const TEMPLATE_VISIBILITIES = ["public", "private"];

/* Templates published during this visit, newest first. Memory only: a page
   reload empties it. Saving to localStorage used to fail with "storage is
   full" — a record carries the whole design and a large thumbnail, and the
   browser allows about 5 MB for the whole site. */
const sessionTemplates = [];

/** This visit's templates, then any saved in the browser by older builds. */
export function loadPublishedTemplates(storage = globalThis.localStorage) {
  let stored = [];
  try {
    const value = JSON.parse(storage?.getItem(PUBLISHED_TEMPLATES_KEY));
    if (Array.isArray(value)) stored = value;
  } catch { /* unreadable: treat as none */ }
  return [...sessionTemplates, ...stored];
}

/** Build the record a publish sends, from the live editor state and the form. */
export function buildTemplateRecord({ editor, title, description, visibility, thumbnail }) {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    title: (title || editor.title || "Untitled").trim(),
    description: (description || "").trim(),
    visibility: TEMPLATE_VISIBILITIES.includes(visibility) ? visibility : "private",
    // The local UI treats public submissions as pending until an admin API is connected.
    status: visibility === "public" ? "pending" : "private",
    // The first page as an image; the dashboard can change it later.
    thumbnail: thumbnail || null,
    document: serializeDocument(editor),
    createdAt: now,
    updatedAt: now,
  };
}

/*
 * Publish a template. Resolves with the stored record.
 *
 * TODO(api): replace the stand-in block below with the real calls —
 * upload the thumbnail (POST /storage), save the design (POST /backdrops),
 * then for a public one submit it for review (POST /backdrops/{uuid}/templates).
 * Keep the return shape so the modal and My Designs do not have to change.
 */
export async function publishTemplate(record) {
  // --- stand-in: always succeeds, saves nothing; swap for the API calls ---
  // A short wait, so the modal's "publishing" state can be seen and styled.
  await new Promise((resolve) => setTimeout(resolve, 400));
  sessionTemplates.unshift(record);
  // --- end block ---
  return record;
}
