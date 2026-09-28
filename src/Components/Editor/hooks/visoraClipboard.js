/*
 * The system clipboard, as far as the editor's paste needs it.
 *
 * Cmd/Ctrl+V has two meanings in the editor: paste the layers copied inside
 * Visora (kept in the editor state, see selectionCopied), or upload a picture
 * copied from anywhere else. Only the browser's `paste` event can see a
 * copied picture, and it sees it without a permission prompt because the
 * person pressed paste themselves.
 *
 * Two things make that work:
 *
 *   - Copying layers in Visora writes a marker to the system clipboard. Without
 *     it, a picture copied earlier would still be sitting there, and pasting
 *     the layers just copied would upload that old picture instead.
 *   - The paste shortcut waits a moment for the `paste` event before pasting
 *     layers. Chrome and Firefox always send the event; Safari sends none when
 *     nothing editable has focus, and the timer is what keeps paste working
 *     there. Whichever comes first, layers are pasted once.
 */

export const CLIPBOARD_MARKER = "visora:layers";

/** Replaces whatever the system clipboard held, so an old copied picture cannot be pasted by mistake. */
export function markClipboard() {
  try { navigator.clipboard?.writeText(CLIPBOARD_MARKER)?.catch?.(() => {}); } catch { /* no clipboard access: nothing to replace */ }
}

/** The first file on the clipboard (usually the one picture copied), or null. */
export function clipboardFile(data) {
  if (!data) return null;
  for (const item of data.items || []) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file) return file;
  }
  return data.files?.[0] || null;
}

// How long the shortcut waits for the browser's paste event. The event
// follows the key in the same moment, so this only matters where it never comes.
const PASTE_EVENT_WAIT_MS = 80;
let pending = null;

/** From the shortcut: paste layers with `run` unless a paste event takes over first. */
export function schedulePaste(run) {
  clearTimeout(pending);
  pending = setTimeout(() => { pending = null; run(); }, PASTE_EVENT_WAIT_MS);
}

/** From the paste event: cancels the shortcut's fallback, so the paste happens once. */
export function cancelScheduledPaste() {
  clearTimeout(pending);
  pending = null;
}
