import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Download, X } from "lucide-react";
import { useAppSelector } from "../../redux/hook.js";
import { exportAi } from "../export/editorAi.js";
import { exportPdf } from "../export/editorPdf.jsx";
import { downloadJson } from "../export/exportJson.js";
import { exportBlockedReason } from "../export/exportRules.js";
import pdfIcon from "../../../assets/pages/editor/export/pdf-icon.png";
import jsonIcon from "../../../assets/pages/editor/export/json-icon.png";
import aiIcon from "../../../assets/pages/editor/export/ai-icon.png";

/*
 * Export As dropdown (Figma 1672:92601).
 *
 * A backdrop that holds a timer is JSON-only. PDF and AI are still pictures,
 * and a timer's value is that it runs — exporting one would save a screenshot
 * of a stopped clock, so those two formats are turned off for such a design
 * and say why rather than silently producing it.
 */
const FORMATS = [
  { id: "pdf", icon: pdfIcon, name: "PDF", detail: ["Export as PDF document", "(High quality)"], ready: true },
  { id: "json", icon: jsonIcon, name: "JSON", detail: ["Export as JSON file", "(Editable data)"], ready: true },
  { id: "ai", icon: aiIcon, name: "Adobe Illustrator", detail: ["Export as AI file", "(Vector Format)"], ready: true },
];

/* How each format is written, and what its notices call the file. The PDF and
   AI exporters count pages as they draw them; JSON has none to count. */
const EXPORTERS = {
  pdf: { label: "PDF", paged: true, run: exportPdf },
  json: { label: "file", paged: false, run: (editor) => downloadJson(editor) },
  ai: { label: "Illustrator file", paged: true, run: exportAi },
};

export default function EditorExportMenu() {
  const editor = useAppSelector((state) => state.editor);
  /* null when idle, otherwise { page, total } — the page being drawn right
     now. A one-page export says "Exporting…" and a longer one counts, so the
     wait on a twenty-page backdrop reads as work rather than as a hang. */
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const busy = progress !== null;

  const plural = (count, noun, many = `${noun}s`) => (count === 1 ? `1 ${noun}` : `${count} ${many}`);
  const missingNotice = (id, count) =>
    `The ${EXPORTERS[id].label} was saved, but ${plural(count, "image")} could not be loaded${id === "json" ? " and are not included" : " and are blank"}.`;
  /* An Illustrator file has vector paths and no filters, so shadows on shapes
     and images cannot come along; saying so beats a file that quietly differs. */
  const effectsNotice = (count) => `The Illustrator file was saved without the shadows on ${plural(count, "layer")}.`;
  /* Text that could not be outlined (a list, a faked bold or italic, a letter
     the font lacks) is placed as a picture; it looks right but will not edit
     as paths, which is worth knowing before opening Illustrator. */
  const textNotice = (count) => `${plural(count, "text box", "text boxes")} ${count === 1 ? "is a picture" : "are pictures"} in the Illustrator file, not outlines.`;

  async function run(id) {
    setError("");
    const exporter = EXPORTERS[id];
    if (!exporter) return;
    /* JSON gathers its photos too, which on a design full of them is a wait
       worth showing; it has no pages to count through, so it says nothing more
       than that it is working. */
    setProgress({ page: 1, total: exporter.paged ? (editor.pages?.length || 1) : 1 });
    try {
      const { missingImages, droppedEffects, textPictures } = await exporter.run(editor, (page, total) => setProgress({ page, total }));
      /* The file is saved either way, so this is a notice and not a failure —
         but it is said out loud, because a missing photo is easy to miss in a
         twenty-page file and impossible to explain later. */
      const notices = [missingImages && missingNotice(id, missingImages), droppedEffects && effectsNotice(droppedEffects),
        textPictures && textNotice(textPictures)].filter(Boolean);
      if (notices.length) setError(notices.join(" "));
    }
    catch (cause) { setError(cause.message || `The ${exporter.label} could not be created.`); }
    finally { setProgress(null); }
  }

  return (
    <Menu>
      {({ close }) => (<>
      {/* Opening the menu clears the last run's notice: it sits over the canvas,
          and the next export is the moment it stops being news. */}
      <MenuButton className="editor-export" title="Export" disabled={busy} onClick={() => setError("")}>
        <Download size={19} aria-hidden="true" /><span>{!busy ? "Export" : progress.total > 1 ? `Exporting ${progress.page}/${progress.total}` : "Exporting…"}</span>
      </MenuButton>
      {error && <p className="editor-export-error" role="alert">{error}</p>}
      <MenuItems anchor={{ to: "bottom end", gap: 10, padding: 12 }} className="editor-export-menu" modal={false} transition>
        <div className="editor-export-head">
          <p>Export As</p>
          <button type="button" className="editor-export-close" aria-label="Close export menu" onClick={close}>
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
        <div className="editor-export-options">
          {FORMATS.map((format) => {
            const blocked = exportBlockedReason(format.id, editor);
            const disabled = !format.ready || !!blocked;
            return (
              <MenuItem key={format.id} disabled={disabled}>
                <button type="button" className="editor-export-option" onClick={() => run(format.id)}
                  title={blocked || (format.ready ? undefined : "Coming soon")}>
                  <span className={`editor-export-icon is-${format.id}`}><img src={format.icon} alt="" /></span>
                  <span className="editor-export-copy">
                    <strong>{format.name}</strong>
                    <span>{blocked || <>{format.detail[0]}<br />{format.detail[1]}</>}</span>
                  </span>
                </button>
              </MenuItem>
            );
          })}
        </div>
      </MenuItems>
      </>)}
    </Menu>
  );
}
