import { CloudCheck, CloudOff, Loader2, TriangleAlert } from "lucide-react";
import { useAutosaveStatus } from "../model/autosave.js";

/*
 * Whether the design is safe, next to its name: "Saving…", "Saved", or why it
 * is not saved to the account yet. Nothing is shown before the first save —
 * a blank design that nobody has touched is not saved at all (autosave.js).
 */
const VIEWS = {
  saving: { icon: Loader2, label: "Saving…", spin: true },
  saved: { icon: CloudCheck, label: "Saved" },
  offline: { icon: CloudOff, label: "Offline — saved on this device" },
  error: { icon: TriangleAlert, label: "Not saved to your account" },
};

export default function EditorSaveStatus() {
  const status = useAutosaveStatus();
  const view = VIEWS[status.state];
  if (!view) return null;
  const Icon = view.icon;
  return (
    <span className={`editor-save-status is-${status.state}`} role="status" aria-live="polite" title={status.message || view.label}>
      <Icon size={15} aria-hidden="true" className={view.spin ? "editor-spin" : undefined} />
      <span>{view.label}</span>
    </span>
  );
}
