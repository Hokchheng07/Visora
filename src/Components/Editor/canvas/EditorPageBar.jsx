import { AlignCenter, AlignLeft, AlignRight, Bold, Hash, Italic, List, ListOrdered, Sparkles, Underline } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../redux/hook.js";
import { pageBackgroundChanged, pageNumbersChanged, targetChanged } from "../../redux/editorSlice.js";
import { effectiveLocked, pageLabel } from "../model/layerModel.js";
import { normalizePageNumbers } from "../model/pageNumbers.js";
import { normalizePageSize } from "../model/pageSize.js";
import { BULLET_STYLES, isOrderedList, normalizeListStyle, NUMBER_STYLES } from "../model/textLists.js";
import { elementsTarget } from "../inspector/inspectorEdit.js";
import { IconButton, Segmented, Stepper, SwatchButton, ToolPopover } from "../ui/EditorControls.jsx";

/*
 * The bar pinned above the canvas. It follows the selection:
 *   nothing selected   → page settings (background, page numbers, animation)
 *   one text box       → quick text tools (size, style, alignment, colour, lists)
 *   anything else      → hidden; the Customize column has every setting
 * The text tools are shortcuts to settings the Customize column also shows,
 * kept here because type is edited while looking at the words, not the panel.
 */
export default function EditorPageBar({ onAnimate }) {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedIds, gesture, pageNumbers, canvas } = useAppSelector((state) => state.editor);
  const size = normalizePageSize(canvas);
  const page = pages[currentPage];
  if (!selectedIds.length) {
    return <PageProperties page={page} label={pageLabel(page, currentPage)} busy={!!gesture} dispatch={dispatch}
      onAnimate={onAnimate} pageNumbers={pageNumbers} size={size} />;
  }
  const selection = page.elements.filter((element) => selectedIds.includes(element.id));
  if (selection.length === 1 && selection[0].type === "text") {
    return <TextProperties element={selection[0]} pageId={page.id} busy={!!gesture || effectiveLocked(page, selection[0])} dispatch={dispatch} />;
  }
  return null;
}

/* Nothing selected: the bar describes the page. For a backdrop the background
   is most of the design, so it gets a named button rather than a bare chip. */
function PageProperties({ page, label, busy, dispatch, onAnimate, pageNumbers, size }) {
  const background = page.background?.value || "#FFFFFF";
  return (
    <div className="editor-shape-tools" role="group" aria-label="Page settings"
      onPointerDown={(event) => event.stopPropagation()}>
      <div className="editor-toolbar-group">
        {/* The page's own name, so a rename shows here too; falls back to "Page N". */}
        <span className="editor-selected-name" title={label}>{label}</span>
      </div>
      <div className="editor-toolbar-group">
        <SwatchButton label="Background" named value={background} disabled={busy}
          onChange={(value) => dispatch(pageBackgroundChanged({ type: "COLOR", value }))} />
      </div>
      <div className="editor-toolbar-group">
        <PageNumbersMenu settings={pageNumbers} busy={busy} dispatch={dispatch} />
      </div>
      <div className="editor-toolbar-group">
        {/* Read-only for now; the size picker (pageSizeChanged) will live here. */}
        <span className="editor-canvas-size">{size.width} &times; {size.height}</span>
      </div>
      <div className="editor-toolbar-group">
        {/* The same control as Page numbers beside it: icon and word on one line. */}
        <button type="button" className="editor-ctl editor-ctl-trigger" aria-label="Page animation" disabled={busy} onClick={onAnimate}>
          <Sparkles size={16} aria-hidden="true" /><span className="editor-ctl-text">Animate</span>
        </button>
      </div>
    </div>
  );
}

/* One switch for every page, like Google Slides' "Slide numbers". */
function PageNumbersMenu({ settings, busy, dispatch }) {
  const { enabled, position, skipFirst } = normalizePageNumbers(settings);
  const change = (changes) => dispatch(pageNumbersChanged(changes));
  return (
    <ToolPopover label="Page numbers" disabled={busy} className={enabled ? "is-on" : ""}
      trigger={<><Hash size={16} aria-hidden="true" /><span className="editor-ctl-text">Page numbers</span></>}>
      <p className="editor-popover-title">Page numbers</p>
      <button type="button" role="switch" aria-checked={enabled} className="editor-switch-row" disabled={busy}
        onClick={() => change({ enabled: !enabled })}>
        <span>Show on every page</span>
        <span className="editor-switch" aria-hidden="true" />
      </button>
      <Segmented label="Position" value={position} disabled={busy || !enabled} onChange={(next) => change({ position: next })} options={[
        { value: "bottom-left", label: "Left", icon: AlignLeft },
        { value: "bottom-center", label: "Centre", icon: AlignCenter },
        { value: "bottom-right", label: "Right", icon: AlignRight },
      ]} />
      <label className="editor-check-row">
        <input type="checkbox" checked={skipFirst} disabled={busy || !enabled} onChange={(event) => change({ skipFirst: event.target.checked })} />
        <span>Hide on the first page</span>
      </label>
    </ToolPopover>
  );
}

