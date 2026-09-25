/*
 * "Your uploads" in the Images panel.
 *
 * The list comes from the server (GET /storages/{userUuid}, see
 * useUserStorageQuery in storageApi), so it is the same on every computer the
 * person signs in from. These helpers only reshape what the server sends into
 * the tiles the panel draws; they fetch nothing themselves.
 */

// How many files one "Show more" asks for.
export const UPLOADS_PAGE_SIZE = 30;

/*
 * The server's page of files, as tiles: pictures only, newest first.
 * The server keeps any file type and gives no picture size, so a tile has a
 * name but no width/height — imageInserted then uses its default shape.
 */
export function uploadsFromServer(contents) {
  return (Array.isArray(contents) ? contents : [])
    .filter((file) => file && typeof file.fileName === "string" && file.fileName && (!file.mimeType || file.mimeType.startsWith("image/")))
    .map((file) => ({ fileName: file.fileName, name: file.originalFileName || "", uploadedAt: file.createdAt || "" }))
    .sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));
}

// A storage file name, not a picture carried whole inside the design (data:),
// a link to another site, or a built-in library element ("library:…"). Only
// file names can be turned into a /storage/ address; anything else glued onto
// it becomes a broken, sometimes huge, request.
const isStorageFile = (src) => typeof src === "string" && src !== "" && !/^(https?:|data:|blob:|library:)/.test(src);

/*
 * Pictures already on the design count as uploads too, so a design opened
 * from an exported JSON, or saved on another day, still shows its images in
 * the panel. They go after the server's ones. Every picture used on the
 * design is marked inUse.
 */
export function withDocumentImages(list, pages) {
  const used = new Map();
  (pages || []).forEach((page) => page.elements.forEach((element) => {
    if (element.type === "image" && isStorageFile(element.src) && !used.has(element.src)) used.set(element.src, element);
  }));
  const known = new Set(list.map((entry) => entry.fileName));
  const extra = [...used.values()].filter((element) => !known.has(element.src))
    .map((element) => ({ fileName: element.src, name: element.name || "", width: element.w, height: element.h }));
  return [...list, ...extra].map((entry) => (used.has(entry.fileName) ? { ...entry, inUse: true } : entry));
}
