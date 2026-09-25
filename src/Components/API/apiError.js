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
 * `subject` names what was being uploaded, e.g. "photo" or "image".
 */
export function uploadErrorMessage(error, subject = "image") {
  if (!error) return `Couldn't upload that ${subject}. Please try again.`;
  const status = error.status;

  // The request never reached the server: wrong address, or nothing running there.
  if (status === "FETCH_ERROR") return `Couldn't reach the server. Check that the backend is running and that VITE_BASE_VISORA_URL is right.`;
  if (status === "PARSING_ERROR") return `The server sent something this app could not read (status ${error.originalStatus}).`;

  /* 401 and 403 arrive here only after the token refresh has already been
     tried and failed, so this is not a stale token: either the session is
     over or the account is not allowed to upload. */
  if (status === 401 || status === 403) {
    return serverMessage(error) || `Your account isn't allowed to upload. Sign in again — and if that doesn't help, the account needs upload permission on the server.`;
  }
  if (status === 404) return `The upload service wasn't found. Check VITE_BASE_VISORA_URL points at the right backend.`;
  if (status === 413) return `The server refused that ${subject} for being too large.`;

  const message = serverMessage(error);
  if (message) return message;
  return Number.isInteger(status)
    ? `Couldn't upload that ${subject} (server said ${status}).`
    : `Couldn't upload that ${subject}. Please try again.`;
}
