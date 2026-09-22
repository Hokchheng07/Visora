import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignHorizontalSpaceAround,
  AlignStartHorizontal, AlignStartVertical, AlignVerticalSpaceAround, MoreHorizontal, Scan,
} from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { targetChanged } from "../../redux/editorSlice.js";
import { ButtonRow, FieldLabel, InspectorSection, NumberField } from "./EditorInspectorFields.jsx";
import { MenuRow, ToolPopover } from "../ui/EditorControls.jsx";
import {
  alignNodes, distributeNodes, editableSubpaths, localToPage, moveNodes, pageDeltaToLocal, parseKey,
  pointsBounds, setCornerRadius, setMirroring, sharedValue, validKeys, vectorChanges,
} from "../model/vectorEdit.js";

/*
 * The sidebar while a shape's points are edited, laid out as Figma's Vector
 * panel: alignment of the picked points, their position, how their handles
 * mirror, and their own corner radius. Fill, stroke and effects stay below it.
 *
 * Every control works on the picked points and is disabled with none picked;
 * each change is the whole new outline, sent once, so it is one undo step.
 */

/* Figma's three mirroring marks, drawn for this control: the curve through a
   point, the point, and its two handles with their end dots.
     No mirroring            the handles bend away at different angles
     Mirror angle            one straight line, one handle shorter
     Mirror angle and length one straight line, both handles equal */
const MARKS = {
  none: { left: [6, 11], right: [24.5, 3.5] },
  angle: { left: [10, 7], right: [26.5, 7] },
  "angle-and-length": { left: [3.5, 7], right: [26.5, 7] },
};
// Drawn wide and short, like Figma's: a 30 × 20 mark so the handles have room to read.
function MirrorMark(kind) {
  const { left, right } = MARKS[kind];
  return function Mark() {
    return (
      <svg viewBox="0 0 30 20" fill="none" aria-hidden="true" className="editor-mirror-mark">
        <path d="M4 18C7 11 10 7 15 7S23 11 26 18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".35" />
        <path d={`M${left[0]} ${left[1]}L15 7L${right[0]} ${right[1]}`} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={left[0]} cy={left[1]} r="1.6" fill="currentColor" />
        <circle cx={right[0]} cy={right[1]} r="1.6" fill="currentColor" />
        <rect x="13.2" y="5.2" width="3.6" height="3.6" rx=".8" className="editor-mirror-node" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  };
}
const MIRROR_OPTIONS = [
  { id: "none", label: "No mirroring", icon: MirrorMark("none") },
  { id: "angle", label: "Mirror angle", icon: MirrorMark("angle") },
  { id: "angle-and-length", label: "Mirror angle and length", icon: MirrorMark("angle-and-length") },
];

export default function InspectorVectorSection({ element, target, keys, busy }) {
  const dispatch = useAppDispatch();
  const subpaths = editableSubpaths(element);
  const picked = validKeys(subpaths, keys);
  const none = busy || !picked.length;
  const change = (next) => dispatch(targetChanged({ target, changes: vectorChanges(element, next) }));
  const changesFor = (next) => vectorChanges(element, next);

  // Position of one point, or of the picked points' top-left corner, in page pixels.
  const bounds = pointsBounds(subpaths, picked);
  const origin = bounds ? localToPage(element, picked.length === 1
    ? subpaths[parseKey(picked[0]).subpath][parseKey(picked[0]).node]
    : { x: bounds.left, y: bounds.top }) : null;
  const moveTo = (axis) => (value) => {
    const delta = pageDeltaToLocal(element, axis === "x" ? value - origin.x : 0, axis === "y" ? value - origin.y : 0);
    return changesFor(moveNodes(subpaths, picked, delta.dx, delta.dy));
  };

  const mirroring = sharedValue(subpaths, picked, (node) => node.mirroring || "none");
  const radius = sharedValue(subpaths, picked, (node) => node.cornerRadius || 0);
  const align = (edge) => () => change(alignNodes(subpaths, picked, edge));

  return (
    <InspectorSection title="Vector">
      <FieldLabel>Alignment</FieldLabel>
      <div className="editor-inspector-row">
        <ButtonRow label="Align points horizontally" disabled={busy || picked.length < 2} items={[
          { id: "left", label: "Align points left", icon: AlignStartVertical, onClick: align("left") },
          { id: "center", label: "Align points to centre", icon: AlignCenterVertical, onClick: align("center") },
          { id: "right", label: "Align points right", icon: AlignEndVertical, onClick: align("right") },
        ]} />
        <ButtonRow label="Align points vertically" disabled={busy || picked.length < 2} items={[
          { id: "top", label: "Align points top", icon: AlignStartHorizontal, onClick: align("top") },
          { id: "middle", label: "Align points to middle", icon: AlignCenterHorizontal, onClick: align("middle") },
          { id: "bottom", label: "Align points bottom", icon: AlignEndHorizontal, onClick: align("bottom") },
        ]} />
        <ToolPopover label="Distribute points" disabled={busy || picked.length < 3} className="editor-inspector-icon" panelClassName="editor-popover-list"
          anchor="bottom end" trigger={<MoreHorizontal size={15} aria-hidden="true" />}>
          <MenuRow icon={AlignHorizontalSpaceAround} label="Space points evenly across" onSelect={() => change(distributeNodes(subpaths, picked, "horizontal"))} />
          <MenuRow icon={AlignVerticalSpaceAround} label="Space points evenly down" onSelect={() => change(distributeNodes(subpaths, picked, "vertical"))} />
        </ToolPopover>
      </div>

      <FieldLabel>Position</FieldLabel>
      <div className="editor-inspector-grid">
        <NumberField label="Point X" name="X" value={origin ? origin.x : Number.NaN} target={target} property="vector" disabled={none}
          decimals={1} toChanges={(value) => moveTo("x")(value)} />
        <NumberField label="Point Y" name="Y" value={origin ? origin.y : Number.NaN} target={target} property="vector" disabled={none}
          decimals={1} toChanges={(value) => moveTo("y")(value)} />
      </div>

      <FieldLabel>Mirroring</FieldLabel>
      <div className="editor-vector-mirroring">
        <ButtonRow label="Mirroring" disabled={none} items={MIRROR_OPTIONS.map((option) => ({
          ...option, pressed: mirroring === option.id, onClick: () => change(setMirroring(subpaths, picked, option.id)),
        }))} />
      </div>

      <FieldLabel>Corner radius</FieldLabel>
      <div className="editor-inspector-grid">
        <NumberField label="Point corner radius" name={<Scan size={13} />} min={0} max={Math.round(Math.max(element.w, element.h))}
          value={picked.length && radius !== null ? radius : Number.NaN} placeholder={picked.length && radius === null ? "Mixed" : undefined}
          target={target} property="vector" disabled={none} toChanges={(value) => changesFor(setCornerRadius(subpaths, picked, value))} />
      </div>
      {!picked.length && <p className="editor-inspector-hint">Pick a point on the shape to change it. Double-click a point to switch between a corner and a curve.</p>}
    </InspectorSection>
  );
}
