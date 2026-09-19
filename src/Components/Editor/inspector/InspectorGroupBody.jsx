import { useState } from "react";
import { Ungroup } from "lucide-react";
import { useAppDispatch } from "../../redux/hook.js";
import { groupUngrouped, targetChanged } from "../../redux/editorSlice.js";
import { groupTarget } from "./inspectorEdit.js";
import RenameField from "../panels/RenameField.jsx";

export function GroupName({ group, pageId, busy }) {
  const [editing, setEditing] = useState(false);
  const dispatch = useAppDispatch();
  return editing ? <RenameField value={group.name} label="Group name" onCancel={() => setEditing(false)}
    onCommit={(name) => { dispatch(targetChanged({ target: groupTarget(pageId, group.id), changes: { name } })); setEditing(false); }} />
    : <button className="editor-group-name" type="button" disabled={busy} title="Rename group" onClick={() => setEditing(true)}>{group.name}</button>;
}

export default function InspectorGroupBody({ group, busy, children }) {
  const dispatch = useAppDispatch();
  return <>{children}
    <p className="editor-inspector-note">Opacity changes each member of this group.</p>
    <button type="button" className="editor-group-ungroup" disabled={busy} onClick={() => dispatch(groupUngrouped(group.id))}><Ungroup size={16} />Ungroup</button>
  </>;
}
