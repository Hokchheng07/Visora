import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Download, X } from "lucide-react";
import { useAppSelector } from "../../redux/hook.js";
import { downloadDocument } from "../model/editorDocument.js";
import pdfIcon from "../../../assets/pages/editor/export/pdf-icon.png";
import jsonIcon from "../../../assets/pages/editor/export/json-icon.png";
import aiIcon from "../../../assets/pages/editor/export/ai-icon.png";

/*
 * Export As dropdown (Figma 1672:92601). JSON is the only format that works
 * today; PDF and Adobe Illustrator are listed so the menu matches the design,
 * but stay disabled until their exporters are planned and built.
 */
const FORMATS = [
  { id: "pdf", icon: pdfIcon, name: "PDF", detail: ["Export as PDF document", "(High quality)"], ready: false },
  { id: "json", icon: jsonIcon, name: "JSON", detail: ["Export as JSON file", "(Editable data)"], ready: true },
  { id: "ai", icon: aiIcon, name: "Adobe Illustrator", detail: ["Export as AI file", "(Vector Format)"], ready: false },
];

export default function EditorExportMenu() {
  const editor = useAppSelector((state) => state.editor);
  const run = (id) => { if (id === "json") downloadDocument(editor); };

  return (
    <Menu>
      {({ close }) => (<>
      <MenuButton className="editor-export" title="Export">
        <Download size={19} aria-hidden="true" /><span>Export</span>
      </MenuButton>
      <MenuItems anchor={{ to: "bottom end", gap: 10, padding: 12 }} className="editor-export-menu" modal={false} transition>
        <div className="editor-export-head">
          <p>Export As</p>
          <button type="button" className="editor-export-close" aria-label="Close export menu" onClick={close}>
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
        <div className="editor-export-options">
          {FORMATS.map((format) => (
            <MenuItem key={format.id} disabled={!format.ready}>
              <button type="button" className="editor-export-option" onClick={() => run(format.id)}
                title={format.ready ? undefined : "Coming soon"}>
                <span className={`editor-export-icon is-${format.id}`}><img src={format.icon} alt="" /></span>
                <span className="editor-export-copy">
                  <strong>{format.name}</strong>
                  <span>{format.detail[0]}<br />{format.detail[1]}</span>
                </span>
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
      </>)}
    </Menu>
  );
}
