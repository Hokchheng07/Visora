import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

/*
 * A short notification in the corner of the editor, the editor's copy of the
 * admin dashboard's AdminNotice (a category saved, a template approved).
 *
 * `tone` is "busy" while something is under way (it stays until it is
 * replaced), "success" (goes after a few seconds), or "error" (stays longer,
 * because the reason is what the person needs to read and act on).
 */
const DURATION = { success: 4500, error: 9000 };

export default function EditorNotice({ tone = "success", title, message, onDismiss }) {
  useEffect(() => {
    if (!DURATION[tone]) return undefined;
    const timer = window.setTimeout(onDismiss, DURATION[tone]);
    return () => window.clearTimeout(timer);
  }, [tone, title, message, onDismiss]);

  const Icon = tone === "error" ? AlertCircle : tone === "busy" ? Loader2 : CheckCircle2;
  return (
    <aside className={`editor-notice is-${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} aria-atomic="true">
      <span className="editor-notice-icon" aria-hidden="true">
        <Icon size={21} strokeWidth={2.4} className={tone === "busy" ? "editor-spin" : undefined} />
      </span>
      <span className="editor-notice-copy">
        <strong>{title}</strong>
        {message && <small>{message}</small>}
      </span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={17} strokeWidth={2.2} aria-hidden="true" />
      </button>
    </aside>
  );
}
