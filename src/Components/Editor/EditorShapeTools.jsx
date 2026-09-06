import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementChanged, elementDeleted, elementReordered } from "../redux/editorSlice.js";
import { shapeName } from "./shapeCatalog.js";

export default function EditorShapeTools() {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedId, gesture } = useAppSelector((state) => state.editor);
  const elements = pages[currentPage].elements;
  const index = elements.findIndex((el) => el.id === selectedId), element = elements[index];
  if (!element) return null;
  return <div className="editor-shape-tools" role="group" aria-label="Selected shape settings" onPointerDown={(event) => event.stopPropagation()}>
    <span className="editor-selected-name">{shapeName(element.shape)}</span>
    <label className="editor-fill-control" title="Shape color"><input type="color" aria-label="Shape color" value={element.fill}
      disabled={!!gesture} onChange={(event) => dispatch(elementChanged({ fill: event.target.value }))} /></label>
    <label className="editor-property-number">Opacity<input type="number" min="0" max="100" aria-label="Shape opacity" key={`opacity-${element.id}-${element.opacity}`}
      defaultValue={Math.round(element.opacity * 100)} disabled={!!gesture}
      onBlur={(event) => { const value = event.target.valueAsNumber; if (Number.isFinite(value)) dispatch(elementChanged({ opacity: Math.max(0, Math.min(100, value)) / 100 })); }}
      onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /><span>%</span></label>
    <label className="editor-property-number">Angle<input type="number" aria-label="Shape angle" key={`rotation-${element.id}-${element.rotation}`}
      defaultValue={Math.round(element.rotation)} disabled={!!gesture}
      onBlur={(event) => { const value = event.target.valueAsNumber; if (Number.isFinite(value)) dispatch(elementChanged({ rotation: ((value % 360) + 360) % 360 })); }}
      onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /><span>°</span></label>
    <button type="button" aria-label="Bring forward" title="Bring forward" disabled={!!gesture || index === elements.length - 1} onClick={() => dispatch(elementReordered(1))}><ArrowUp size={16} /></button>
    <button type="button" aria-label="Send backward" title="Send backward" disabled={!!gesture || index === 0} onClick={() => dispatch(elementReordered(-1))}><ArrowDown size={16} /></button>
    <button type="button" aria-label="Delete shape" title="Delete shape" disabled={!!gesture} onClick={() => dispatch(elementDeleted())}><Trash2 size={16} /></button>
  </div>;
}
