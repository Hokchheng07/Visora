import { useRef, useState } from "react";
import { cleanName, NAME_MAX } from "../model/layerModel.js";

/*
 * Inline rename, shared by layer rows, group rows and pages. Enter or leaving
 * the field saves; Escape puts the old name back. An empty or unchanged name
 * saves nothing, so a rename is never an undo step that did nothing.
 */
export default function RenameField({ value, label, className = "", onCommit, onCancel }) {
  const [draft, setDraft] = useState(value);
  const finished = useRef(false);

  function finish(save) {
    // Enter blurs the field too; the second call must not commit again.
    if (finished.current) return;
    finished.current = true;
    const name = cleanName(draft);
    if (save && name && name !== value) onCommit(name);
    else onCancel();
  }

  return (
    <input type="text" className={`editor-rename-field ${className}`} aria-label={label} value={draft} maxLength={NAME_MAX}
      autoFocus spellCheck={false} onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => setDraft(event.target.value)} onBlur={() => finish(true)}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter") { event.preventDefault(); finish(true); }
        if (event.key === "Escape") { event.preventDefault(); finish(false); }
      }} />
  );
}
