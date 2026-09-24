import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../API/config";
 
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
 
// Returns a fresh Firebase ID token for the signed-in admin, or null when
// signed out. `client.js` calls this on every request so a refreshed token
// is always used — Firebase caches internally, so this is cheap.
export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}