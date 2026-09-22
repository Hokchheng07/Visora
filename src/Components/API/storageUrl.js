/*
 * Building the address of an uploaded file.
 *
 * The base comes from VITE_STORAGE_URL, and Vite writes its value into the
 * bundle at build time. A variable that is not set at that moment does not
 * become empty — it becomes the five letters "undefined", and the address
 * becomes "undefined/a1b2c3.jpg". On a single-page host that is a relative
 * path, so the catch-all rewrite answers it with index.html, the <img> is
 * handed HTML and shows the broken-picture placeholder. Nothing in that chain
 * ever mentions the missing setting, which is why it is checked here instead.
 */

export const STORAGE_URL_VARIABLE = "VITE_STORAGE_URL";

/** True when the base is a usable address rather than a missing setting. */
export const hasStorageBase = (base) =>
  typeof base === "string" && base.trim() !== "" && base !== "undefined" && base !== "null";

/**
 * The file's address, or "" when storage is not configured.
 *
 * Empty is deliberate: a wrong address makes the page fetch itself and look
 * like a deleted upload, and one misleading failure is worse than an obvious
 * one. The caller says storage is unconfigured instead of guessing.
 */
export function storageUrl(base, fileName) {
  if (!hasStorageBase(base) || !fileName) return "";
  return `${String(base).replace(/\/+$/, "")}/${String(fileName).replace(/^\/+/, "")}`;
}
