import { useSyncExternalStore } from "react";
import { documentLoaded, documentSaved, imageSourcesReplaced } from "../../redux/editorSlice.js";
import { publishErrorMessage } from "../shell/usePublishBackdrop.js";
import { saveBackdrop } from "./saveBackdrop.js";
import { hasContent } from "./draftContent.js";

/*
 * Autosave: every design a signed-in person works on is kept in their
 * account as a draft, the way Canva does it, so leaving the editor — the
 * Visora logo, another page, "New design" — never loses work.
 *
 *   - The first real edit creates the draft (POST /backdrops); from then on it
 *     is in Drafts and Recent like any saved design. Opening the editor and
 *     leaving without touching anything creates nothing.
 *   - After that, a quiet save (PATCH) follows 2.5 seconds after the last
 *     edit, through the same saveBackdrop Publish uses.
 *   - Before a design is replaced — a new design, an import, opening another
 *     one, from the editor or from the dashboard — its unsaved edits are saved
 *     first (the middleware below), so replacing it cannot lose them.
 *   - Leaving the editor saves what is pending and then refreshes the draft's
 *     thumbnail from its first page, so Drafts shows a picture of it.
 *   - The browser's own copy (store.js, every 400 ms) stays as the fallback
 *     for a closed tab or a lost connection; "unsaved" is remembered with it,
 *     so the next visit finishes the save.
 *
 * Nothing here runs for a signed-out visitor: there is no account to save to.
 * Content, for deciding whether anything changed, is the pages, title, page
 * size and page numbers — selection, zoom and undo history are not the design.
 */

const SAVE_DELAY_MS = 2500;
const RETRY_DELAY_MS = 20000;
const SYNC_KEY = "visora.editor.sync.v1";
const contentOf = (editor) => [editor.pages, editor.title, editor.canvas, editor.pageNumbers];
const sameContent = (a, b) => a.every((value, index) => value === b[index]);

function readSync() {
  try { return JSON.parse(globalThis.localStorage?.getItem(SYNC_KEY)) || null; } catch { return null; }
}
function writeSync(value) {
  try { globalThis.localStorage?.setItem(SYNC_KEY, JSON.stringify(value)); } catch { /* storage blocked: this visit still saves */ }
}

let instance = null;

/* Runs before a design is replaced, while the old one is still in the state. */
export const autosaveMiddleware = (api) => (next) => (action) => {
  if (action?.type === documentLoaded.type && instance) instance.beforeReplace(api.getState().editor);
  return next(action);
};

