import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Globe2, Image as ImageIcon, Loader2, Lock, Send, Upload, Users, X } from "lucide-react";
import { useAppSelector } from "../../redux/hook.js";
import { renderPage } from "../export/editorPdf.jsx";
import { buildTemplateRecord, publishTemplate } from "../model/templatePublish.js";
import { IMAGE_TYPES } from "../panels/useImageUpload.js";

const VISIBILITIES = [
  { id: "public", label: "Public", icon: Globe2 },
  { id: "team", label: "Team", icon: Users },
  { id: "private", label: "Private", icon: Lock },
];

/*
 * Publish the open backdrop as a template. The preview is the first page
 * rendered to an image — the same rasteriser the PDF export uses — which
 * becomes the thumbnail; an author who wants a different one can replace it here
 * or, later, from the dashboard's Edit Template form.
 */
export default function EditorPublishModal({ onClose }) {
  const editor = useAppSelector((state) => state.editor);
  const [title, setTitle] = useState(editor.title || "");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbBusy, setThumbBusy] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // The first page becomes the thumbnail. Rendered once, when the modal opens.
  useEffect(() => {
    let alive = true;
    setThumbBusy(true);
    renderPage(editor.pages[0])
      .then((url) => { if (alive) { setThumbnail(url); setThumbBusy(false); } })
      .catch(() => { if (alive) setThumbBusy(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape" && !publishing) onClose(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, publishing]);

  const chooseThumbnail = (file) => {
    if (!file || !IMAGE_TYPES.includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => setThumbnail(String(reader.result));
    reader.readAsDataURL(file);
  };

  const publish = async () => {
    if (!title.trim() || publishing) return;
    setPublishing(true);
    setError("");
    try {
      const record = buildTemplateRecord({ editor, title, description, visibility, thumbnail });
      await publishTemplate(record);
      onClose(true);
    } catch (err) {
      setError(err?.message || "Couldn't publish the template. Please try again.");
      setPublishing(false);
    }
  };

  return createPortal(
    <div className="editor-publish-backdrop" role="dialog" aria-modal="true" aria-label="Publish template"
      onPointerDown={(event) => { if (event.target === event.currentTarget && !publishing) onClose(false); }}>
      <div className="editor-publish-modal">
        <button type="button" className="editor-publish-close" aria-label="Close" disabled={publishing} onClick={() => onClose(false)}>
          <X size={16} aria-hidden="true" />
        </button>

        <div className="editor-publish-head">
          <span className="editor-publish-badge" aria-hidden="true"><Send size={18} /></span>
          <div>
            <h2>Publish Template</h2>
            <p>Share this backdrop as a reusable template.</p>
          </div>
        </div>

        <p className="editor-publish-label">Preview</p>
        <div className="editor-publish-preview">
          {thumbBusy
            ? <span className="editor-publish-preview-busy"><Loader2 size={22} className="editor-spin" aria-hidden="true" />Rendering first page…</span>
            : thumbnail
              ? <img src={thumbnail} alt="Template thumbnail" />
              : <span className="editor-publish-preview-busy"><ImageIcon size={22} aria-hidden="true" />No preview</span>}
          <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(",")} hidden
            onChange={(event) => { chooseThumbnail(event.target.files?.[0]); event.target.value = ""; }} />
          <button type="button" className="editor-publish-thumb-change" onClick={() => fileRef.current?.click()}>
            <Upload size={13} aria-hidden="true" />Change thumbnail
          </button>
        </div>

        <label className="editor-publish-field">
          <span>Template Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name your template" />
        </label>

        <label className="editor-publish-field">
          <span>Description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3}
            placeholder="What is this template for?" />
        </label>

        <p className="editor-publish-label">Visibility</p>
        <div className="editor-publish-visibility">
          {VISIBILITIES.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={`editor-publish-vis${visibility === id ? " is-active" : ""}`}
              aria-pressed={visibility === id} onClick={() => setVisibility(id)}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {error && <p className="editor-publish-error" role="alert">{error}</p>}

        <div className="editor-publish-actions">
          <button type="button" className="editor-publish-cancel" disabled={publishing} onClick={() => onClose(false)}>Cancel</button>
          <button type="button" className="editor-publish-submit" disabled={!title.trim() || publishing} onClick={publish}>
            {publishing ? <><Loader2 size={16} className="editor-spin" aria-hidden="true" />Publishing…</> : "Publish"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
