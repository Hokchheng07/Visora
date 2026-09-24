// Single source of truth for every env-driven value the admin dashboard
// needs. Nothing else in the app should call `import.meta.env` directly —
// import from here instead, so there is exactly one place to check when a
// URL or key needs to change.
 
function required(name) {
  const value = import.meta.env[name];
  if (!value) {
    // Fails fast at startup in dev instead of silently sending requests to
    // "undefined/api/v1/...".
    throw new Error(`Missing required env var: ${name}. Check your .env file.`);
  }
  return value;
}
 
export const API_BASE_URL = required("VITE_BASE_VISORA_URL");
export const STORAGE_URL = required("VITE_STORAGE_URL");
 
export const firebaseConfig = {
  apiKey: required("VITE_FIREBASE_API_KEY"),
  authDomain: required("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: required("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: required("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: required("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: required("VITE_FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional (GA)
};
 
// Turns a storage-relative path ("templates/abc.png") into a full URL.
// Already-absolute URLs (seed/mock data, external links) pass through.
export function storageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${STORAGE_URL}/${path.replace(/^\/+/, "")}`;
}
 