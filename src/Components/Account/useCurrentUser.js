import { useAppSelector } from "../redux/hook.js";
import { useUserProfileQuery } from "../API/profileApi";
import { getStorageUrl } from "../API/storageApi";

// `picture` is normally a storage fileName ("b88b....png"), but a full link
// (e.g. from Google sign-in) or a data: URL is used as-is.
export function pictureToUrl(picture) {
  if (!picture) return null;
  return /^(https?:|data:|blob:)/.test(picture) ? picture : getStorageUrl(picture);
}

export function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// One place that answers "who is signed in?" for every avatar in the app.
// Signed in = we hold a refresh token. The profile query only runs then, so a
// signed-out visitor never sends a request that is bound to fail.
export function useCurrentUser() {
  const isSignedIn = useAppSelector((state) => Boolean(state.auth.accessToken || state.auth.refreshToken));
  const { data, isLoading, isError } = useUserProfileQuery(undefined, { skip: !isSignedIn });

  // the server wraps the user inside "data" (same envelope as login)
  const user = isSignedIn ? data?.data : undefined;
  const fullName = [user?.givenName, user?.familyName].filter(Boolean).join(" ");
  const displayName = fullName || user?.username || user?.email || "";
  const role = user?.role?.role || "";

  return {
    isSignedIn,
    isLoading: isSignedIn && isLoading,
    isError,
    user,
    displayName,
    initials: initialsOf(displayName),
    pictureUrl: pictureToUrl(user?.picture),
    role,
    isAdmin: /admin/i.test(role),
  };
}
