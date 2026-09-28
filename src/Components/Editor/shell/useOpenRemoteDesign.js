import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../redux/hook.js";
import { documentLoaded } from "../../redux/editorSlice.js";
import { backdropApi } from "../../API/backdropApi";
import { templateApi } from "../../API/templateApi";
import { EDITOR_SCHEMA_VERSION, hydrateDocument, validateDocument } from "../model/editorDocument.js";
import { PAGE_PRESETS } from "../model/pageSize.js";
import { fromBackdropResponse, toBackdropRequest } from "../model/backdropPayload.js";
import { publishErrorMessage } from "./usePublishBackdrop.js";

/*
 * Opens a design from the server when the editor is reached with
 *   /editor?backdrop=<uuid>   one of your saved backdrops (My Designs)
 *   /editor?template=<uuid>   someone's published template ("Use this template")
 *   /editor?format=<preset>   a new blank design of that size (the dashboard's
 *                             format tiles, e.g. "presentation")
 *
 * Using a template never edits it. Signed in, a copy is saved to your own
 * backdrops first (POST /backdrops with sourceTemplateUuid) and that copy is
 * opened; signed out, it opens as an unsaved local draft.
 *
 * The address is cleaned afterwards, so reloading the page keeps the edits
 * the editor autosaved instead of fetching the server's copy over them.
 */
export function useOpenRemoteDesign() {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const signedIn = useAppSelector((state) => Boolean(state.auth?.accessToken || state.auth?.refreshToken));
  const [status, setStatus] = useState({ busy: false, error: "" });
  const handled = useRef("");
  const backdropUuid = params.get("backdrop"), templateUuid = params.get("template"), format = params.get("format");

  /* A new design of a preset size. The design it replaces is saved first
     (autosave's middleware), so starting afresh never loses the last one. */
  useEffect(() => {
    if (!format) return;
    const preset = PAGE_PRESETS.find((item) => item.id === format || item.id.startsWith(`${format}-`));
    if (preset) dispatch(documentLoaded({ canvas: { width: preset.width, height: preset.height } }));
    setParams((current) => { const next = new URLSearchParams(current); next.delete("format"); return next; }, { replace: true });
  }, [format, dispatch, setParams]);

  useEffect(() => {
    const key = backdropUuid ? `b:${backdropUuid}` : templateUuid ? `t:${templateUuid}` : "";
    if (!key || handled.current === key) return;
    handled.current = key;

    const load = (data, remoteId, version) => {
      const checked = validateDocument(fromBackdropResponse(data));
      if (!checked) throw new Error("This design couldn't be read.");
      const document = hydrateDocument(checked);
      dispatch(documentLoaded({ ...document, remoteId, version: remoteId ? version ?? document.version : 0 }));
    };

    (async () => {
      setStatus({ busy: true, error: "" });
      try {
        if (backdropUuid) {
          const response = await dispatch(backdropApi.endpoints.getBackdropById.initiate({ backdropUuid }, { forceRefetch: true })).unwrap();
          load(response?.data, response?.data?.uuid || backdropUuid, response?.data?.version);
        } else {
          const template = (await dispatch(templateApi.endpoints.getTemplateById.initiate({ templateUuid }, { forceRefetch: true })).unwrap())?.data;
          if (!signedIn) load(template, null);
          else {
            // Through the same translator as a publish, so the server's ids and nulls are left behind.
            const { pages, settings } = toBackdropRequest(fromBackdropResponse(template));
            const copy = (await dispatch(backdropApi.endpoints.createBackdrop.initiate({ backdropRequest: {
              clientSchemaVersion: EDITOR_SCHEMA_VERSION,
              name: template.name || template.proposedName || "Untitled",
              orientation: template.orientation, canvas: template.canvas, pages, settings,
              ...(template.thumbnail ? { thumbnail: template.thumbnail } : {}), sourceTemplateUuid: template.uuid,
            } })).unwrap())?.data;
            // The copy's summary has no pages, so the template's own pages are loaded under the copy's id.
            load(template, copy?.uuid || null, copy?.version);
          }
        }
        setStatus({ busy: false, error: "" });
      } catch (error) {
        setStatus({ busy: false, error: error?.status !== undefined ? publishErrorMessage(error, "open this design") : error?.message || "Couldn't open this design." });
      } finally {
        setParams((current) => { const next = new URLSearchParams(current); next.delete("backdrop"); next.delete("template"); return next; }, { replace: true });
      }
    })();
  }, [backdropUuid, templateUuid, signedIn, dispatch, setParams]);

  return { ...status, dismiss: () => setStatus({ busy: false, error: "" }) };
}
