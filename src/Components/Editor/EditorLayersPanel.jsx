import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, ChevronRight, Eye, EyeOff, FileOutput, Group, Layers, Lock, LockOpen, TimerIcon, Trash2, Type, Ungroup } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementDeleted, elementsSelected, elementSelected, groupSelected, groupUngrouped, layersMovedToPage, layersStepped, selectionGrouped, targetChanged } from "../redux/editorSlice.js";
import { ShapeArtwork } from "./EditorElement.jsx";
import { canGroup, effectiveLocked, effectiveVisible, layerLabel, layerRows, pageLabel, selectedGroup, stepLayers } from "./layerModel.js";
import { elementsTarget, groupTarget, pageTarget } from "./inspectorEdit.js";
import { MenuRow, ToolPopover } from "./EditorControls.jsx";
import RenameField from "./RenameField.jsx";
import useLayerDrag from "./useLayerDrag.js";

/*
 * The page's layers, front to back. Every row can be selected, renamed
 * (double-click or F2), hidden, locked, dragged and moved to another page —
 * including hidden and locked layers, which the canvas will not let you click,
 * so this panel is always the way back to them.
 *
 * The list is a real tree for assistive technology: each row is a treeitem
 * carrying its level, selected state and, on groups, whether it is expanded;
 * a group's children live in a nested group container. Only one row is in the
 * tab order at a time (roving tabindex) and the arrow keys move between rows,
 * so a keyboard reaches every layer without tabbing through hundreds of stops.
 *
 * The eye and lock sit at the end of each row and appear on hover or focus;
 * a row that is hidden or locked keeps its icon showing, so its state reads at
 * a glance.
 */

function LayerThumb({ row }) {
  if (row.kind === "group") return <Group size={16} aria-hidden="true" />;
  const { element } = row;
  if (element.type === "text") return <Type size={16} aria-hidden="true" />;
  if (element.type === "timer") return <TimerIcon size={16} aria-hidden="true" />;
  return <ShapeArtwork element={{ ...element, w: 100, h: 100 * element.h / element.w, effects: [], stroke: null, opacity: 1, fillVisible: true }} />;
}

