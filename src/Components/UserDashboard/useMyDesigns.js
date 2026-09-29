import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "../Account/useCurrentUser";
import { getStorageUrl } from "../API/storageApi";
import { listRequestFailed } from "../API/apiError.js";
import { EDITOR_SCHEMA_VERSION } from "../Editor/model/editorDocument.js";
import { useDeleteBackdropMutation, useDuplicateBackdropMutation, useGetBackdropsQuery, useUpdateBackdropMutation } from "../API/backdropApi";
import { useGetTemplatesQuery, useUpdateTemplateMutation } from "../API/templateApi";
import { useGetCategoriesQuery } from "../API/categoryApi";
import { templateCategoryNames, templateCategoryPayload, templateCategoryUuids } from "../Templates/templateCategories.js";

/*
 * The signed-in account's own designs, for every user-dashboard page.
 *
 * Backdrops come from GET /backdrops. Whether one is Posted, Under review or
 * a Draft is not on the backdrop: it is the review state of the template made
 * from it (GET /templates, matched by sourceBackdropUuid), so the two lists
 * are joined here. The template also carries the category.
 *
 * Trash is a soft delete. The API has no "move to trash" (no status on
 * backdrop update, no archive/restore endpoint), so the trash is kept in this
 * browser per account: only each backdrop's uuid and when it was trashed.
 * Trashed designs are hidden everywhere else; Restore takes them back out;
 * Delete forever is the real DELETE /backdrops/{uuid}.
 */

export const RETENTION_DAYS = 30;
const TRASH_EVENT = "visora-trash-changed";
const trashKey = (owner) => `visora.trash.v1.${owner}`;

function readTrash(owner) {
  if (!owner) return [];
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(trashKey(owner)));
    return Array.isArray(value) ? value.filter((item) => item && typeof item.uuid === "string") : [];
  } catch {
    return [];
  }
}

function writeTrash(owner, list) {
  if (!owner) return;
  try { globalThis.localStorage?.setItem(trashKey(owner), JSON.stringify(list)); } catch { /* blocked: lasts this visit */ }
  globalThis.dispatchEvent?.(new CustomEvent(TRASH_EVENT, { detail: owner }));
}

