import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown, Globe2, Image as ImageIcon, Loader2, Lock, Send, Shapes, Upload, X } from "lucide-react";
import { useNavigate } from "react-router";
import reviewInboxArt from "../../../assets/pages/editor/review-inbox.png";
import { useAppSelector } from "../../redux/hook.js";
import { renderPage } from "../export/editorPdf.jsx";
import { useCurrentUser } from "../../Account/useCurrentUser";
import { useGetCategoriesQuery } from "../../API/categoryApi";
import { categoryIcon } from "../../Dashboard/categoryIcons.js";
import { MAX_TEMPLATE_CATEGORIES } from "../../Templates/templateCategories.js";
import { publishErrorMessage, usePublishBackdrop } from "./usePublishBackdrop.js";
import { IMAGE_TYPES } from "../panels/useImageUpload.js";
import { useReviewReceiptMotion } from "./useReviewReceiptMotion.js";

const VISIBILITIES = [
  { id: "public", label: "Public", icon: Globe2 },
  { id: "private", label: "Private", icon: Lock },
];

/*
 * Publish the open backdrop as a template. The preview is the first page
 * rendered to an image — the same rasteriser the PDF export uses — which
 * becomes the thumbnail; an author who wants a different one can replace it here
 * or, later, from the dashboard's Edit Template form.
 */
