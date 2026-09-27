import { nanoid } from "@reduxjs/toolkit";
import { serializeDocument } from "./editorDocument.js";
import { templateCategoryPayload } from "../../Templates/templateCategories.js";

/*
 * Publishing a backdrop as a reusable template.
 *
 * The API calls live in shell/usePublishBackdrop.js. This file builds the
 * record the modal shows, and keeps each published record for the rest of
 * the visit (publishTemplate) so My Designs can show it as pending at once. The record already carries the serialized document and a thumbnail,
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
export function buildTemplateRecord({ editor, title, description, visibility, thumbnail, categories = [] }) {
  const now = new Date().toISOString();
  const categoryFields = templateCategoryPayload(categories);
  return {
    id: nanoid(),
    title: (title || editor.title || "Untitled").trim(),
    description: (description || "").trim(),
    visibility: TEMPLATE_VISIBILITIES.includes(visibility) ? visibility : "private",
    // The local UI treats public submissions as pending until an admin API is connected.
    status: visibility === "public" ? "pending" : "private",
    categories: categoryFields.eventTypes,
    categoryUuids: categoryFields.categoryUuids,
    category: categoryFields.eventType,
    categoryUuid: categoryFields.categoryUuid,
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
 * Called once the server has accepted it (see usePublishBackdrop).
 */
export async function publishTemplate(record) {
  sessionTemplates.unshift(record);
  return record;
}
