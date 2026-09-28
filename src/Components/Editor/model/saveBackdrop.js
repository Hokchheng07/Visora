import { backdropApi } from "../../API/backdropApi";
import { storageApi } from "../../API/storageApi";
import { fitForUpload } from "../../API/uploadLimit.js";
import { serializeDocument } from "./editorDocument.js";
import { dataUrlToFile, inlineImageSources, isInlineImage, replaceImageSources, toBackdropRequest } from "./backdropPayload.js";

/*
 * Saving the editor's design to the account, in the order the server needs:
 *   1. pictures   the thumbnail, and any picture carried inside the design as
 *                 a data: URL, go to POST /storage; only file names are sent on
 *   2. the design POST /backdrops the first time, PATCH /backdrops/{uuid} after
 *
 * Shared by Publish (usePublishBackdrop) and autosave (autosave.js), so a
 * draft and a published design are saved exactly the same way.
 *
 * The server numbers each save (`version`) and refuses a PATCH made against
 * an older number with 409 — the same design saved from another tab, or a
 * save that overtook this one. That is answered by reading the server's
 * number and trying once more, so the newest edit wins. A backdrop that is
 * gone (404) or not this account's (403: a design left in this browser by
 * someone else) is saved as a new one instead, so the work is never lost.
 *
 * Plain functions over `dispatch`, so they run from a React hook and from the
 * store alike.
 */

const fileNameOf = (response) => response?.data?.fileName;

// Shrunk under the server's ~1 MB limit first; a 2x page thumbnail is several MB as PNG.
export async function uploadDataUrl(dispatch, dataUrl, name) {
  const body = new FormData();
  body.append("file", await fitForUpload(dataUrlToFile(dataUrl, name), { maxSide: 1920 }));
  const fileName = fileNameOf(await dispatch(storageApi.endpoints.userUpload.initiate({ userUploadRequest: body })).unwrap());
  if (!fileName) throw new Error("The picture upload did not return a file name.");
  return fileName;
}

/**
 * Saves `editor` (the editor state) as a backdrop named `name`.
 *
 * Returns { saved, uploaded } — the server's backdrop (uuid, version, …) and a
 * Map of each inline picture to the file name it was uploaded as, so the
 * caller can swap them in and not upload them again next time.
 */
export async function saveBackdrop(dispatch, { editor, name, thumbnail = null }) {
  // 1. Pictures.
  const thumbnailFile = isInlineImage(thumbnail) ? await uploadDataUrl(dispatch, thumbnail, "thumbnail") : thumbnail || null;
  let document = { ...serializeDocument(editor), name: String(name || "").trim() || editor.title };
  const uploaded = new Map();
  for (const [index, src] of inlineImageSources(document).entries()) uploaded.set(src, await uploadDataUrl(dispatch, src, `picture-${index + 1}`));
  if (uploaded.size) document = replaceImageSources(document, uploaded);

  // 2. The design.
  const request = toBackdropRequest(document, { thumbnail: thumbnailFile || undefined });
  const patch = (version) => dispatch(backdropApi.endpoints.updateBackdrop.initiate({
    backdropUuid: editor.remoteId, backdropRequest: { ...request, version },
  })).unwrap();

  let saved = null;
  if (editor.remoteId) {
    try {
      saved = (await patch(editor.version))?.data;
    } catch (error) {
      if (error?.status === 409) {
        const latest = (await dispatch(backdropApi.endpoints.getBackdropById.initiate({ backdropUuid: editor.remoteId }, { forceRefetch: true })).unwrap())?.data;
        saved = (await patch(latest?.version))?.data;
      } else if (![403, 404].includes(error?.status)) {
        throw error;
      }
    }
  }
  if (!saved) {
    const { version: _version, ...body } = request;
    saved = (await dispatch(backdropApi.endpoints.createBackdrop.initiate({ backdropRequest: body })).unwrap())?.data;
  }
  if (!saved?.uuid) throw new Error("The server did not return the saved backdrop.");
  return { saved, uploaded, thumbnailFile };
}
