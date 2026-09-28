import { UPLOAD_LIMIT_BYTES, formatBytes, probablyTooLarge } from "./uploadLimit.js";

/*
 * Turning an RTK Query error into something worth showing.
 *
 * "Upload failed. Please try again." is the wrong message for every cause it
 * is given for: a refused sign-in, a backend nobody can reach, and a file the
 * server thinks is too big all read the same, and trying again fixes none of
 * them. Worse, the one thing the reader needs — whether this is their problem
 * or the server's — is the one thing it leaves out.
 *
 * Spring Security answers 403 with no body at all, so there is nothing to
 * quote; the status is the whole message and it has to be translated here.
 */

/** The server's own words, when it sent any. */
function serverMessage(error) {
  const body = error?.data;
  if (typeof body === "string" && body.trim()) return body.trim();
  return body?.detail || body?.message || null;
}

function validationMessage(detail) {
  if (typeof detail === "string") return detail.trim();
  if (Array.isArray(detail)) return detail.map(validationMessage).filter(Boolean).join("; ");
  if (detail && typeof detail === "object") {
    return Object.entries(detail)
      .map(([field, value]) => {
        const message = validationMessage(value);
        return message ? `${field}: ${message}` : "";
      })
      .filter(Boolean).join("; ");
  }
  return "";
}

/** Registration validation details take priority over a generic error title. */
export function registrationErrorMessage(error) {
  if (error?.status === "FETCH_ERROR") return "Couldn't reach the server. Please try again.";
  return validationMessage(error?.data?.detail)
    || validationMessage(error?.data?.error?.description)
    || validationMessage(error?.data?.message)
    || (typeof error?.data === "string" ? error.data.trim() : "")
    || "Could not create your account. Please check your details and try again.";
}

/**
 * Why an upload failed, in a sentence the reader can act on.
 * `subject` names what was being uploaded, e.g. "photo" or "image";
 * `size` is the file's size in bytes, when known.
 */
export function uploadErrorMessage(error, subject = "image", { size } = {}) {
  if (!error) return `Couldn't upload that ${subject}. Please try again.`;
  const status = error.status;

  /* Checked before FETCH_ERROR: the server's 413 comes without CORS headers,
     so a file that is too big looks exactly like an unreachable server. */
  if (probablyTooLarge(error, size)) {
    return `That ${subject} is too large for the server${size ? ` (${formatBytes(size)})` : ""}. Please choose one under ${formatBytes(UPLOAD_LIMIT_BYTES)}.`;
  }

  /* The request never reached the server, or the answer made no sense. The
     reader can do nothing about a setting, so they are told what they can do,
     and whoever is debugging finds the technical cause in the console. */
  if (status === "FETCH_ERROR") {
    console.warn("[Visora] Upload never reached the server. Check the backend is running and VITE_BASE_VISORA_URL.", error);
    return `Couldn't reach the Visora server, so the ${subject} wasn't uploaded. Check your internet connection and try again.`;
  }
  if (status === "PARSING_ERROR") {
    console.warn(`[Visora] Upload answer could not be read (status ${error.originalStatus}).`, error);
    return `The Visora server gave an unexpected answer, so the ${subject} wasn't uploaded. Please try again in a moment.`;
  }

  /* 401 and 403 arrive here only after the token refresh has already been
     tried and failed, so this is not a stale token: either the session is
     over or the account is not allowed to upload. */
  if (status === 401 || status === 403) {
    return serverMessage(error) || `Your account isn't allowed to upload. Sign in again — and if that doesn't help, the account needs upload permission on the server.`;
  }
  if (status === 404) {
    console.warn("[Visora] Upload service not found (404). Check VITE_BASE_VISORA_URL points at the right backend.", error);
    return `Uploading isn't available right now, so the ${subject} wasn't uploaded. Please try again later.`;
  }
  if (status === 415) return `The server doesn't accept this kind of file. Use a PNG, JPG, WebP or GIF image.`;

  const message = serverMessage(error);
  if (message) return message;
  return Number.isInteger(status)
    ? `Couldn't upload that ${subject} (server said ${status}).`
    : `Couldn't upload that ${subject}. Please try again.`;
}

/**
 * A list request that really failed. This server answers an *empty* list with
 * 404 ("nothing found") instead of 200 and no items, so a 404 on a list means
 * "none yet", not an error — the page should show its empty state, not a warning.
 */
export const listRequestFailed = (error) => !!error && error.status !== 404;
