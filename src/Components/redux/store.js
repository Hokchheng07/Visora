
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../API/baseApi.js";
import editorReducer from "./editorSlice.js";
import { hydrateDocument, loadLocalDocument, saveLocalDocument } from "../Editor/model/editorDocument.js";
import { authSlice } from "./authslice.js";
import { autosaveMiddleware, createAutosave } from "../Editor/model/autosave.js";

const savedDocument = loadLocalDocument();

export const store = configureStore({
  preloadedState: savedDocument ? { editor: { ...editorReducer(undefined, { type: "editor/init" }), ...hydrateDocument(savedDocument) } } : undefined,
  reducer: {
    editor: editorReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, autosaveMiddleware),
});

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
  // The account copy, as a draft; the local copy above stays the fallback.
  createAutosave(store);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
}
