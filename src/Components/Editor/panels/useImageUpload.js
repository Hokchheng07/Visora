import { useState } from "react";
import { useUserUploadMutation } from "../../API/storageApi";
import { useAppDispatch } from "../../redux/hook.js";
import { imageInserted } from "../../redux/editorSlice.js";

// What the Images panel accepts. The server does not publish a limit, so this
// is our own: big enough for a photo, small enough to upload quickly.
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
// Twice the 1920 px page is sharp on any screen; bigger only makes uploads slow.
export const MAX_IMAGE_SIDE = 3840;

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
 */
export function useImageUpload({ onUploaded } = {}) {
  const [uploadRequest, { isLoading }] = useUserUploadMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  // Covers the shrinking too, which happens before the request starts.
  const [busy, setBusy] = useState(false);

  const uploadImage = async (file) => {
    setError("");
    if (!file) return;

    // 1. check the file
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a PNG, JPG, WebP or GIF image.");
      return;
    }

    setBusy(true);
    try {
      const prepared = await shrinkImage(file, await readImageSize(file));
      const size = prepared.size;
      if (prepared.file.size > MAX_IMAGE_BYTES) {
        setError("That image is bigger than 10 MB. Please choose a smaller one.");
        return;
      }

      // 2. a file cannot travel as JSON, so it goes in FormData under "file"
      const formData = new FormData();
      formData.append("file", prepared.file);
      const result = await uploadRequest({ userUploadRequest: formData });

      // 3. the server wraps its answer in "data": { data: { fileName, ... } }
      const fileName = result?.data?.data?.fileName;

      if (fileName) {
        // 4. put it on the page
        dispatch(imageInserted(fileName, size, file.name));
        onUploaded?.({ fileName, name: file.name, width: size.width, height: size.height, uploadedAt: Date.now() });
      } else {
        setError(result?.error?.data?.detail || result?.error?.data?.message || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.log(err);
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return { uploadImage, isUploading: busy || isLoading, error };
}