// Every page using the trash sees a change made on another at once (and in other tabs).
function useTrashList(owner) {
  const [list, setList] = useState(() => readTrash(owner));
  useEffect(() => {
    setList(readTrash(owner));
    const refresh = () => setList(readTrash(owner));
    window.addEventListener(TRASH_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(TRASH_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [owner]);
  const update = useCallback((change) => writeTrash(owner, change(readTrash(owner))), [owner]);
  return [list, update];
}

export const REVIEW_STATES = { APPROVED: "posted", PENDING: "review", REJECTED: "rejected" };
export const REVIEW_LABELS = { posted: "Posted", review: "Under review", rejected: "Rejected", draft: "Draft" };

// The newest submission for each backdrop (one sent for review twice has two).
function latestTemplateByBackdrop(templates) {
  const latest = new Map();
  for (const template of templates) {
    if (!template?.sourceBackdropUuid || template.status === "ARCHIVED") continue;
    const current = latest.get(template.sourceBackdropUuid);
    if (!current || `${template.submittedAt || template.createdAt}` > `${current.submittedAt || current.createdAt}`) {
      latest.set(template.sourceBackdropUuid, template);
    }
  }
  return latest;
}

export function toMyDesign(backdrop, template, categoryNames = new Map()) {
  const pages = backdrop.pageCount || 1;
  const orientation = backdrop.orientation === "PORTRAIT" ? "Portrait" : "Landscape";
  const current = template ? templateCategoryUuids(template).map((uuid) => categoryNames.get(uuid)).filter(Boolean) : [];
  const categories = template ? (current.length ? current : templateCategoryNames(template)) : [];
  const status = template ? REVIEW_STATES[template.templateStatus] || "draft" : "draft";
  return {
    id: backdrop.uuid,
    remoteId: backdrop.uuid,
    version: backdrop.version,
    title: backdrop.name || "Untitled",
    subtitle: `${pages} page${pages === 1 ? "" : "s"} · ${orientation.toLowerCase()}`,
    description: `${pages} page${pages === 1 ? "" : "s"} · ${orientation.toLowerCase()}`,
    categories,
    tags: [
      ...categories.map((label) => ({ label, color: "purple" })),
      ...(backdrop.hasTimer ? [{ label: "Timer", color: "yellow" }] : []),
    ],
    orientation,
    hasTimer: !!backdrop.hasTimer,
    image: backdrop.thumbnail ? getStorageUrl(backdrop.thumbnail) : null,
    status,
    review: status === "draft" ? "" : REVIEW_LABELS[status],
    templateUuid: template?.uuid || null,
    templateVersion: template?.version ?? 0,
    categoryUuids: template ? templateCategoryUuids(template) : [],
    views: 0,
    openedAt: backdrop.lastOpenedAt || backdrop.lastSavedAt || backdrop.updatedAt || backdrop.createdAt,
    savedAt: backdrop.lastSavedAt || backdrop.updatedAt || backdrop.createdAt,
    updatedAt: backdrop.lastSavedAt || backdrop.updatedAt || backdrop.createdAt,
    publishedAt: template?.submittedAt || null,
  };
}

export function useMyDesigns() {
  const { isSignedIn, user } = useCurrentUser();
  const owner = user?.uuid || "";
  const fresh = { skip: !isSignedIn, refetchOnMountOrArgChange: true };
  const list = useGetBackdropsQuery({ pageSize: 100 }, fresh);
  const templateList = useGetTemplatesQuery({ pageSize: 100 }, fresh);
  const { data: categoryPage } = useGetCategoriesQuery(undefined, { skip: !isSignedIn });
  const [trash, updateTrash] = useTrashList(owner);
  const [updateBackdrop] = useUpdateBackdropMutation();
  const [updateTemplate] = useUpdateTemplateMutation();
  const [duplicateBackdrop] = useDuplicateBackdropMutation();
  const [deleteBackdrop] = useDeleteBackdropMutation();

  const all = useMemo(() => {
    const templates = latestTemplateByBackdrop(templateList.data?.data?.contents || []);
    const categoryNames = new Map((categoryPage?.data?.contents || []).map((category) => [category.uuid, category.name]));
    return (list.data?.data?.contents || [])
      .filter((backdrop) => backdrop?.uuid && backdrop.status !== "ARCHIVED")
      .map((backdrop) => toMyDesign(backdrop, templates.get(backdrop.uuid), categoryNames));
  }, [list.data, templateList.data, categoryPage]);

  const trashedAt = useMemo(() => new Map(trash.map((item) => [item.uuid, item.trashedAt])), [trash]);
  const designs = useMemo(() => all.filter((design) => !trashedAt.has(design.remoteId)), [all, trashedAt]);
  const trashed = useMemo(() => all
    .filter((design) => trashedAt.has(design.remoteId))
    .map((design) => ({ ...design, deletedAt: trashedAt.get(design.remoteId) })), [all, trashedAt]);

  // A trashed design deleted elsewhere is dropped from the trash once the list has loaded.
  useEffect(() => {
    if (!list.isSuccess || !trash.length) return;
    const alive = new Set(all.map((design) => design.remoteId));
    if (trash.some((item) => !alive.has(item.uuid))) updateTrash((current) => current.filter((item) => alive.has(item.uuid)));
  }, [list.isSuccess, all, trash, updateTrash]);

  const warn = (what) => () => window.alert(`Couldn't ${what}. Please try again.`);

  const moveToTrash = (design) => updateTrash((current) => [
    ...current.filter((item) => item.uuid !== design.remoteId),
    { uuid: design.remoteId, trashedAt: new Date().toISOString() },
  ]);
  const restore = (design) => updateTrash((current) => current.filter((item) => item.uuid !== design.remoteId));
  const restoreAll = () => updateTrash(() => []);

  const deleteForever = async (design) => {
    try {
      await deleteBackdrop({ backdropUuid: design.remoteId }).unwrap();
    } catch (error) {
      if (error?.status !== 404) { warn(`delete "${design.title}"`)(); return false; }
    }
    restore(design);
    return true;
  };
  const emptyTrash = async () => {
    for (const design of trashed) await deleteForever(design);
  };

  const rename = (design, title) => updateBackdrop({
    backdropUuid: design.remoteId,
    backdropRequest: { clientSchemaVersion: EDITOR_SCHEMA_VERSION, name: title, version: design.version ?? 0 },
  }).unwrap().catch(warn("rename this design"));

  /* Name, description and category, without opening the editor. The name is
     the backdrop's (PATCH /backdrops); a design sent for review also has a
     template, which holds all three (PATCH /templates, only what changed).
     A draft has no template yet: its description and category are chosen
     when it is published. Returns the template answer, or null. */
  const editDetails = async (design, { title, description, categories }) => {
    if (title && title !== design.title) await rename(design, title);
    if (!design.templateUuid) return null;
    const changes = {};
    if (title && title !== design.title) changes.name = title;
    if (description !== undefined && description !== design.templateDescription) changes.description = description;
    const categoryFields = templateCategoryPayload(categories);
    if (categoryFields.categoryUuids.join("|") !== design.categoryUuids.join("|")) Object.assign(changes, categoryFields);
    if (!Object.keys(changes).length) return null;
    return updateTemplate({
      templateUuid: design.templateUuid,
      userUpdateTemplateRequest: { clientSchemaVersion: EDITOR_SCHEMA_VERSION, version: design.templateVersion, ...changes },
    }).unwrap();
  };

  const duplicate = (design, title) => duplicateBackdrop({
    backdropUuid: design.remoteId,
    duplicateBackdropRequest: { name: title || `${design.title} Copy` },
  }).unwrap().catch(warn("duplicate this design"));

  return {
    isSignedIn,
    designs,
    trashed,
    isLoading: list.isLoading,
    failed: listRequestFailed(list.error),
    refetch: list.refetch,
    moveToTrash, restore, restoreAll, deleteForever, emptyTrash, rename, editDetails, duplicate,
  };
}
