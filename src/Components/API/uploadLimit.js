/*
 * Keeping pictures under the server's upload limit.
 *
 * POST /storage refuses files over about 1 MB (Spring Boot's default
 * multipart limit) with 413. Worse, that refusal arrives without CORS
 * headers, so the browser cannot even read it: the request looks like the
 * server is unreachable. So pictures are made small enough *before* they
 * are sent, and a failure on a file that was still too big is reported as
 * "too large", not as a connection problem (see uploadErrorMessage).
 */

// A little under 1 MiB, leaving room for the multipart wrapping around the file.
export const UPLOAD_LIMIT_BYTES = 1_000_000;

export const formatBytes = (bytes) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`);

/** True when a failed upload of `size` bytes was most likely refused for its size. */
export const probablyTooLarge = (error, size) =>
  error?.status === 413 || (error?.status === "FETCH_ERROR" && Number(size) > UPLOAD_LIMIT_BYTES);

const encode = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * The picture, re-encoded and scaled down step by step until it fits under
 * `maxBytes`. WebP keeps transparency, so logos and stickers stay cut out.
 * A GIF is returned as it is (redrawing it would stop the animation), and so
 * is anything that already fits. Returns the smallest version it could make.
 */
export async function fitForUpload(file, { maxBytes = UPLOAD_LIMIT_BYTES, maxSide = 2560 } = {}) {
  if (!file || file.size <= maxBytes || file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { return file; }
  const baseName = (file.name || "image").replace(/\.[^.]+$/, "");
  let best = file;
  try {
    const firstScale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    for (const scale of [1, 0.8, 0.64, 0.5, 0.4, 0.3]) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * firstScale * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * firstScale * scale));
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.9, 0.8, 0.7]) {
        const blob = await encode(canvas, "image/webp", quality);
        if (!blob) continue;
        if (blob.size < best.size) best = new File([blob], `${baseName}.webp`, { type: blob.type || "image/webp" });
        if (blob.size <= maxBytes) return best;
      }
    }
  } finally {
    bitmap.close?.();
  }
  return best;
}