export function createAutosave(store) {
  const signedIn = () => { const auth = store.getState().auth; return Boolean(auth?.accessToken || auth?.refreshToken); };
  const listeners = new Set();
  let status = { state: "idle" };
  const setStatus = (next) => { status = { ...next, at: Date.now() }; listeners.forEach((listener) => listener()); };

  let seen = store.getState().editor;
  const sync = readSync();
  /* Unsaved from last time: the flag says so for this design, or it is a
     design with work in it that was never on the server at all. */
  let dirty = (!!sync?.dirty && (sync.remoteId || null) === (seen.remoteId || null)) || (!seen.remoteId && hasContent(seen));
  let changedDuringSave = false, quiet = false;
  let timer = null, running = null, again = false;
  let wasSignedIn = signedIn();
  // Per design (documentKey): the server's id and number from its latest save,
  // and whether it was saved on this visit (so its thumbnail is worth redoing).
  const lastSaved = new Map();

  const markClean = (editor) => { dirty = false; writeSync({ dirty: false, remoteId: editor.remoteId || null }); };
  const schedule = (delay = SAVE_DELAY_MS) => { clearTimeout(timer); timer = setTimeout(() => { timer = null; save(); }, delay); };

  // The server's newest id and number for this design, which the state may not have caught up with.
  const withLatest = (editor) => {
    const known = lastSaved.get(editor.documentKey);
    return known ? { ...editor, remoteId: known.remoteId, version: known.version } : editor;
  };

  /* One save of one design, as it stood when asked. Its answer is written back
     only to that design (documentSaved checks the key). */
  async function persist(snapshot, { thumbnail = null } = {}) {
    const editor = withLatest(snapshot);
    const { saved, uploaded } = await saveBackdrop(store.dispatch, { editor, name: editor.title, thumbnail });
    lastSaved.set(editor.documentKey, { remoteId: saved.uuid, version: saved.version, saved: true });
    quiet = true;
    try {
      store.dispatch(documentSaved({ remoteId: saved.uuid, version: saved.version, documentKey: editor.documentKey }));
      if (uploaded.size && store.getState().editor.documentKey === editor.documentKey) store.dispatch(imageSourcesReplaced(Object.fromEntries(uploaded)));
    } finally { quiet = false; }
    return saved;
  }

  function failed(error) {
    const offline = error?.status === "FETCH_ERROR" || globalThis.navigator?.onLine === false;
    if (offline) setStatus({ state: "offline", message: "Offline — saved on this device" });
    else if (error?.status === 401) setStatus({ state: "error", message: "Sign in again to keep saving to your account. Your work is saved on this device." });
    else setStatus({ state: "error", message: `${publishErrorMessage(error, "save")} Your work is saved on this device.` });
    console.warn("[Visora] Autosave failed.", error);
    if (error?.status !== 401) schedule(RETRY_DELAY_MS);
  }

  /** Saves the design in the editor now, if it has unsaved work. */
  function save() {
    clearTimeout(timer); timer = null;
    if (running) { again = true; return running; }
    const editor = store.getState().editor;
    if (!dirty || !signedIn()) return Promise.resolve();
    if (!editor.remoteId && !hasContent(editor)) { markClean(editor); return Promise.resolve(); }
    // Mid-drag or mid-typing: the edit is not finished yet.
    if (editor.gesture || editor.edit) { schedule(); return Promise.resolve(); }

    changedDuringSave = false;
    setStatus({ state: "saving" });
    running = persist(editor)
      .then(() => {
        if (!changedDuringSave && store.getState().editor.documentKey === editor.documentKey) markClean(store.getState().editor);
        setStatus({ state: "saved" });
      })
      .catch(failed)
      .finally(() => {
        running = null;
        if (again || (dirty && changedDuringSave)) { again = false; if (dirty) schedule(300); }
      });
    return running;
  }

  store.subscribe(() => {
    const editor = store.getState().editor;
    if (editor.documentKey !== seen.documentKey) {
      // A different design: an imported one that is not on the server yet still needs saving.
      seen = editor;
      dirty = !editor.remoteId && hasContent(editor);
      writeSync({ dirty, remoteId: editor.remoteId || null });
      setStatus({ state: "idle" });
      if (dirty) schedule();
      return;
    }
    const changed = !sameContent(contentOf(editor), contentOf(seen));
    seen = editor;
    const nowSignedIn = signedIn(), justSignedIn = nowSignedIn && !wasSignedIn;
    wasSignedIn = nowSignedIn;
    if (changed && !quiet) {
      dirty = true; changedDuringSave = true;
      writeSync({ dirty: true, remoteId: editor.remoteId || null });
      // Said at once, not after the pause: "Saved" beside a change that is not saved yet would be untrue.
      if (nowSignedIn && (editor.remoteId || hasContent(editor)) && status.state !== "saving") setStatus({ state: "saving" });
      schedule();
    } else if (justSignedIn && dirty && !running) {
      // Signed in just now, with work waiting from before.
      schedule(0);
    }
  });

  globalThis.addEventListener?.("online", () => { if (dirty) schedule(0); });

  instance = {
    save,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getStatus: () => status,

    /* The design is about to be replaced: save its unsaved edits from the
       snapshot, since the state is about to hold another design. */
    beforeReplace(editor) {
      clearTimeout(timer); timer = null;
      if (!dirty || !signedIn() || (!editor.remoteId && !hasContent(editor))) return;
      dirty = false;
      const pending = running || Promise.resolve();
      pending.catch(() => {}).then(() => persist(editor)).catch((error) => console.warn("[Visora] Couldn't save the previous design before replacing it.", error));
    },

    /* Leaving the editor: finish the pending save, then give the draft a
       fresh thumbnail of its first page, if it was saved on this visit. */
    async leave() {
      const editor = store.getState().editor;
      if (!signedIn()) return;
      await save();
      if (!lastSaved.get(editor.documentKey)?.saved) return;
      try {
        const { renderPage } = await import("../export/editorPdf.jsx");
        const thumbnail = await renderPage(editor.pages[0], editor.canvas);
        await persist(editor, { thumbnail });
        lastSaved.set(editor.documentKey, { ...lastSaved.get(editor.documentKey), saved: false });
      } catch (error) {
        console.warn("[Visora] Couldn't refresh the draft's thumbnail.", error);
      }
    },
  };
  // Work left unsaved last time, once someone is signed in to save it to.
  if (dirty && signedIn()) schedule(0);
  return instance;
}

/** The autosave's state for the top bar: idle, saving, saved, offline or error (with `message`). */
export function useAutosaveStatus() {
  return useSyncExternalStore(
    (listener) => instance?.subscribe(listener) || (() => {}),
    () => instance?.getStatus() || IDLE,
    () => IDLE,
  );
}
const IDLE = { state: "idle" };

/** Saves pending work and refreshes the thumbnail; for the editor to call when it closes. */
export const leaveEditor = () => instance?.leave();