/* One text box selected: the settings people reach for while typing. */
function TextProperties({ element, pageId, busy, dispatch }) {
  const commit = (changes) => dispatch(targetChanged({ target: elementsTarget(pageId, [element.id]), changes }));
  const bold = (element.fontWeight || 400) >= 600;
  const italic = element.fontStyle === "italic";
  const underline = element.textDecoration === "underline";
  const align = element.textAlign || "center";
  return (
    <div className="editor-shape-tools" role="group" aria-label="Text settings"
      onPointerDown={(event) => event.stopPropagation()}>
      <div className="editor-toolbar-group">
        <Stepper label="Font size" value={element.fontSize || 48} min={8} max={400} disabled={busy}
          onChange={(fontSize) => commit({ fontSize })} />
      </div>
      <div className="editor-toolbar-group">
        <IconButton icon={Bold} label="Bold" active={bold} disabled={busy} onClick={() => commit({ fontWeight: bold ? 400 : 700 })} />
        <IconButton icon={Italic} label="Italic" active={italic} disabled={busy} onClick={() => commit({ fontStyle: italic ? "normal" : "italic" })} />
        <IconButton icon={Underline} label="Underline" active={underline} disabled={busy} onClick={() => commit({ textDecoration: underline ? "none" : "underline" })} />
      </div>
      <div className="editor-toolbar-group">
        <IconButton icon={AlignLeft} label="Align left" active={align === "left"} disabled={busy} onClick={() => commit({ textAlign: "left" })} />
        <IconButton icon={AlignCenter} label="Align centre" active={align === "center"} disabled={busy} onClick={() => commit({ textAlign: "center" })} />
        <IconButton icon={AlignRight} label="Align right" active={align === "right"} disabled={busy} onClick={() => commit({ textAlign: "right" })} />
      </div>
      {!element.pageNumber && (
        <div className="editor-toolbar-group">
          <ListMenu value={normalizeListStyle(element.listStyle)} busy={busy} onChange={(listStyle) => commit({ listStyle })} />
        </div>
      )}
      <div className="editor-toolbar-group">
        <SwatchButton label="Text colour" value={element.fill || "#29243a"} disabled={busy} onChange={(fill) => commit({ fill })} />
      </div>
    </div>
  );
}

/* Bullets and numbered lists. The trigger shows which kind is on. */
function ListMenu({ value, busy, onChange }) {
  const ordered = isOrderedList(value);
  const Icon = ordered ? ListOrdered : List;
  const option = (style) => (
    <button type="button" key={style.value} className={`editor-list-option${value === style.value ? " is-on" : ""}`}
      aria-pressed={value === style.value} title={style.label} aria-label={style.label} disabled={busy}
      onClick={() => onChange(value === style.value ? null : style.value)}>
      <span className="editor-list-sample" aria-hidden="true">
        {[1, 2, 3].map((line) => <span key={line}><b>{sampleMarker(style, line)}</b><i /></span>)}
      </span>
    </button>
  );
  return (
    <ToolPopover label="Lists" disabled={busy} className={value ? "is-on" : ""} panelClassName="editor-popover-lists"
      trigger={<Icon size={17} aria-hidden="true" />}>
      <p className="editor-popover-title">Bullets</p>
      <div className="editor-list-grid">{BULLET_STYLES.map(option)}</div>
      <p className="editor-popover-title">Numbered</p>
      <div className="editor-list-grid">{NUMBER_STYLES.map(option)}</div>
      <button type="button" className="editor-list-none" disabled={busy || !value} onClick={() => onChange(null)}>No list</button>
    </ToolPopover>
  );
}

const ROMAN = ["i", "ii", "iii"];
function sampleMarker(style, line) {
  switch (style.value) {
    case "decimal": return `${line}.`;
    case "lower-alpha": return `${"abc"[line - 1]}.`;
    case "upper-alpha": return `${"ABC"[line - 1]}.`;
    case "lower-roman": return `${ROMAN[line - 1]}.`;
    case "upper-roman": return `${ROMAN[line - 1].toUpperCase()}.`;
    default: return style.marker;
  }
}
