import {
  PenTool, AlignCenter, AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical,
  AlignHorizontalSpaceAround, AlignLeft, AlignRight, AlignStartHorizontal, AlignStartVertical,
  AlignVerticalSpaceAround, ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, Bold, Box, Group, Italic, Layers, Lock,
  MoveHorizontal, MoveVertical, TimerIcon, Trash2, Type, Underline, X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { elementDeleted, layersStepped, selectionAligned, selectionDistributed, selectionUnlocked, targetChanged, pointEditFinished, pointEditStarted } from "../redux/editorSlice.js";
import { effectiveLocked, layerLabel, stepLayers, selectedGroup } from "./layerModel.js";
import InspectorGroupBody, { GroupName } from "./InspectorGroupBody.jsx";
import { MenuRow, ToolPopover } from "./EditorControls.jsx";
import InspectorTimerBody from "./InspectorTimerBody.jsx";
import InspectorShapeBody from "./InspectorShapeBody.jsx";
import EffectsSection from "./InspectorEffects.jsx";
import {
  ButtonRow, ColourRow, FontSizeField, InspectorSection, LayoutFields, LiveTextArea, NumberField, ResetStyle, SelectField,
} from "./EditorInspectorFields.jsx";
import { elementsTarget } from "./inspectorEdit.js";

/*
 * The Customize column: every setting for what is selected. With nothing
 * selected there is no column; the page bar above the canvas edits the page.
 *
 * Layout rules, so the column reads as one tool rather than a form:
 *  - A sticky header names the selection and carries the actions people reach
 *    for most — layer order and delete — so they are never at the bottom of a
 *    scroll.
 *  - Few sections, each a real group: everything about letterforms is one
 *    Typography section, colour and opacity are one row, position, size and
 *    rotation are one grid. Sections are separated by a rule, not by space.
 *  - One field anatomy (see EditorInspectorFields). Values that explain
 *    themselves ("Bold", "120 px") carry no extra label; the rest are named by
 *    tooltips and accessible labels instead of helper text.
 *  - Warnings only when they apply: the Khmer font note appears only when the
 *    text actually contains Khmer.
 *
 * `docked` is a grid column (wide screens); otherwise a drawer over the canvas
 * whose close button hides it until the selection changes.
 */

const FONTS = [{ value: "Poppins", label: "Poppins" }, { value: "Freehand", label: "Freehand" }];
const WEIGHTS = [
  { value: "400", label: "Regular" }, { value: "500", label: "Medium" },
  { value: "600", label: "Semi bold" }, { value: "700", label: "Bold" },
];
const KHMER = /[ក-៿᧠-᧿]/;
// Size and weight stay: they come from the heading / subheading / body choice.
const TEXT_STYLE = { fontFamily: "Poppins", fill: "#29243A", fontStyle: "normal", textDecoration: "none", textAlign: "center", lineHeight: 1.2, letterSpacing: 0, opacity: 1 };

function Header({ icon: Icon, title, onClose, children }) {
  return (
    <header className="editor-inspector-head">
      <h2 className="editor-inspector-title"><Icon size={16} aria-hidden="true" /><span>{title}</span></h2>
      <div className="editor-inspector-actions">
        {children}
        {onClose && (
          <button type="button" className="editor-inspector-icon" aria-label="Close Customize" title="Close" onClick={onClose}>
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}

/* Shown under the header while the selection holds a locked layer. Every field
   below is disabled, and this is the one control that is not. */
function LockedNotice({ busy }) {
  const dispatch = useAppDispatch();
  return (
    <div className="editor-inspector-locked" role="status">
      <Lock size={14} aria-hidden="true" />
      <span>Locked — unlock to edit</span>
      <button type="button" disabled={busy} onClick={() => dispatch(selectionUnlocked())}>Unlock</button>
    </div>
  );
}

function LayerMenu({ page, ids, mode, busy }) {
  const dispatch = useAppDispatch();
  // Groups are never split, so "can move" asks the same rule the store uses.
  const top = stepLayers(page, ids, "forward", mode) === page.elements, bottom = stepLayers(page, ids, "backward", mode) === page.elements;
  return (
    <ToolPopover label="Layer order" disabled={busy} className="editor-inspector-icon" panelClassName="editor-popover-list"
      trigger={<Layers size={16} aria-hidden="true" />}>
      <MenuRow icon={ArrowUpToLine} label="Bring to front" shortcut="⌘]" disabled={top} onSelect={() => dispatch(layersStepped({ direction: "front" }))} />
      <MenuRow icon={ArrowUp} label="Bring forward" shortcut="]" disabled={top} onSelect={() => dispatch(layersStepped({ direction: "forward" }))} />
      <MenuRow icon={ArrowDown} label="Send backward" shortcut="[" disabled={bottom} onSelect={() => dispatch(layersStepped({ direction: "backward" }))} />
      <MenuRow icon={ArrowDownToLine} label="Send to back" shortcut="⌘[" disabled={bottom} onSelect={() => dispatch(layersStepped({ direction: "back" }))} />
    </ToolPopover>
  );
}

function DeleteAction({ busy, label = "Delete" }) {
  const dispatch = useAppDispatch();
  return (
    <button type="button" className="editor-inspector-icon is-danger" disabled={busy} aria-label={label} title={`${label} (Delete)`}
      onClick={() => dispatch(elementDeleted())}>
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}

function TextBody({ element, target, busy }) {
  const dispatch = useAppDispatch();
  const commit = (changes) => dispatch(targetChanged({ target, changes }));
  const bold = (element.fontWeight || 400) >= 600;
  const align = element.textAlign || "center";
  return (
    <>
      <InspectorSection title="Text">
        <LiveTextArea className="editor-inspector-textarea" label="Text content" disabled={busy} rows={2}
          value={element.content || ""} target={target} property="content" toChanges={(content) => ({ content })} />
      </InspectorSection>

      <InspectorSection title="Typography">
        <SelectField label="Font" value={element.fontFamily || "Poppins"} disabled={busy} style={{ fontFamily: element.fontFamily }}
          options={FONTS.map((font) => ({ ...font, style: { fontFamily: font.value } }))} onChange={(fontFamily) => commit({ fontFamily })} />
        {KHMER.test(element.content || "") && (
          <p className="editor-inspector-note" role="status">This text is Khmer, but no Khmer font is installed yet, so it may show as boxes.</p>
        )}
        <div className="editor-inspector-grid">
          <SelectField label="Font weight" value={String(element.fontWeight || 400)} options={WEIGHTS} disabled={busy}
            onChange={(weight) => commit({ fontWeight: Number(weight) })} />
          <FontSizeField value={element.fontSize} target={target} disabled={busy} />
        </div>
        <div className="editor-inspector-row">
          <ButtonRow label="Text style" disabled={busy} items={[
            { id: "bold", label: "Bold", icon: Bold, pressed: bold, onClick: () => commit({ fontWeight: bold ? 400 : 700 }) },
            { id: "italic", label: "Italic", icon: Italic, pressed: element.fontStyle === "italic", onClick: () => commit({ fontStyle: element.fontStyle === "italic" ? "normal" : "italic" }) },
            { id: "underline", label: "Underline", icon: Underline, pressed: element.textDecoration === "underline", onClick: () => commit({ textDecoration: element.textDecoration === "underline" ? "none" : "underline" }) },
          ]} />
          <ButtonRow label="Text alignment" disabled={busy} items={[
            { id: "left", label: "Align left", icon: AlignLeft, pressed: align === "left", onClick: () => commit({ textAlign: "left" }) },
            { id: "center", label: "Align centre", icon: AlignCenter, pressed: align === "center", onClick: () => commit({ textAlign: "center" }) },
            { id: "right", label: "Align right", icon: AlignRight, pressed: align === "right", onClick: () => commit({ textAlign: "right" }) },
          ]} />
        </div>
        <div className="editor-inspector-grid">
          <NumberField label="Line height" name={<MoveVertical size={13} />} value={element.lineHeight ?? 1.2} min={0.7} max={3}
            step={0.05} decimals={2} target={target} property="lineHeight" disabled={busy} toChanges={(lineHeight) => ({ lineHeight })} />
          <NumberField label="Letter spacing" name={<MoveHorizontal size={13} />} value={element.letterSpacing ?? 0} min={-20} max={80}
            target={target} property="letterSpacing" disabled={busy} toChanges={(letterSpacing) => ({ letterSpacing })} />
        </div>
      </InspectorSection>

      <InspectorSection title="Colour">
        <ColourRow label="Text colour" value={element.fill} opacity={element.opacity ?? 1} target={target} disabled={busy}
          toChanges={(fill) => ({ fill })} />
      </InspectorSection>

      <InspectorSection title="Layout">
        <LayoutFields element={element} target={target} disabled={busy} />
      </InspectorSection>

      <EffectsSection element={element} target={target} busy={busy} />

      <ResetStyle disabled={busy} onReset={() => commit(TEXT_STYLE)} />
    </>
  );
}

function MultipleBody({ elements, pageId, busy }) {
  const dispatch = useAppDispatch();
  const target = elementsTarget(pageId, elements.map((element) => element.id));
  const opacity = elements[0].opacity ?? 1;
  const mixed = elements.some((element) => (element.opacity ?? 1) !== opacity);
  const align = (edge) => () => dispatch(selectionAligned(edge));
  const few = elements.length < 3;
  return (
    <>
      <InspectorSection title="Align">
        <div className="editor-inspector-row">
          <ButtonRow label="Align horizontally" disabled={busy} items={[
            { id: "left", label: "Align left edges", icon: AlignStartVertical, onClick: align("left") },
            { id: "center", label: "Align centres", icon: AlignCenterVertical, onClick: align("center") },
            { id: "right", label: "Align right edges", icon: AlignEndVertical, onClick: align("right") },
          ]} />
          <ButtonRow label="Align vertically" disabled={busy} items={[
            { id: "top", label: "Align top edges", icon: AlignStartHorizontal, onClick: align("top") },
            { id: "middle", label: "Align middles", icon: AlignCenterHorizontal, onClick: align("middle") },
            { id: "bottom", label: "Align bottom edges", icon: AlignEndHorizontal, onClick: align("bottom") },
          ]} />
        </div>
      </InspectorSection>
      <InspectorSection title="Distribute">
        <div className="editor-inspector-row">
          <ButtonRow label="Distribute" disabled={busy || few} items={[
            { id: "horizontal", label: few ? "Select three or more to space evenly" : "Space evenly across", icon: AlignHorizontalSpaceAround, onClick: () => dispatch(selectionDistributed("horizontal")) },
            { id: "vertical", label: few ? "Select three or more to space evenly" : "Space evenly down", icon: AlignVerticalSpaceAround, onClick: () => dispatch(selectionDistributed("vertical")) },
          ]} />
        </div>
      </InspectorSection>
      <InspectorSection title="Opacity">
        <div className="editor-inspector-grid">
          <NumberField label="Opacity" name="" suffix={mixed ? "% mixed" : "%"} min={0} max={100} value={opacity * 100} target={target}
            property="opacity" disabled={busy} toChanges={(next) => ({ opacity: next / 100 })} />
        </div>
      </InspectorSection>
    </>
  );
}

export default function EditorInspector({ docked, onClose }) {
  const dispatch = useAppDispatch();
  const editor = useAppSelector((state) => state.editor);
  const { pages, currentPage, selectedIds, gesture } = editor;
  const page = pages[currentPage];
  const selection = page.elements.filter((element) => selectedIds.includes(element.id));
  const locked = selection.some((item) => effectiveLocked(page, item));
  // A locked selection keeps the sidebar readable but every control disabled; the store refuses the edits anyway.
  const busy = !!gesture || locked;
  if (!selection.length) return null;

  const [element] = selection;
  const close = docked ? undefined : onClose;
  const group = selectedGroup(editor);
  let header, body;
  if (selection.length > 1 || group) {
    header = <Header icon={group ? Group : Layers} title={group ? <GroupName key={group.id} group={group} pageId={page.id} busy={!!gesture} /> : `${selection.length} elements`} onClose={close}>
      <LayerMenu page={page} ids={selectedIds} mode={editor.selectionMode} busy={busy} /><DeleteAction busy={busy} label={`Delete ${selection.length} elements`} /></Header>;
    const fields = <MultipleBody elements={selection} pageId={page.id} busy={busy} />;
    body = group ? <InspectorGroupBody group={group} busy={busy}>{fields}</InspectorGroupBody> : fields;
  } else {
    const target = elementsTarget(page.id, [element.id]);
    const actions = <><LayerMenu page={page} ids={selectedIds} mode={editor.selectionMode} busy={busy} /><DeleteAction busy={busy} /></>;
    if (element.type === "timer") {
      header = <Header icon={TimerIcon} title={element.name || "Timer"} onClose={close}>{actions}</Header>;
      body = <InspectorTimerBody key={element.id} element={element} pageId={page.id} busy={busy} />;
    } else if (element.type === "text") {
      header = <Header icon={Type} title={element.name || "Text"} onClose={close}>{actions}</Header>;
      body = <TextBody key={element.id} element={element} target={target} busy={busy} />;
    } else {
      const editingPoints = editor.pointEdit?.elementId === element.id;
      /* Editing points gets a Done button in place of the layer actions, like
         Figma's toolbar; otherwise the header offers to start. */
      const pointAction = editingPoints
        ? <button type="button" className="editor-inspector-done" onClick={() => dispatch(pointEditFinished())}>Done</button>
        : <button type="button" className="editor-inspector-icon" aria-label="Edit points" title="Edit points (Enter)" disabled={busy}
          onClick={() => dispatch(pointEditStarted(element.id))}><PenTool size={16} aria-hidden="true" /></button>;
      header = <Header icon={editingPoints ? PenTool : Box} title={editingPoints ? "Vector" : layerLabel(element)} onClose={close}>{pointAction}{!editingPoints && actions}</Header>;
      body = <InspectorShapeBody key={element.id} element={element} target={target} busy={busy} pointKeys={editingPoints ? editor.pointEdit.keys : null} />;
    }
  }

  return (
    <aside id="editor-inspector" className={`editor-inspector${docked ? " is-docked" : " is-drawer"}`} aria-label="Customize">
      {header}
      {locked && <LockedNotice busy={!!gesture} />}
      {body}
    </aside>
  );
}
