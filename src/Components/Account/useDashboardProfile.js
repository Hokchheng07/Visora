import { useEffect, useState } from "react";
import { useUpdateUserProfileMutation } from "../API/profileApi";
import { useCurrentUser } from "./useCurrentUser";
import { profileFromUser, readExtras, updateRequestFromProfile, writeExtras } from "./profileFields";

/*
 * The profile the user dashboard shows and edits.
 *
 * Signed in  -> the real account from GET /users/me, saved with
 *               PUT /users/{uuid}.
 * Signed out -> the placeholder profile, edited in memory only, so the page
 *               still works while nobody is logged in.
 */
export function useDashboardProfile(fallbackProfile) {
  const account = useCurrentUser();
  const user = account.user;
  const [updateProfile, { isLoading: isSaving }] = useUpdateUserProfileMutation();
  const [extras, setExtras] = useState({});
  const [guestProfile, setGuestProfile] = useState(fallbackProfile);
  const [error, setError] = useState("");

  // role, bio and location have no field on the server yet; they are remembered per account.
  const accountKey = user?.username || user?.email || "";
  useEffect(() => { setExtras(readExtras(accountKey)); }, [accountKey]);

  const profile = user ? profileFromUser(user, extras, fallbackProfile) : guestProfile;

  async function saveProfile(draft) {
    setError("");
    if (!user) { setGuestProfile(draft); return true; }

    writeExtras(accountKey, draft);
    setExtras(readExtras(accountKey));

    const result = await updateProfile({ uuid: user.uuid, userUpdateRequest: updateRequestFromProfile(user, draft) });
    if (result?.data) return true;

    const detail = result?.error?.data?.detail;
    setError(Array.isArray(detail) ? detail.map((item) => item.reason).join(" ") : detail || result?.error?.data?.message || "Couldn't save your profile. Please try again.");
    return false;
  }

  return { profile, saveProfile, isSaving, isLoading: account.isLoading, isSignedIn: account.isSignedIn, error };
}
