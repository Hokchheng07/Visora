import { Download, MonitorPlay, Pencil, Save, Undo2, Redo2 } from "lucide-react";
import { Link } from "react-router";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from '../../theme/ThemeImage';
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { undo, redo } from "../redux/editorSlice.js";

export default function EditorTopBar({ onDisplay, inert }) {
  const dispatch = useAppDispatch();
  const { past, future, gesture } = useAppSelector((state) => state.editor);
  return (
    <header className="editor-topbar" inert={inert}>
      <div className="editor-document">
        <Link to="/" className="editor-home" aria-label="Visora home">
          <ThemeImage src={visoraLogo} alt="Visora" width="140" height="68" />
        </Link>
        <div className="editor-document-name">
          <span>Untitled-1</span>
          <button type="button" disabled aria-label="Rename design (coming soon)" title="Renaming is coming soon">
            <Pencil size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="editor-topbar-actions" aria-label="Document actions">
        <div className="editor-history-actions">
          <button type="button" aria-label="Undo" title="Undo (⌘/Ctrl Z)" disabled={!past.length || !!gesture} onClick={() => dispatch(undo())}><Undo2 size={18} /></button>
          <button type="button" aria-label="Redo" title="Redo (⌘/Ctrl Shift Z)" disabled={!future.length || !!gesture} onClick={() => dispatch(redo())}><Redo2 size={18} /></button>
        </div>
        <button type="button" onClick={onDisplay} aria-label="Display full screen" title="Display full screen"><MonitorPlay size={19} aria-hidden="true" /><span>Display</span></button>
        <button type="button" disabled aria-label="Save (coming soon)" title="Saving is coming soon"><Save size={19} aria-hidden="true" /><span>Save</span></button>
        <button type="button" disabled className="editor-export" aria-label="Export (coming soon)" title="Export is coming soon"><Download size={19} aria-hidden="true" /><span>Export</span></button>
      </div>
    </header>
  );
}
