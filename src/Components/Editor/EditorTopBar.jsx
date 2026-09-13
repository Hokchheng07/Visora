import { Download, MonitorPlay, Save, Undo2, Redo2 } from "lucide-react";
import { Link } from "react-router";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from '../../theme/ThemeImage';
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { documentRenamed, undo, redo } from "../redux/editorSlice.js";
import { downloadDocument, saveLocalDocument } from "./editorDocument.js";

export default function EditorTopBar({ onDisplay, inert }) {
  const dispatch = useAppDispatch();
  const editor = useAppSelector((state) => state.editor);
  const { past, future, gesture, title } = editor;
  return (
    <header className="editor-topbar" inert={inert}>
      <div className="editor-document">
        <Link to="/" className="editor-home" aria-label="Visora home">
          <ThemeImage src={visoraLogo} alt="Visora" width="140" height="68" />
        </Link>
        <div className="editor-document-name">
          <input aria-label="Design name" defaultValue={title} key={title} onBlur={(event) => dispatch(documentRenamed(event.target.value))}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
        </div>
      </div>
      <div className="editor-topbar-actions" aria-label="Document actions">
        <div className="editor-history-actions">
          <button type="button" aria-label="Undo" title="Undo (⌘/Ctrl Z)" disabled={!past.length || !!gesture} onClick={() => dispatch(undo())}><Undo2 size={18} /></button>
          <button type="button" aria-label="Redo" title="Redo (⌘/Ctrl Shift Z)" disabled={!future.length || !!gesture} onClick={() => dispatch(redo())}><Redo2 size={18} /></button>
        </div>
        <button type="button" onClick={onDisplay} aria-label="Display full screen" title="Display full screen"><MonitorPlay size={19} aria-hidden="true" /><span>Display</span></button>
        <button type="button" onClick={() => saveLocalDocument(editor)} aria-label="Save locally" title="Save locally"><Save size={19} aria-hidden="true" /><span>Save</span></button>
        <button type="button" onClick={() => downloadDocument(editor)} className="editor-export" aria-label="Export JSON" title="Export JSON"><Download size={19} aria-hidden="true" /><span>Export</span></button>
      </div>
    </header>
  );
}
