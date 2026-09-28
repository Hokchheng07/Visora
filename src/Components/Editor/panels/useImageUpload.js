import { useState } from "react";
import { useUserUploadMutation } from "../../API/storageApi";
import { uploadErrorMessage } from "../../API/apiError.js";
import { fitForUpload, formatBytes, probablyTooLarge, UPLOAD_LIMIT_BYTES } from "../../API/uploadLimit.js";
import { useAppDispatch } from "../../redux/hook.js";
import { imageInserted } from "../../redux/editorSlice.js";

// What the Images panel accepts. Keep this in step with the backend multipart
// limit. If the browser sends a larger body, the proxy can close the request
// before the API returns a 413, which RTK Query can only report as FETCH_ERROR.
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 1024 * 1024; // 1 MB
// Twice the 1920 px page is sharp on any screen; bigger only makes uploads slow.
export const MAX_IMAGE_SIDE = 3840;

// What a file type is called in a message: "SVG", "HEIC", "PDF"… so a refused
// file names what it actually was instead of a MIME type.
const TYPE_NAMES = { "image/svg+xml": "SVG", "image/heic": "HEIC", "image/heif": "HEIF", "image/bmp": "BMP", "image/tiff": "TIFF",
  "image/x-icon": "ICO", "image/vnd.microsoft.icon": "ICO", "image/avif": "AVIF", "application/pdf": "PDF" };
export function fileKind(file) {
  if (TYPE_NAMES[file?.type]) return TYPE_NAMES[file.type];
  const extension = /\.([a-z0-9]+)$/i.exec(file?.name || "")?.[1];
  if (extension) return extension.toUpperCase();
  return file?.type ? file.type.replace(/^.*\//, "").toUpperCase() : "This";
}

/** Why a file cannot be uploaded as an image, before it is sent, or null when it can. */
export function imageTypeError(file) {
  if (IMAGE_TYPES.includes(file?.type)) return null;
  const kind = fileKind(file);
  return `${kind === "This" ? "This file" : `${kind} files`} can't be uploaded. Use a PNG, JPG, WebP or GIF image.`;
}

// Reads the picture's own width and height from the file, before uploading,
// so the new element gets the right shape straight away.
function readImageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const picture = new Image();
    picture.onload = () => { resolve({ width: picture.naturalWidth, height: picture.naturalHeight }); URL.revokeObjectURL(url); };
    picture.onerror = () => { resolve({}); URL.revokeObjectURL(url); };
    picture.src = url;
  });
}

// Makes a very large photo smaller in the browser, before it is sent.
// GIFs are left alone (redrawing would stop the animation), and so is anything
// the browser cannot shrink or that comes out bigger than it went in.
async function shrinkImage(file, size) {
  const longest = Math.max(size.width || 0, size.height || 0);
  if (file.type === "image/gif" || longest <= MAX_IMAGE_SIDE) return { file, size };
  try {
    const scale = MAX_IMAGE_SIDE / longest;
    const width = Math.round(size.width * scale), height = Math.round(size.height * scale);
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type, 0.9));
    if (!blob || blob.size >= file.size) return { file, size };
    return { file: new File([blob], file.name, { type: blob.type }), size: { width, height } };
  } catch {
    return { file, size };
  }
}

/*
 * Upload flow for the editor:
 *   1. check the file (type), shrink a huge photo, check the size
 *   2. send it to POST /storage as FormData  (storageApi → baseApi adds the token)
 *   3. the server answers with a fileName
 *   4. add an image element with that fileName to the page
 *      (and tell the panel, so it can list it under "Your uploads")
 *
 * uploadImage also resolves with what happened — { fileName, name } or
 * { error, reason } — for callers that report it themselves (pasting shows a
 * notification rather than the panel's inline message). `reason` is "type"
 * (a format the server does not take), "size" (over the upload limit) or "server".
 */
export function useImageUpload({ onUploaded, insert = true } = {}) {
  const [uploadRequest, { isLoading }] = useUserUploadMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  // Covers the shrinking too, which happens before the request starts.
  const [busy, setBusy] = useState(false);

  const fail = (message, reason = "server") => { setError(message); return { error: message, reason }; };

  const uploadImage = async (file) => {
    setError("");
    if (!file) return { error: "" };

    // 1. check the file
    const typeError = imageTypeError(file);
    if (typeError) return fail(typeError, "type");

    setBusy(true);
    try {
      const prepared = await shrinkImage(file, await readImageSize(file));
      const size = prepared.size;
      // Re-encoded smaller until it fits the server's ~1 MB limit (see uploadLimit.js).
      // Only an animated GIF can still be too big: redrawing it would stop the animation.
      prepared.file = await fitForUpload(prepared.file, { maxSide: MAX_IMAGE_SIDE });
      if (prepared.file.size > UPLOAD_LIMIT_BYTES) {
        return fail(`That ${file.type === "image/gif" ? "GIF" : "image"} is ${formatBytes(prepared.file.size)}. The upload limit is ${formatBytes(UPLOAD_LIMIT_BYTES)}; please choose a smaller one.`, "size");
      }

      // 2. a file cannot travel as JSON, so it goes in FormData under "file"
      const formData = new FormData();
      formData.append("file", prepared.file);
      const result = await uploadRequest({ userUploadRequest: formData });

      // 3. the server wraps its answer in "data": { data: { fileName, ... } }
      const fileName = result?.data?.data?.fileName;

      if (fileName) {
        // 4. put it on the page (a shape image-fill skips this and takes the fileName from onUploaded)
        if (insert) dispatch(imageInserted(fileName, size, file.name));
        onUploaded?.({ fileName, name: file.name, width: size.width, height: size.height, uploadedAt: Date.now() });
        return { fileName, name: file.name };
      }
      return fail(uploadErrorMessage(result?.error, "image", { size: prepared.file.size }),
        probablyTooLarge(result?.error, prepared.file.size) ? "size" : result?.error?.status === 415 ? "type" : "server");
    } catch (err) {
      console.warn("[Visora] Image upload failed.", err);
      return fail("The image couldn't be prepared for upload. Please try a different image.");
    } finally {
      setBusy(false);
    }
  };

  return { uploadImage, isUploading: busy || isLoading, error };
}
