import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppStore } from "../../redux/hook.js";
import { selectionPasted } from "../../redux/editorSlice.js";
import { useCurrentUser } from "../../Account/useCurrentUser.js";
import { imageTypeError, useImageUpload } from "../panels/useImageUpload.js";
import { cancelScheduledPaste, clipboardFile } from "./visoraClipboard.js";

/*
 * Paste a picture to upload it.
 *
 * A picture copied anywhere — "Copy image" in a browser, a screenshot sent
 * to the clipboard, a PNG copied out of Figma or Photoshop — is uploaded to
 * the person's storage and placed on the page when they press Cmd/Ctrl+V in
 * the editor, exactly as if they had chosen it with "Upload an image". It
 * goes through the same useImageUpload, so it is checked, shrunk to fit the
 * upload limit, and listed under "Your uploads" the same way.
 *
 * A paste with no picture on the clipboard pastes the layers copied in
 * Visora, as the shortcut always did (see visoraClipboard for how the two
 * are kept apart).
 *
 * Returns { notice, dismissNotice } for the editor to show: uploading, done,
 * or why it failed in words the person can act on — the format, the size
 * limit, or the connection.
 */

// A copied picture usually arrives as "image.png"; that is no name for a layer.
const GENERIC_NAME = /^image\.(png|jpe?g|gif|webp)$/i;
const named = (file) => (GENERIC_NAME.test(file.name || "") || !file.name
  ? new File([file], `Pasted image.${(file.type.split("/")[1] || "png").replace("jpeg", "jpg")}`, { type: file.type })
  : file);

const TITLES = { type: "Unsupported image format", size: "Image is too large", server: "Upload failed" };

export function usePasteImage(isDisplayOpen, shellRef) {
  const dispatch = useAppDispatch(), store = useAppStore();
  const { isSignedIn } = useCurrentUser();
  const { uploadImage } = useImageUpload();
  const [notice, setNotice] = useState(null);
  const dismissNotice = useCallback(() => setNotice(null), []);

  // The listener is added once; these change every render and are read when a paste comes.
  const latest = useRef({ uploadImage, isSignedIn });
  latest.current = { uploadImage, isSignedIn };

  useEffect(() => {
    if (isDisplayOpen) return undefined;

    async function upload(file) {
      const { uploadImage, isSignedIn } = latest.current;
      // Checked first, so a wrong format is said at once, before any "Uploading…" or sign-in prompt.
      const typeError = imageTypeError(file);
      if (typeError) { setNotice({ tone: "error", title: TITLES.type, message: typeError }); return; }
      if (!isSignedIn) {
        setNotice({ tone: "error", title: "Sign in to upload images", message: "Pasted images are saved to your Visora account, so you need to be signed in first." });
        return;
      }

      const picture = named(file);
      setNotice({ tone: "busy", title: "Uploading pasted image…", message: "It will appear on your page in a moment." });
      const result = await uploadImage(picture);
      if (result?.fileName) {
        setNotice({ tone: "success", title: "Image uploaded", message: "It's on your page and saved in Your uploads." });
      } else if (result?.error) {
        setNotice({ tone: "error", title: TITLES[result.reason] || TITLES.server, message: result.error });
      }
    }

    function paste(event) {
      // The same places the editor's shortcuts ignore: typing, and anywhere outside the editor.
      if (event.target.closest?.("input, textarea, select, [contenteditable='true'], [contenteditable='plaintext-only'], [role='menu']")) return;
      if (!shellRef.current?.contains(event.target) && event.target !== document.body) return;
      if (shellRef.current.querySelector(".editor-page-menu") || store.getState().editor.gesture) return;
      // This paste is handled here, so the shortcut's own fallback must not paste too.
      cancelScheduledPaste();
      event.preventDefault();
      const file = clipboardFile(event.clipboardData);
      if (file) upload(file);
      else dispatch(selectionPasted());
    }

    document.addEventListener("paste", paste);
    return () => document.removeEventListener("paste", paste);
  }, [isDisplayOpen, shellRef, dispatch, store]);

  return { notice, dismissNotice };
}
