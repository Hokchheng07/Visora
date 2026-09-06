import { ArrowDown, ArrowUp, Layers, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementSelected, elementReordered, elementDeleted } from "../redux/editorSlice.js";
import { shapeName } from "./shapeCatalog.js";

export default function EditorLayersPanel() {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedId, gesture } = useAppSelector((state) => state.editor);
  const elements = pages[currentPage].elements;
  const selectedIndex = elements.findIndex((el) => el.id === selectedId);
  if (!elements.length) return <div className="editor-empty-state">
    <span className="editor-empty-icon"><Layers size={28} strokeWidth={1.4} aria-hidden="true" /></span>
    <h3>A fresh canvas</h3><p>Add a shape to start building your design.</p>
  </div>;
  return <>
    <p className="editor-panel-description">Front to back · Page {currentPage + 1}</p>
    <div className="editor-layer-list" role="group" aria-label="Page layers">
      {[...elements].reverse().map((el) => <button type="button" key={el.id} className="editor-layer-row"
        aria-pressed={el.id === selectedId} disabled={!!gesture} onClick={() => dispatch(elementSelected(el.id))}>
        <span className={`editor-layer-swatch editor-shape-${el.shape}`} style={{ background: el.fill }} aria-hidden="true" />
        <span>{shapeName(el.shape)}</span>
      </button>)}
    </div>
    <div className="editor-layer-actions">
      <button type="button" aria-label="Move layer forward" title="Move layer forward" disabled={!!gesture || selectedIndex < 0 || selectedIndex === elements.length - 1} onClick={() => dispatch(elementReordered(1))}><ArrowUp size={17} /></button>
      <button type="button" aria-label="Move layer backward" title="Move layer backward" disabled={!!gesture || selectedIndex <= 0} onClick={() => dispatch(elementReordered(-1))}><ArrowDown size={17} /></button>
      <button type="button" aria-label="Delete layer" title="Delete layer" disabled={!!gesture || selectedIndex < 0} onClick={() => dispatch(elementDeleted())}><Trash2 size={17} /></button>
    </div>
  </>;
}