export default function EditorPublishModal({ onClose }) {
  const navigate = useNavigate();
  const editor = useAppSelector((state) => state.editor);
  const [title, setTitle] = useState(editor.title || "");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbBusy, setThumbBusy] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const fileRef = useRef(null);
  const receipt = useReviewReceiptMotion(!!submittedRecord);
  const publishBackdrop = usePublishBackdrop();
  const { isSignedIn } = useCurrentUser();
  /* Public templates can be filed under up to five active categories. */
  const { data: categoryPage, isLoading: categoriesLoading } = useGetCategoriesQuery(undefined, { skip: !isSignedIn });
  const categories = (categoryPage?.data?.contents || []).filter((category) => category.isActive !== false);
  const [categoryUuids, setCategoryUuids] = useState([]);
  const selectedCategories = categories.filter((item) => categoryUuids.includes(item.uuid));
  const firstCategory = selectedCategories[0] || null;
  const SelectedCategoryIcon = firstCategory ? categoryIcon(firstCategory.name, firstCategory.icon) : Shapes;
  const needsCategory = visibility === "public" && (categoriesLoading || (categories.length > 0 && selectedCategories.length === 0));
  const setLimitedCategories = (next) => setCategoryUuids([...new Set(next)].slice(0, MAX_TEMPLATE_CATEGORIES));

  // The first page becomes the thumbnail. Rendered once, when the modal opens.
  useEffect(() => {
    let alive = true;
    setThumbBusy(true);
    renderPage(editor.pages[0], editor.canvas)
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
    if (!title.trim() || publishing || needsCategory) return;
    // Publishing saves to an account, so it needs one.
    if (!isSignedIn) { setError("Sign in to publish your backdrop."); return; }
    setPublishing(true);
    setError("");
    try {
      const saved = await publishBackdrop({ editor, title, description, visibility, thumbnail, categories: selectedCategories });
      if (saved.visibility === "public") {
        setSubmittedRecord(saved);
        setPublishing(false);
      } else {
        onClose(true);
      }
    } catch (err) {
      setError(err?.status !== undefined ? publishErrorMessage(err) : err?.message || "Couldn't publish the template. Please try again.");
      setPublishing(false);
    }
  };

  return createPortal(
    <div className="editor-publish-backdrop" role="dialog" aria-modal="true"
      aria-labelledby={submittedRecord ? "editor-publish-review-title" : "editor-publish-title"}
      onPointerDown={(event) => { if (event.target === event.currentTarget && !publishing) onClose(false); }}>
      <div className={`editor-publish-modal${submittedRecord ? " is-review" : ""}`}>
        <button type="button" className="editor-publish-close" aria-label="Close" disabled={publishing} onClick={() => onClose(false)}>
          <X size={16} aria-hidden="true" />
        </button>

        {submittedRecord ? (
          <div className="editor-publish-review">
            <div className="editor-publish-review-art" aria-hidden="true">
              <div className="editor-publish-review-art-preview">
                {submittedRecord.thumbnail ? <img src={submittedRecord.thumbnail} alt="" /> : <ImageIcon size={30} />}
              </div>
              <svg className="editor-publish-review-art-arrow" viewBox="0 0 72 52" fill="none" aria-hidden="true">
                <path d="M4 12c19-11 43-4 54 19m-16-4 17 7 5-18" pathLength="1" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <img className="editor-publish-review-art-inbox" src={reviewInboxArt} alt="" />
            </div>

            <h2 ref={receipt.headingRef} id="editor-publish-review-title" tabIndex={-1}>Your backdrop is in review</h2>
            <p className="editor-publish-review-copy">An admin will review it before it appears publicly.</p>

            <ol className="editor-publish-review-steps" aria-label="Publication progress" style={receipt.lineStyle}>
              <li className="is-complete"><span className="editor-publish-review-step-icon"><Check size={22} strokeWidth={3} aria-hidden="true" /></span><span>Submitted</span></li>
              <li ref={receipt.currentStepRef} className={`is-current${receipt.reached ? " is-reached" : ""}`} aria-current="step"><span className="editor-publish-review-step-icon"><span className="editor-publish-review-step-ripple" aria-hidden="true" /><span className="editor-publish-review-step-dot" /></span><span>In review</span></li>
              <li><span className="editor-publish-review-step-icon"><Lock size={19} aria-hidden="true" /></span><span>Published</span></li>
            </ol>

            <div className="editor-publish-review-design">
              <div className="editor-publish-review-design-image">
                {submittedRecord.thumbnail ? <img src={submittedRecord.thumbnail} alt="" /> : <ImageIcon size={26} aria-hidden="true" />}
              </div>
              <div className="editor-publish-review-design-copy">
                <strong>{submittedRecord.title}</strong>
                <span>Visibility: Public</span>
              </div>
            </div>

            <div className="editor-publish-review-actions">
              <button type="button" className="editor-publish-review-secondary" onClick={() => { onClose(true); navigate("/user-dashboard/my-designs"); }}>
                View my designs
              </button>
              <button type="button" className="editor-publish-review-primary" onClick={() => onClose(true)}>
                Back to editor
              </button>
            </div>
          </div>
        ) : (
          <>
        <div className="editor-publish-head">
          <span className="editor-publish-badge" aria-hidden="true"><Send size={18} /></span>
          <div>
            <h2 id="editor-publish-title">Publish Template</h2>
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

        {visibility === "public" && (
          <>
            {categoriesLoading ? (
              <div className="editor-publish-field">
                <span>Category</span>
                <p className="editor-publish-category-note">Loading categories…</p>
              </div>
            ) : categories.length ? (
              <div className="editor-publish-field">
                <span>Category</span>
                {/* One category: the server stores one per template (see templateCategories.js). */}
                <Listbox value={categoryUuids[0] ?? null} onChange={(uuid) => setLimitedCategories(uuid ? [uuid] : [])}>
                  <ListboxButton className={`editor-publish-category-trigger${selectedCategories.length ? " has-value" : ""}`} aria-label="Category">
                    <span className="editor-publish-category-trigger-icon"><SelectedCategoryIcon size={18} aria-hidden="true" /></span>
                    <span className="editor-publish-category-trigger-value">
                      {firstCategory ? firstCategory.name : "Choose a category"}
                    </span>
                    <ChevronDown size={18} className="editor-publish-category-chevron" aria-hidden="true" />
                  </ListboxButton>
                  <ListboxOptions anchor={{ to: "bottom start", gap: 7, padding: 16 }} modal={false}
                    className="editor-publish-category-panel">
                    {categories.map((item) => {
                      const Icon = categoryIcon(item.name, item.icon);
                      const selected = categoryUuids[0] === item.uuid;
                      return (
                        <ListboxOption key={item.uuid} value={item.uuid} className="editor-publish-category-option">
                          <span className="editor-publish-category-option-icon"><Icon size={18} aria-hidden="true" /></span>
                          <span className="editor-publish-category-option-name">{item.name}</span>
                          <span className="editor-publish-category-checkbox" aria-hidden="true">
                            {selected && <Check size={14} strokeWidth={3} />}
                          </span>
                        </ListboxOption>
                      );
                    })}
                  </ListboxOptions>
                </Listbox>
              </div>
            ) : (
              <div className="editor-publish-field">
                <span>Category</span>
                <p className="editor-publish-category-note">No categories yet — an admin can add them under Categories.</p>
              </div>
            )}
          </>
        )}

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
        <p className="editor-publish-visibility-note">
          {visibility === "public" ? "Public backdrops are reviewed before they appear to others." : "Only you can see a private backdrop."}
        </p>

        {error && <p className="editor-publish-error" role="alert">{error}</p>}

        <div className="editor-publish-actions">
          <button type="button" className="editor-publish-cancel" disabled={publishing} onClick={() => onClose(false)}>Cancel</button>
          <button type="button" className="editor-publish-submit" disabled={!title.trim() || publishing || needsCategory}
            title={needsCategory ? (categoriesLoading ? "Loading categories" : "Choose at least one category") : undefined} onClick={publish}>
            {publishing
              ? <><Loader2 size={16} className="editor-spin" aria-hidden="true" />{visibility === "public" ? "Submitting…" : "Saving…"}</>
              : visibility === "public" ? "Submit for review" : "Save privately"}
          </button>
        </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
