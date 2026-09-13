import {
  AlignCenter, AlignEndHorizontal, AlignHorizontalSpaceAround, AlignLeft, AlignRight,
  AlignStartHorizontal, AlignVerticalSpaceAround, ArrowDown, ArrowDownToLine, ArrowUp,
  ArrowUpToLine, Bold, Italic, MoveHorizontal, Sparkles, Trash2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import {
  elementChanged, elementDeleted, elementReordered, pageAnimationChanged, pageBackgroundChanged,
  selectionAligned, selectionDistributed,
} from "../redux/editorSlice.js";
import { shapeName } from "./shapeCatalog.js";
import { animationPresets } from "./animationPresets.js";
import { IconButton, Segmented, SliderNumber, Stepper, SwatchButton, ToolPopover } from "./EditorControls.jsx";

const FONTS = [
  { value: "Poppins", label: "Poppins" },
  { value: "Freehand", label: "Freehand" },
];
const WEIGHTS = [
  { value: 400, label: "Regular" }, { value: 500, label: "Medium" },
  { value: 600, label: "Semi bold" }, { value: 700, label: "Bold" },
];
const ALIGNMENTS = [
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "center", label: "Centre", icon: AlignCenter },
  { value: "right", label: "Right", icon: AlignRight },
];

/*
 * The property bar. Pinned above the canvas rather than floating over it, so it
 * never covers the band of a 16:9 backdrop where the event title goes.
 *
 * Because it is pinned it can never be empty — a blank 56px row reads as a
 * broken layout — so with nothing selected it describes the page instead of
 * disappearing. Properties only: anything that changes whether an element
 * exists or where it sits in the stack belongs to the bubble and the
 * right-click menu, not here.
 */