export default function EditorLayersPanel() {
  const dispatch = useAppDispatch();
  const editor = useAppSelector((state) => state.editor);
  const { pages, currentPage, selectedId, selectedIds, gesture } = editor;
  const page = pages[currentPage];
  const [renaming, setRenaming] = useState(null);
  const [collapsed, setCollapsed] = useState([]);
  const [focused, setFocused] = useState(null);
  const listRef = useRef(null);
  const drag = useLayerDrag(listRef);
  const busy = !!gesture;
  const activeGroup = selectedGroup(editor);
  const selection = page.elements.filter((element) => selectedIds.includes(element.id));
  const locked = selection.some((element) => effectiveLocked(page, element));
  const canMove = (direction) => !locked && stepLayers(page, selectedIds, direction, editor.selectionMode) !== page.elements;
  const label = pageLabel(page, currentPage);

  const rows = layerRows(page).filter((row) => !row.depth || !collapsed.includes(row.group.id));
  // Roving tabindex: the remembered row while it exists, otherwise the first one.
  const tabStop = rows.some((row) => row.id === focused) ? focused : rows[0]?.id;

  // Matched in JavaScript rather than through a selector, so an id never has to be escaped.
  const focusRow = (id) => [...(listRef.current?.querySelectorAll("[data-layer-id]") || [])].find((node) => node.dataset.layerId === id)?.focus();
  const select = (row, additive) => dispatch(row.kind === "group" ? groupSelected(row.id) : elementSelected({ id: row.id, additive }));
  const toggleCollapsed = (id) => setCollapsed((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  function rowKeys(event, row) {
    if (event.key === "F2") { event.preventDefault(); setRenaming(row.id); return; }
    const at = rows.indexOf(row);
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step) {
      const next = rows[at + step];
      if (!next) return;
      event.preventDefault();
      // Shift keeps the row you came from selected, so a run of siblings can be picked up.
      if (event.shiftKey && next.kind === "element" && row.kind === "element" && next.element.groupId === row.element.groupId) {
        dispatch(elementsSelected([...new Set([...selectedIds, row.id, next.id])]));
      }
      focusRow(next.id);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); focusRow(event.key === "Home" ? rows[0].id : rows.at(-1).id); return;
    }
    if (event.key === "ArrowRight" && row.kind === "group") {
      event.preventDefault();
      if (collapsed.includes(row.id)) toggleCollapsed(row.id);
      else focusRow(rows[at + 1]?.id ?? row.id);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (row.kind === "group" && !collapsed.includes(row.id)) { toggleCollapsed(row.id); return; }
      if (row.depth) focusRow(row.group.id);
      return;
    }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(row, event.shiftKey || event.metaKey || event.ctrlKey); }
  }

  const pageName = renaming === "page"
    ? <RenameField value={label} label="Page name" className="is-page"
      onCommit={(name) => { dispatch(targetChanged({ target: pageTarget(page.id), changes: { name } })); setRenaming(null); }}
      onCancel={() => setRenaming(null)} />
    : <button type="button" className="editor-layers-page" title="Double-click to rename" disabled={busy}
      onDoubleClick={() => setRenaming("page")} onKeyDown={(event) => { if (event.key === "F2") { event.preventDefault(); setRenaming("page"); } }}>
      {label}
    </button>;

  if (!page.elements.length) return <>
    <div className="editor-layers-head">{pageName}</div>
    <div className="editor-empty-state">
      <span className="editor-empty-icon"><Layers size={28} strokeWidth={1.4} aria-hidden="true" /></span>
      <h3>A fresh canvas</h3><p>Add a shape to start building your design.</p>
    </div>
  </>;

  function renderRow(row) {
    const isGroup = row.kind === "group";
    const item = isGroup ? row.group : row.element;
    const name = isGroup ? item.name : layerLabel(item);
    const target = isGroup ? groupTarget(page.id, item.id) : elementsTarget(page.id, [item.id]);
    const hidden = isGroup ? item.visible === false : !effectiveVisible(page, item);
    const lockedRow = isGroup ? item.locked === true : effectiveLocked(page, item);
    const selected = isGroup ? activeGroup?.id === item.id : !activeGroup && selectedIds.includes(item.id);
    const open = !collapsed.includes(row.id);
    // The row's own flag drives its buttons; inherited state only dims it.
    const ownHidden = item.visible === false, ownLocked = item.locked === true;
    const change = (changes) => dispatch(targetChanged({ target, changes }));
    const stop = (event) => event.stopPropagation();
    const children = isGroup && open ? rows.filter((child) => child.depth && child.group.id === row.id) : [];

    return (
      <li key={row.id} role="none" className="editor-layer-item">
        <div role="treeitem" data-layer-id={row.id} data-layer-kind={row.kind}
          aria-level={row.depth + 1} aria-selected={selected} aria-expanded={isGroup ? open : undefined}
          aria-label={name} tabIndex={row.id === tabStop ? 0 : -1}
          className={`editor-layer-row${selected ? " is-selected" : ""}${hidden ? " is-hidden" : ""}${lockedRow ? " is-locked" : ""}${drag.preview?.ids.includes(row.id) ? " is-dragging" : ""}${drag.preview?.drop?.inside && drag.preview.drop.rowId === row.id ? " is-drop-inside" : ""}`}
          onFocus={() => setFocused(row.id)}
          onPointerDown={(event) => { if (!busy) drag.start(event, row); }}
          onClick={(event) => { if (!busy && !drag.consumeClick(event)) select(row, event.shiftKey || event.metaKey || event.ctrlKey); }}
          onDoubleClick={() => setRenaming(row.id)}
          onKeyDown={(event) => rowKeys(event, row)}>
          {isGroup && <button type="button" className="editor-layer-chevron" tabIndex={-1} disabled={!!drag.preview}
            aria-label={`${open ? "Collapse" : "Expand"} ${name}`} onClick={(event) => { stop(event); toggleCollapsed(row.id); }}>
            <ChevronRight size={14} aria-hidden="true" />
          </button>}
          {renaming === row.id ? (
            <RenameField value={name} label={isGroup ? "Group name" : "Layer name"}
              onCommit={(next) => { change({ name: next }); setRenaming(null); }} onCancel={() => setRenaming(null)} />
          ) : (
            <>
              <span className="editor-layer-swatch" aria-hidden="true"><LayerThumb row={row} /></span>
              <span className="editor-layer-name" title={name}>{name}</span>
            </>
          )}
          <button type="button" className={`editor-layer-toggle${ownHidden ? " is-on" : ""}`} disabled={busy} tabIndex={row.id === tabStop ? 0 : -1}
            aria-label={`${ownHidden ? "Show" : "Hide"} ${name}`} title={ownHidden ? "Show" : "Hide"}
            onClick={(event) => { stop(event); change({ visible: ownHidden }); }}>
            {ownHidden ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
          </button>
          <button type="button" className={`editor-layer-toggle${ownLocked ? " is-on" : ""}`} disabled={busy} tabIndex={row.id === tabStop ? 0 : -1}
            aria-label={`${ownLocked ? "Unlock" : "Lock"} ${name}`} title={ownLocked ? "Unlock" : "Lock"}
            onClick={(event) => { stop(event); change({ locked: !ownLocked }); }}>
            {ownLocked ? <Lock size={15} aria-hidden="true" /> : <LockOpen size={15} aria-hidden="true" />}
          </button>
        </div>
        {!!children.length && <ul role="group" className="editor-layer-children">{children.map(renderRow)}</ul>}
      </li>
    );
  }

  return <>
    <div className="editor-layers-head">{pageName}<span>Front to back</span></div>
    <ul ref={listRef} className="editor-layer-list" role="tree" aria-multiselectable="true" aria-label={`Layers on ${label}`}>
      {rows.filter((row) => !row.depth).map(renderRow)}
    </ul>
    <div className="editor-layer-actions">
      <button type="button" aria-label="Move layer forward" title={locked ? "Unlock to move" : "Move layer forward"} disabled={busy || !canMove("forward")} onClick={() => dispatch(layersStepped({ direction: "forward" }))}><ArrowUp size={17} /></button>
      <button type="button" aria-label="Move layer backward" title={locked ? "Unlock to move" : "Move layer backward"} disabled={busy || !canMove("backward")} onClick={() => dispatch(layersStepped({ direction: "backward" }))}><ArrowDown size={17} /></button>
      <button type="button" aria-label="Group selection" title="Group selection (⌘G)" disabled={busy || !canGroup(page, selectedIds)} onClick={() => dispatch(selectionGrouped())}><Group size={17} /></button>
      {activeGroup && <button type="button" aria-label="Ungroup" title="Ungroup (⇧⌘G)" disabled={busy || locked} onClick={() => dispatch(groupUngrouped())}><Ungroup size={17} /></button>}
      {pages.length > 1 && (
        <ToolPopover label="Move to page" disabled={busy || locked || !selectedIds.length} className="editor-layer-move" panelClassName="editor-popover-list"
          trigger={<FileOutput size={17} aria-hidden="true" />}>
          {({ close }) => pages.map((item, index) => (
            <MenuRow key={item.id} label={`${index + 1} · ${pageLabel(item, index)}`} disabled={index === currentPage}
              onSelect={() => { dispatch(layersMovedToPage({ pageIndex: index })); close(); }} />
          ))}
        </ToolPopover>
      )}
      <button type="button" aria-label="Delete layer" title={locked ? "Unlock to delete" : "Delete layer"} disabled={busy || !selectedId || locked} onClick={() => dispatch(elementDeleted())}><Trash2 size={17} /></button>
    </div>
    {drag.preview && createPortal(<div className="editor-layer-drag-overlay" aria-hidden="true">
      <div className="editor-layer-ghost" style={{ left: drag.preview.x + 14, top: drag.preview.y + 14 }}>{drag.preview.label}</div>
      {drag.preview.drop && !drag.preview.drop.inside && <div className="editor-layer-insertion" style={{ left: drag.preview.drop.left, top: drag.preview.drop.top, width: drag.preview.drop.width }} />}
    </div>, document.body)}
  </>;
}
