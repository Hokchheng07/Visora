import { useAppDispatch } from "../../redux/hook.js";
import { documentSaved } from "../../redux/editorSlice.js";
import { useCreateBackdropMutation, useSubmitPublicationRequestMutation, useUpdateBackdropMutation } from "../../API/backdropApi";
import { useUserUploadMutation } from "../../API/storageApi";
import { fitForUpload } from "../../API/uploadLimit.js";
import { serializeDocument } from "../model/editorDocument.js";
import { dataUrlToFile, inlineImageSources, isInlineImage, replaceImageSources, toBackdropRequest } from "../model/backdropPayload.js";
import { buildTemplateRecord, publishTemplate } from "../model/templatePublish.js";
import { templateCategoryPayload } from "../../Templates/templateCategories.js";

/*
 * Publishing through the API, in the order the server needs:
 *   1. pictures      the thumbnail, and any picture carried inside the design
 *                    as a data: URL, go to POST /storage; only file names are sent on
 *   2. the design    POST /backdrops the first time, PATCH /backdrops/{uuid}
 *                    after that (the editor remembers remoteId and version)
 *   3. for review    a public one is then submitted: POST /backdrops/{uuid}/templates,
 *                    which makes a PENDING template for an admin to approve
 * A private one stops after step 2: it is saved to the account, not shared.
 *
 * The finished record is also kept for this visit (publishTemplate), which is
 * how My Designs shows it as pending straight away.
 */

// A failed request, as a sentence the author can act on. `action` names what failed.
export function publishErrorMessage(error, action = "publish") {
  const status = error?.status;
  if (status === "FETCH_ERROR") return "Couldn't reach the server. Check your connection and try again.";
  if (status === 401 || status === 403) return `Your session has ended. Sign in again, then ${action}.`;
  if (status === 413) return "This design is too large for the server to accept.";
  const body = error?.data;
  const said = typeof body === "string" ? body : body?.detail || body?.message;
  if (said) return String(said);
  return Number.isInteger(status) ? `Couldn't ${action} (the server said ${status}).` : `Couldn't ${action}. Please try again.`;
}

const fileNameOf = (response) => response?.data?.fileName;

export function usePublishBackdrop() {
  const dispatch = useAppDispatch();
  const [upload] = useUserUploadMutation();
  const [createBackdrop] = useCreateBackdropMutation();
  const [updateBackdrop] = useUpdateBackdropMutation();
  const [submitForReview] = useSubmitPublicationRequestMutation();

  // Shrunk under the server's ~1 MB limit first; a 2x page thumbnail is several MB as PNG.
  const uploadDataUrl = async (dataUrl, name) => {
    const body = new FormData();
    body.append("file", await fitForUpload(dataUrlToFile(dataUrl, name), { maxSide: 1920 }));
    const fileName = fileNameOf(await upload({ userUploadRequest: body }).unwrap());
    if (!fileName) throw new Error("The picture upload did not return a file name.");
    return fileName;
  };

  return async function publish({ editor, title, description, visibility, thumbnail, categories = [] }) {
    // 1. Pictures.
    const thumbnailFile = isInlineImage(thumbnail) ? await uploadDataUrl(thumbnail, "thumbnail") : null;
    let document = { ...serializeDocument(editor), name: title.trim() || editor.title };
    const inline = inlineImageSources(document);
    if (inline.length) {
      const names = new Map();
      for (const [index, src] of inline.entries()) names.set(src, await uploadDataUrl(src, `picture-${index + 1}`));
      document = replaceImageSources(document, names);
    }

    // 2. The design. A PATCH that the server refuses (deleted, or changed
    //    elsewhere) falls back to a new backdrop rather than losing the publish.
    const request = toBackdropRequest(document, { thumbnail: thumbnailFile || undefined });
    let saved = null;
    if (editor.remoteId) {
      try {
        saved = (await updateBackdrop({ backdropUuid: editor.remoteId, backdropRequest: { ...request, version: editor.version } }).unwrap())?.data;
      } catch (error) {
        if (![404, 409].includes(error?.status)) throw error;
      }
    }
    if (!saved) {
      const { version: _version, ...body } = request;
      saved = (await createBackdrop({ backdropRequest: body }).unwrap())?.data;
    }
    if (!saved?.uuid) throw new Error("The server did not return the saved backdrop.");
    dispatch(documentSaved({ remoteId: saved.uuid, version: saved.version }));

    // 3. For review.
    let template = null;
    if (visibility === "public") {
      const categoryFields = templateCategoryPayload(categories);
      template = (await submitForReview({
        backdropUuid: saved.uuid,
        submitTemplateRequest: {
          proposedName: title.trim(), description: description.trim(),
          ...(categoryFields.eventTypes.length ? categoryFields : {}),
        },
      }).unwrap())?.data;
    }

    const record = {
      ...buildTemplateRecord({ editor, title, description, visibility, thumbnail, categories }),
      backdropUuid: saved.uuid,
      templateUuid: template?.uuid || null,
      thumbnailFileName: thumbnailFile || saved.thumbnail || null,
    };
    return publishTemplate(record);
  };
}
