import { useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react";
import { FileUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook.js";
import { documentLoaded } from "../../redux/editorSlice.js";
import { readDocumentFile } from "../model/editorDocument.js";

/*
 * Import: opens a design exported as JSON (the other half of Export).
 *
 * Loading replaces the whole design and cannot be undone (the undo history
 * belongs to the old design), so when there is anything on the current one
 * this asks first. A file that isn't a Visora design is refused with a
 * message instead of being loaded as a blank page.
 */
export default function EditorImportButton() {
  const dispatch = useAppDispatch();
  const pages = useAppSelector((state) => state.editor.pages);
  const inputRef = useRef(null);
  const [pending, setPending] = useState(null);   // { design, fileName }
  const [error, setError] = useState("");
  const isEmpty = pages.length === 1 && pages[0].elements.length === 0;

  async function onFile(file) {
    if (!file) return;
    try {
      const design = await readDocumentFile(file);
      if (isEmpty) dispatch(documentLoaded(design));
      else setPending({ design, fileName: file.name });
    } catch (err) {
      setError(err.message || "This file couldn't be opened.");
    }
  }

  function confirmImport() {
    // `?.`: the React Compiler reads this while rendering, when nothing is pending.
    if (pending?.design) dispatch(documentLoaded(pending.design));
    setPending(null);
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".json,application/json" hidden
        onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = ""; }} />
      <button type="button" onClick={() => inputRef.current?.click()} aria-label="Import JSON" title="Import a design (JSON)">
        <FileUp size={19} aria-hidden="true" /><span>Import</span>
      </button>

      <Dialog open={!!pending} onClose={() => setPending(null)} className="editor-exit-scrim">
        <DialogPanel className="editor-exit-prompt">
          <DialogTitle as="h2">Replace your current design?</DialogTitle>
          <Description>
            Opening <strong>{pending?.fileName}</strong> replaces everything on your current design, and this can't be undone.
            Export first if you want to keep it.
          </Description>
          <div className="editor-exit-actions">
            <button type="button" onClick={() => setPending(null)} autoFocus>Cancel</button>
            <button type="button" className="editor-exit-keep" onClick={confirmImport}>Replace design</button>
          </div>
        </DialogPanel>
      </Dialog>

      <Dialog open={!!error} onClose={() => setError("")} className="editor-exit-scrim">
        <DialogPanel className="editor-exit-prompt">
          <DialogTitle as="h2">Couldn't open this file</DialogTitle>
          <Description>{error}</Description>
          <div className="editor-exit-actions">
            <button type="button" className="editor-exit-keep" onClick={() => setError("")} autoFocus>OK</button>
          </div>
        </DialogPanel>
      </Dialog>
    </>
  );
}
