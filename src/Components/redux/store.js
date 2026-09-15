
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../API/baseApi.js";
import editorReducer from "./editorSlice.js";
<<<<<<< HEAD

export const store = configureStore({
=======
import { hydrateDocument, loadLocalDocument, saveLocalDocument } from "../Editor/editorDocument.js";

const savedDocument = loadLocalDocument();

export const store = configureStore({
  preloadedState: savedDocument ? { editor: { ...editorReducer(undefined, { type: "editor/init" }), ...hydrateDocument(savedDocument) } } : undefined,
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
  reducer: {
    editor: editorReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
<<<<<<< HEAD
=======

// Local storage is an offline copy shaped like the documented backdrop payload.
// Session-only selection, clipboard, history, pan and zoom never leak into it.
if (typeof window !== "undefined") {
  let saveTimer = null;
  const flush = () => { if (saveTimer) clearTimeout(saveTimer); saveTimer = null; saveLocalDocument(store.getState().editor); };
  store.subscribe(() => {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(flush, 400);
  });
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
}
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