export default function EditorShapeTools() {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedId, selectedIds, gesture } = useAppSelector((state) => state.editor);
  const page = pages[currentPage];
  const elements = page.elements;
  const index = elements.findIndex((element) => element.id === selectedId);
  const element = elements[index];
  const busy = !!gesture;

  if (!element) return <PageProperties page={page} number={currentPage + 1} busy={busy} dispatch={dispatch} />;

  const multiple = selectedIds.length > 1;
  const text = element.type === "text" && !multiple;

  return (
    <div className="editor-shape-tools" role="group" aria-label="Selection settings"
      onPointerDown={(event) => event.stopPropagation()}>

      <div className="editor-toolbar-group">
        <span className="editor-selected-name">
          {multiple ? `${selectedIds.length} selected` : text ? "Text" : element.type === "timer" ? "Timer" : shapeName(element.shape)}
        </span>
      </div>

      {text && (
        <>
          <div className="editor-toolbar-group">
            <ToolPopover label="Font" disabled={busy} panelClassName="editor-popover-list"
              trigger={<span className="editor-ctl-text" style={{ fontFamily: element.fontFamily }}>{element.fontFamily}</span>}>
              {FONTS.map((font) => (
                <button type="button" key={font.value} className="editor-menu-row" style={{ fontFamily: font.value }}
                  aria-pressed={element.fontFamily === font.value}
                  onClick={() => dispatch(elementChanged({ fontFamily: font.value }))}>
                  <span>{font.label}</span>
                </button>
              ))}
              <p className="editor-popover-note">Khmer script needs a Khmer face — not installed yet.</p>
            </ToolPopover>
          </div>

          <div className="editor-toolbar-group">
            <Stepper label="Font size" value={element.fontSize} min={8} max={400} disabled={busy}
              onChange={(fontSize) => dispatch(elementChanged({ fontSize }))} />
          </div>

          <div className="editor-toolbar-group">
            <SwatchButton label="Text colour" value={element.fill} disabled={busy}
              onChange={(fill) => dispatch(elementChanged({ fill }))} />
            <IconButton icon={Bold} label="Bold" active={element.fontWeight >= 600} disabled={busy}
              onClick={() => dispatch(elementChanged({ fontWeight: element.fontWeight >= 600 ? 400 : 700 }))} />
            <IconButton icon={Italic} label="Italic" active={element.fontStyle === "italic"} disabled={busy}
              onClick={() => dispatch(elementChanged({ fontStyle: element.fontStyle === "italic" ? "normal" : "italic" }))} />
          </div>

          <div className="editor-toolbar-group">
            <ToolPopover label="Alignment" disabled={busy}
              trigger={<AlignCenter size={18} aria-hidden="true" />}>
              <Segmented label="Align" value={element.textAlign} options={ALIGNMENTS}
                onChange={(textAlign) => dispatch(elementChanged({ textAlign }))} />
            </ToolPopover>

            <ToolPopover label="Spacing" disabled={busy}
              trigger={<MoveHorizontal size={18} aria-hidden="true" />}>
              <SliderNumber label="Letter spacing" value={element.letterSpacing} min={-20} max={80} step={1}
                onChange={(letterSpacing) => dispatch(elementChanged({ letterSpacing }))} />
              <SliderNumber label="Line spacing" value={element.lineHeight} min={0.7} max={3} step={0.05}
                onChange={(lineHeight) => dispatch(elementChanged({ lineHeight }))} />
              <div className="editor-field">
                <div className="editor-field-head"><span>Weight</span></div>
                <div className="editor-segmented" role="group" aria-label="Font weight">
                  {WEIGHTS.map((weight) => (
                    <button type="button" key={weight.value} aria-pressed={element.fontWeight === weight.value}
                      className={element.fontWeight === weight.value ? "is-on" : ""}
                      onClick={() => dispatch(elementChanged({ fontWeight: weight.value }))}>{weight.value}</button>
                  ))}
                </div>
              </div>
            </ToolPopover>
          </div>
        </>
      )}

      {!text && !multiple && element.type !== "timer" && (
        <div className="editor-toolbar-group">
          <SwatchButton label="Fill" value={element.fill} disabled={busy}
            onChange={(fill) => dispatch(elementChanged({ fill }))} />
          <ToolPopover label="Opacity" disabled={busy}
            trigger={<span className="editor-ctl-text editor-ctl-num">{Math.round((element.opacity ?? 1) * 100)}%</span>}>
            <SliderNumber label="Opacity" value={(element.opacity ?? 1) * 100} min={0} max={100} step={1} suffix="%"
              onChange={(next) => dispatch(elementChanged({ opacity: next / 100 }))} />
          </ToolPopover>
        </div>
      )}

      {multiple && (
        <>
          <div className="editor-toolbar-group">
            <IconButton icon={AlignLeft} label="Align left" disabled={busy} onClick={() => dispatch(selectionAligned("left"))} />
            <IconButton icon={AlignCenter} label="Align centre" disabled={busy} onClick={() => dispatch(selectionAligned("center"))} />
            <IconButton icon={AlignRight} label="Align right" disabled={busy} onClick={() => dispatch(selectionAligned("right"))} />
            <ToolPopover label="More alignment" disabled={busy} trigger={<AlignStartHorizontal size={18} aria-hidden="true" />}>
              <div className="editor-field">
                <div className="editor-field-head"><span>Vertical</span></div>
                <div className="editor-segmented" role="group" aria-label="Vertical alignment">
                  <button type="button" title="Align top" onClick={() => dispatch(selectionAligned("top"))}><AlignStartHorizontal size={15} /></button>
                  <button type="button" title="Align middle" onClick={() => dispatch(selectionAligned("middle"))}><AlignCenter size={15} /></button>
                  <button type="button" title="Align bottom" onClick={() => dispatch(selectionAligned("bottom"))}><AlignEndHorizontal size={15} /></button>
                </div>
              </div>
            </ToolPopover>
          </div>
          {selectedIds.length > 2 && (
            <div className="editor-toolbar-group">
              <IconButton icon={AlignHorizontalSpaceAround} label="Distribute horizontally" disabled={busy}
                onClick={() => dispatch(selectionDistributed("horizontal"))} />
              <IconButton icon={AlignVerticalSpaceAround} label="Distribute vertically" disabled={busy}
                onClick={() => dispatch(selectionDistributed("vertical"))} />
            </div>
          )}
        </>
      )}

      <div className="editor-toolbar-group">
        <ToolPopover label="Position" disabled={busy || multiple} trigger={<span className="editor-ctl-text">Position</span>}>
          <button type="button" className="editor-menu-row" disabled={index === elements.length - 1}
            onClick={() => dispatch(elementReordered(elements.length))}><ArrowUpToLine size={16} /><span>Bring to front</span></button>
          <button type="button" className="editor-menu-row" disabled={index === elements.length - 1}
            onClick={() => dispatch(elementReordered(1))}><ArrowUp size={16} /><span>Bring forward</span><kbd>]</kbd></button>
          <button type="button" className="editor-menu-row" disabled={index === 0}
            onClick={() => dispatch(elementReordered(-1))}><ArrowDown size={16} /><span>Send backward</span><kbd>[</kbd></button>
          <button type="button" className="editor-menu-row" disabled={index === 0}
            onClick={() => dispatch(elementReordered(-elements.length))}><ArrowDownToLine size={16} /><span>Send to back</span></button>
        </ToolPopover>
      </div>

      <div className="editor-toolbar-group">
        <IconButton icon={Trash2} label="Delete" shortcut="Delete" className="editor-delete-selection"
          disabled={busy} onClick={() => dispatch(elementDeleted())} />
      </div>
    </div>
  );
}

/* Nothing selected: the bar describes the page. For a backdrop the background
   is most of the design, so it gets a named button rather than a bare chip. */
function PageProperties({ page, number, busy, dispatch }) {
  const background = page.background?.value || "#FFFFFF";
  const preset = page.animation?.preset || "none";
  return (
    <div className="editor-shape-tools" role="group" aria-label="Page settings"
      onPointerDown={(event) => event.stopPropagation()}>
      <div className="editor-toolbar-group">
        <span className="editor-selected-name">Page {number}</span>
      </div>
      <div className="editor-toolbar-group">
        <SwatchButton label="Background" named value={background} disabled={busy}
          onChange={(value) => dispatch(pageBackgroundChanged({ type: "COLOR", value }))} />
      </div>
      <div className="editor-toolbar-group">
        <span className="editor-canvas-size">1920 &times; 1080</span>
      </div>
      <div className="editor-toolbar-group">
        <ToolPopover label="Page animation" disabled={busy} panelClassName="editor-popover-list"
          trigger={<><Sparkles size={16} aria-hidden="true" /><span className="editor-ctl-text">Animate</span></>}>
          {animationPresets.map((item) => (
            <button type="button" key={item.id} className="editor-menu-row" aria-pressed={preset === item.id}
              onClick={() => dispatch(pageAnimationChanged(item.id))}>
              <span>{item.label}</span>
            </button>
          ))}
        </ToolPopover>
      </div>
    </div>
  );
}
