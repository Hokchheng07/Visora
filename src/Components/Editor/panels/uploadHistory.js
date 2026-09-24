import { useCallback, useEffect, useState } from "react";

/*
 * "Your uploads" in the Images panel.
 *
 * The server has no "list my files" endpoint yet, so the list is kept in this
 * browser (localStorage), one list per account so two people sharing a
 * computer don't see each other's pictures. Only file names and sizes are
 * stored, never the pictures themselves. If the backend adds GET /storage
 * later, this file is the only one that needs to change.
 */

const KEY_PREFIX = "visora.uploads.v1.";
export const MAX_UPLOADS = 60;

function isItem(item) {
  return item && typeof item.fileName === "string" && item.fileName;
}

export function readUploads(account, storage = globalThis.localStorage) {
  if (!account) return [];
  try {
    const list = JSON.parse(storage.getItem(KEY_PREFIX + account));
    return Array.isArray(list) ? list.filter(isItem) : [];
  } catch {
    return [];
  }
}

export function writeUploads(account, list, storage = globalThis.localStorage) {
  if (!account) return;
  try { storage.setItem(KEY_PREFIX + account, JSON.stringify(list)); } catch { /* storage full or blocked: the list lasts this visit */ }
}

// Newest first, no duplicates, capped.
export function addUpload(list, item) {
  if (!isItem(item)) return list;
  return [item, ...list.filter((entry) => entry.fileName !== item.fileName)].slice(0, MAX_UPLOADS);
}

export function removeUpload(list, fileName) {
  return list.filter((entry) => entry.fileName !== fileName);
}

/*
 * Pictures already on the design count as uploads too, so a design opened
 * from an exported JSON, or saved on another day, still shows its images in
 * the panel. They go after the remembered ones. Every picture used on the
 * design is marked inUse: it cannot be removed from the list while it is
 * there, because the design would just put it back.
 */
export function withDocumentImages(list, pages) {
  const used = new Map();
  (pages || []).forEach((page) => page.elements.forEach((element) => {
    // Built-in library elements ("library:…") are not uploads.
    if (element.type === "image" && element.src && !element.src.startsWith("library:") && !used.has(element.src)) used.set(element.src, element);
  }));
  const known = new Set(list.map((entry) => entry.fileName));
  const extra = [...used.values()].filter((element) => !known.has(element.src))
    .map((element) => ({ fileName: element.src, name: element.name || "", width: element.w, height: element.h }));
  return [...list, ...extra].map((entry) => (used.has(entry.fileName) ? { ...entry, inUse: true } : entry));
}

export function useUploadHistory(account) {
  const [uploads, setUploads] = useState(() => readUploads(account));

  // A different person signed in: load their list.
  useEffect(() => { setUploads(readUploads(account)); }, [account]);

  const update = useCallback((change) => {
    setUploads((list) => {
      const next = change(list);
      writeUploads(account, next);
      return next;
    });
  }, [account]);

  return {
    uploads,
    remember: useCallback((item) => update((list) => addUpload(list, item)), [update]),
    forget: useCallback((fileName) => update((list) => removeUpload(list, fileName)), [update]),
  };
}
