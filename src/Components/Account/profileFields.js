import { pictureToUrl } from "./useCurrentUser";

/*
 * The profile page speaks its own language (name, handle, role, bio,
 * location, avatarUrl); the API speaks another (givenName, familyName,
 * username, picture...). These two functions translate between them.
 *
 * role, bio and location have NO field on the server yet, so they are kept
 * in this browser per account until the API gets them (see the report in
 * Documents). Everything else is saved with PUT /users/{uuid}.
 */

const EXTRAS_PREFIX = "visora.profile.extras.v1.";
const EXTRA_FIELDS = ["role", "bio", "location"];

export function readExtras(account, storage = globalThis.localStorage) {
  if (!account) return {};
  try {
    const saved = JSON.parse(storage.getItem(EXTRAS_PREFIX + account));
    return saved && typeof saved === "object"
      ? Object.fromEntries(EXTRA_FIELDS.filter((key) => typeof saved[key] === "string").map((key) => [key, saved[key]]))
      : {};
  } catch {
    return {};
  }
}

export function writeExtras(account, draft, storage = globalThis.localStorage) {
  if (!account) return;
  const extras = Object.fromEntries(EXTRA_FIELDS.map((key) => [key, String(draft?.[key] ?? "")]));
  try { storage.setItem(EXTRAS_PREFIX + account, JSON.stringify(extras)); } catch { /* storage blocked: the extras last this visit */ }
}

// API user -> what the profile page shows.
export function profileFromUser(user, extras = {}, fallback = {}) {
  if (!user) return fallback;
  const name = [user.givenName, user.familyName].filter(Boolean).join(" ");
  return {
    ...fallback,
    ...extras,
    uuid: user.uuid,
    name: name || user.username || user.email || "",
    handle: user.username || "",
    email: user.email || "",
    // `picture` is the storage fileName that is saved; avatarUrl is only for showing it.
    picture: user.picture || "",
    avatarUrl: pictureToUrl(user.picture) || fallback.avatarUrl || "",
  };
}

// What the page edited -> the body PUT /users/{uuid} expects. The server
// requires the whole user, so anything the form does not touch is copied
// from the profile we loaded.
export function updateRequestFromProfile(user, draft) {
  const parts = String(draft.name || "").trim().split(/\s+/).filter(Boolean);
  const givenName = parts[0] || user.givenName || user.username || "";
  const familyName = parts.slice(1).join(" ") || (parts.length > 1 ? "" : user.familyName || "");
  return {
    username: String(draft.handle || user.username || "").trim(),
    givenName,
    familyName,
    // The form has no gender field; the server requires one, so the saved value is kept.
    gender: user.gender || "UNSPECIFIED",
    email: user.email,
    emailVerified: user.emailVerified === true,
    ...(user.phoneNumber ? { phoneNumber: user.phoneNumber } : {}),
    picture: draft.picture ?? user.picture ?? "",
  };
}
