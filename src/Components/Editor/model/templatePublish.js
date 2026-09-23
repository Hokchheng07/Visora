import { nanoid } from "@reduxjs/toolkit";
import { serializeDocument } from "./editorDocument.js";

/*
 * Publishing a backdrop as a reusable template.
 *
 * There is no template backend yet, so a published template is kept in
 * localStorage and `publishTemplate` is the single seam the real API will slot
 * into — swap the body of the marked block for a POST and every caller keeps
 * working. The record already carries the serialized document and a thumbnail,
 * which is what that endpoint will want.
 *
 * The thumbnail is the first page rendered to an image (see renderPage), passed
 * in by the modal. It is only a starting point: the dashboard's Edit Template
 * form can replace it later, so it is stored as its own field, not derived.
 */

export const PUBLISHED_TEMPLATES_KEY = "visora.templates.published";
export const TEMPLATE_VISIBILITIES = ["public", "team", "private"];

export function loadPublishedTemplates(storage = globalThis.localStorage) {
  if (!storage) return [];
  try {
    const value = JSON.parse(storage.getItem(PUBLISHED_TEMPLATES_KEY));
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

/** Build the record a publish sends, from the live editor state and the form. */
export function buildTemplateRecord({ editor, title, description, visibility, thumbnail }) {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    title: (title || editor.title || "Untitled").trim(),
    description: (description || "").trim(),
    visibility: TEMPLATE_VISIBILITIES.includes(visibility) ? visibility : "public",
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
 * TODO(api): replace the localStorage block below with the template endpoint
 * (e.g. POST /templates with the record). Keep the return shape so the modal
 * and any future dashboard listing do not have to change.
 */
export async function publishTemplate(record, storage = globalThis.localStorage) {
  // --- swap this block for the API call ---
  const existing = loadPublishedTemplates(storage);
  try {
    storage?.setItem(PUBLISHED_TEMPLATES_KEY, JSON.stringify([record, ...existing]));
  } catch {
    throw new Error("Couldn't save the template on this device (storage is full or blocked).");
  }
  // --- end block ---
  return record;
}
