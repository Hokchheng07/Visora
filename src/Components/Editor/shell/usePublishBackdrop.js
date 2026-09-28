import { useAppDispatch } from "../../redux/hook.js";
import { documentSaved, imageSourcesReplaced } from "../../redux/editorSlice.js";
import { useSubmitPublicationRequestMutation } from "../../API/backdropApi";
import { saveBackdrop } from "../model/saveBackdrop.js";
import { buildTemplateRecord, publishTemplate } from "../model/templatePublish.js";
import { templateCategoryPayload } from "../../Templates/templateCategories.js";

/*
 * Publishing through the API, in the order the server needs:
 *   1. pictures      the thumbnail, and any picture carried inside the design
 *                    as a data: URL, go to POST /storage; only file names are sent on
 *   2. the design    POST /backdrops the first time, PATCH /backdrops/{uuid}
 *                    after that (the editor remembers remoteId and version);
 *                    steps 1 and 2 are saveBackdrop, shared with autosave
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

export function usePublishBackdrop() {
  const dispatch = useAppDispatch();
  const [submitForReview] = useSubmitPublicationRequestMutation();

  return async function publish({ editor, title, description, visibility, thumbnail, categories = [] }) {
    // 1 and 2. Pictures, then the design: the same save autosave makes (see saveBackdrop).
    const { saved, uploaded, thumbnailFile } = await saveBackdrop(dispatch, { editor, name: title, thumbnail });
    dispatch(documentSaved({ remoteId: saved.uuid, version: saved.version, documentKey: editor.documentKey }));
    if (uploaded.size) dispatch(imageSourcesReplaced(Object.fromEntries(uploaded)));

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
