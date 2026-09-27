import { useMemo, useState } from "react";
import { useAppDispatch } from "../redux/hook.js";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown, Clock, Eye, Funnel, Pencil, Search, Trash2, X } from "lucide-react";
import { AdminNotice, Modal, Pagination, RowMenu, UserAvatar, formatDate } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import { useServerTemplates } from "./useReviewQueue";
import { templateApi, useApproveTemplateMutation, useDeleteTemplateMutation, useRejectTemplateMutation, useUpdateTemplateMutation } from "../API/templateApi";
import { fromServerTemplate } from "./useReviewQueue";
import { useUserDirectory } from "./useUserDirectory";
import { EDITOR_SCHEMA_VERSION } from "../Editor/model/editorDocument.js";
import { useGetCategoriesQuery } from "../API/categoryApi";
import {
  templateCategoryNames,
  templateCategoryPayload,
  templateCategoryUuids,
} from "../Templates/templateCategories.js";
import graduationCeremony from "../../assets/pages/admin/templates/template-table/graduation-ceremony.png";
import businessSeminar from "../../assets/pages/admin/templates/template-table/business-seminar.png";
import khmerNewYear from "../../assets/pages/admin/templates/template-table/khmer-new-year.png";
import finalExamination from "../../assets/pages/admin/templates/template-table/final-examination.png";
import creativeWorkshop from "../../assets/pages/admin/templates/template-table/creative-workshop.png";
import databaseFundamentals from "../../assets/pages/admin/templates/template-table/database-fundamentals.png";
import codingCompetition from "../../assets/pages/admin/templates/template-table/coding-competition.png";
import "./admin-templates.css";

// Seed templates have no preview images yet; these Figma exports stand in,
// picked by category.
const previewByCategory = {
  Graduation: graduationCeremony,
  Seminar: businessSeminar,
  "Khmer Events": khmerNewYear,
  Examination: finalExamination,
  Workshop: creativeWorkshop,
  Competition: codingCompetition,
};
const previewFor = (template) => template.image || previewByCategory[templateCategoryNames(template)[0]] || databaseFundamentals;

const tabs = [
  ["all", "All Templates", () => true],
  ["public", "Public", (t) => t.visibility === "public"],
  ["private", "Private", (t) => t.visibility === "private"],
  ["pending", "Pending Review", (t) => t.status === "pending"],
  ["rejected", "Rejected", (t) => t.status === "rejected"],
];
const statusInfo = {
  published: { label: "Published", tone: "green", icon: Check },
  pending: { label: "Pending", tone: "yellow", icon: Clock },
  rejected: { label: "Rejected", tone: "red", icon: X },
};
const perPage = 7;

function SelectControl({ label, value, onChange, children, className = "" }) {
  return (
    <label className={`ad-control ${className}`}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
    </label>
  );
}

/* One category (the server stores one). `value` stays a list of at most one
   uuid, so the form's save code is the same either way. */
function CategoryPicker({ options, value, onChange, label = "Category" }) {
  const normalizedOptions = options.map((category) => typeof category === "string"
    ? { uuid: category, name: category }
    : category);
  const current = value[0] ?? null;
  const selected = normalizedOptions.find((category) => category.uuid === current) || null;

  return (
    <div className="tm-category-picker">
      <Listbox value={current} onChange={(uuid) => onChange(uuid ? [uuid] : [])}>
        <ListboxButton className={`tm-category-trigger${selected ? " has-value" : ""}`} aria-label={label}>
          <span className="tm-category-trigger-copy">
            {selected ? selected.name : "Choose a category"}
          </span>
          <ChevronDown size={17} aria-hidden="true" />
        </ListboxButton>
        <ListboxOptions className="tm-category-options">
          {normalizedOptions.map((category) => {
            const isSelected = category.uuid === current;
            return (
              <ListboxOption key={category.uuid} value={category.uuid} className="tm-category-option">
                <span>{category.name}</span>
                <span className="tm-category-check" aria-hidden="true">
                  {isSelected && <Check size={13} strokeWidth={3} />}
                </span>
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}

// Sub-label under the template name: review state wins over visibility.
function TemplateState({ template }) {
  if (template.status === "pending") return <span className="tm-state"><Clock size={13} fill="currentColor" className="is-knockout" aria-hidden="true" />Pending</span>;
  if (template.status === "rejected") return <span className="tm-state is-rejected"><X size={14} strokeWidth={3} aria-hidden="true" />Rejected</span>;
  return <span className="tm-state"><Check size={14} strokeWidth={2.5} aria-hidden="true" />{template.visibility === "private" ? "Private" : "Public"}</span>;
}

/* Real templates (remoteId) edit what the server lets an admin change —
   name, description, category, status; who made it and when are the
   server's, so they are shown, not edited. Sample rows edit every field. */
function TemplateForm({ initial, onSave, onClose, categories, serverCategories = [] }) {
  // A date input only reads YYYY-MM-DD; the server sends a full timestamp.
  const initialCategoryNames = templateCategoryNames(initial);
  const initialCategoryUuids = templateCategoryUuids(initial);
  const [form, setForm] = useState({
    ...initial,
    description: initial.description || "",
    createdAt: String(initial.createdAt || "").slice(0, 10),
    categories: initialCategoryNames,
    categoryUuids: initialCategoryUuids,
    category: initialCategoryNames[0] || "",
    categoryUuid: initialCategoryUuids[0] || "",
  });
  const isServer = !!initial.remoteId;
  /* Status only moves forward: approve or reject (the server cannot put a
     template back to Pending), so Pending is never a choice. A template still
     waiting shows it as a placeholder, so the field never pretends to say
     Published and a plain Save changes nothing. */
  const waiting = initial.status === "pending";
  const isEditing = !!initial.id;
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const title = initial.id ? "Edit Template" : "Add Template";
  const serverCategoryOptions = [
    ...serverCategories,
    ...initialCategoryUuids
      .filter((uuid) => !serverCategories.some((category) => category.uuid === uuid))
      .map((uuid, index) => ({ uuid, name: initialCategoryNames[index] || "Current category" })),
  ];
  const save = async (event) => {
    event.preventDefault();
    if ((isServer ? form.categoryUuids : form.categories).length === 0) return;
    try {
      await onSave(form);
      onClose();
    } catch {
      // The page-level request handler reports the server's reason.
    }
  };
  const chooseServerCategories = (categoryUuids) => {
    const selected = serverCategoryOptions.filter((category) => categoryUuids.includes(category.uuid));
    setForm((old) => ({
      ...old,
      categoryUuids,
      categories: selected.map((category) => category.name),
      categoryUuid: categoryUuids[0] || "",
      category: selected[0]?.name || "",
    }));
  };
  const chooseSampleCategories = (selectedCategories) => setForm((old) => ({
    ...old,
    categories: selectedCategories,
    category: selectedCategories[0] || "",
  }));
  const hasCategory = (isServer ? form.categoryUuids : form.categories).length > 0;

  if (isEditing) {
    const currentStatus = statusInfo[form.status] || statusInfo.pending;
    const StatusIcon = currentStatus.icon;
    return (
      <Modal title="Edit template" onClose={onClose} className="tm-edit-modal">
        <form className="tm-edit-form" onSubmit={save}>
          <aside className="tm-edit-aside" aria-label="Template preview and details">
            <div className="tm-edit-thumbnail">
              <img src={previewFor(initial)} alt={`${initial.name} preview`} />
            </div>
            <span className={`ad-pill ${currentStatus.tone} tm-edit-status`}>
              <StatusIcon size={13} strokeWidth={2.5} aria-hidden="true" />
              {currentStatus.label}
            </span>
            <dl className="tm-edit-meta">
              <div>
                <dt>Created by</dt>
                <dd>{initial.creator || "Unknown creator"}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(initial.createdAt)}{initial.createdTime ? ` · ${initial.createdTime}` : ""}</dd>
              </div>
            </dl>
          </aside>

          <div className="tm-edit-main">
            <header className="tm-edit-header">
              <div>
                <h2>Edit template</h2>
                <p>Update its details and publishing status.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="tm-edit-fields">
              <label className="tm-edit-field">
                <span>Template name</span>
                <input required value={form.name} onChange={(event) => set("name", event.target.value)} />
              </label>
              <label className="tm-edit-field">
                <span>Description</span>
                <textarea rows={4} value={form.description} placeholder="What is this template for?" onChange={(event) => set("description", event.target.value)} />
              </label>
              <div className="tm-edit-field-row">
                <div className="tm-edit-field">
                  <span>Category</span>
                  {isServer ? (
                    <CategoryPicker options={serverCategoryOptions} value={form.categoryUuids} onChange={chooseServerCategories} />
                  ) : (
                    <CategoryPicker options={categories} value={form.categories} onChange={chooseSampleCategories} />
                  )}
                </div>
                <label className="tm-edit-field">
                  <span>Status</span>
                  <span className="tm-edit-select">
                    <select value={form.status} onChange={(event) => set("status", event.target.value)}>
                      {waiting && <option value="pending" disabled>Waiting for review</option>}
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown size={17} aria-hidden="true" />
                  </span>
                </label>
              </div>
              {!isServer && (
                <details className="tm-edit-sample-details">
                  <summary>Creator details</summary>
                  <div className="tm-edit-sample-grid">
                    <label className="tm-edit-field"><span>Creator name</span><input required value={form.creator} onChange={(event) => set("creator", event.target.value)} /></label>
                    <label className="tm-edit-field"><span>Creator email</span><input required type="email" value={form.email} onChange={(event) => set("email", event.target.value)} /></label>
                    <label className="tm-edit-field"><span>Created date</span><input required type="date" value={form.createdAt} onChange={(event) => set("createdAt", event.target.value)} /></label>
                    <label className="tm-edit-field"><span>Visibility</span><span className="tm-edit-select"><select value={form.visibility} onChange={(event) => set("visibility", event.target.value)}><option value="public">Public</option><option value="private">Private</option></select><ChevronDown size={17} aria-hidden="true" /></span></label>
                  </div>
                </details>
              )}
            </div>

            <div className="tm-edit-actions">
              <button type="button" className="ad-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="ad-button primary" disabled={!hasCategory} title={!hasCategory ? "Choose at least one category" : undefined}>Save changes</button>
            </div>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="ad-form" onSubmit={save}>
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {(isServer
          ? [["name", "Template name", "text"]]
          : [
              ["name", "Template name", "text"],
              ["creator", "Creator name", "text"],
              ["email", "Creator email", "email"],
              ["createdAt", "Created date", "date"],
            ]
        ).map(([key, label, type]) => (
          <label key={key}>
            {label}
            <span className="ad-control">
              <input required value={form[key]} type={type} onChange={(event) => set(key, event.target.value)} />
            </span>
          </label>
        ))}
        {isServer && (
          <p className="tm-form-meta">
            Created by <strong>{initial.creator}</strong>{initial.email ? ` (${initial.email})` : ""} on {formatDate(initial.createdAt)}{initial.createdTime ? `, ${initial.createdTime}` : ""}
          </p>
        )}
        <label>
          Description
          <span className="ad-control tm-textarea">
            <textarea rows={3} value={form.description} placeholder="What is this template for?" onChange={(event) => set("description", event.target.value)} />
          </span>
        </label>
        <div className="ad-form-field">
          <span>Category</span>
          {isServer ? (
            <CategoryPicker options={serverCategoryOptions} value={form.categoryUuids} onChange={chooseServerCategories} />
          ) : (
            <CategoryPicker options={categories} value={form.categories} onChange={chooseSampleCategories} />
          )}
        </div>
        <label>
          Status
          <SelectControl label="Status" value={form.status} onChange={(value) => set("status", value)}>
            {waiting && <option value="pending" disabled>Waiting for review</option>}
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </SelectControl>
        </label>
        {/* Every template on the server is a public submission; privacy belongs to backdrops. */}
        {!isServer && (
          <label>
            Visibility
            <SelectControl label="Visibility" value={form.visibility} onChange={(value) => set("visibility", value)}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </SelectControl>
          </label>
        )}
        <div className="ad-modal-actions">
          <button type="button" className="ad-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="ad-button primary" disabled={!hasCategory} title={!hasCategory ? "Choose at least one category" : undefined}>Save Template</button>
        </div>
      </form>
    </Modal>
  );
}

export default function TemplateManagement() {
  const { templates: sampleTemplates, categories, addTemplate, updateTemplate, deleteTemplate } = useDashboardData();
  /* Real templates from the server (any state) come first, then the samples.
     A real one is changed on the server: rename (PATCH), a status change
     (approve / reject), delete; RTK then reloads every template list. */
  const { rows: serverTemplates, error: serverError } = useServerTemplates();
  const templates = useMemo(() => [...serverTemplates, ...sampleTemplates], [serverTemplates, sampleTemplates]);
  const { data: categoryPage } = useGetCategoriesQuery();
  const serverCategories = (categoryPage?.data?.contents || []).filter((c) => c.isActive !== false);
  const [patchTemplate] = useUpdateTemplateMutation();
  const [removeTemplate] = useDeleteTemplateMutation();
  const [approveTemplate] = useApproveTemplateMutation();
  const [rejectTemplate] = useRejectTemplateMutation();
  // The server's own reason and status, so a refusal can be acted on (and reported).
  const failed = (what) => (error) => {
    const body = error?.data;
    const said = typeof body === "string" ? body : body?.detail || body?.message || body?.error?.description;
    const status = Number.isInteger(error?.status) ? ` (${error.status})` : "";
    window.alert(`Couldn't ${what}${status}.${said ? `\n\nServer: ${said}` : ""}`);
  };
  /* A list row is a summary: no description, and its name is the backdrop's.
     Opening a real template (Edit or Preview) loads the full one first, so
     the form shows what the author actually submitted — and compares the
     edit against that, not against the summary. */
  const dispatch = useAppDispatch();
  const directory = useUserDirectory();
  const withDetail = async (row) => {
    if (!row.remoteId) return row;
    try {
      const detail = (await dispatch(templateApi.endpoints.getTemplateById.initiate({ templateUuid: row.remoteId }, { forceRefetch: true })).unwrap())?.data;
      return detail ? { ...row, ...fromServerTemplate(detail, directory.find), createdAt: row.createdAt, createdTime: row.createdTime } : row;
    } catch {
      return row;
    }
  };
  const openEdit = async (row) => setEditing(await withDetail(row));
  const openPreview = async (row) => setViewing(await withDetail(row));

  const saveTemplate = async (item) => {
    if (!item.remoteId) {
      const categoryChanged = templateCategoryNames(item).join("|") !== templateCategoryNames(editing).join("|");
      const result = item.id ? updateTemplate(item.id, item) : addTemplate(item);
      setSuccessNotice({
        title: categoryChanged ? "Template categories updated" : "Template updated",
        message: categoryChanged
          ? `${item.name} now has ${templateCategoryNames(item).length} ${templateCategoryNames(item).length === 1 ? "category" : "categories"}.`
          : `${item.name} was saved successfully.`,
      });
      return result;
    }
    // The loaded full template when there is one, so an untouched description is not re-sent.
    const original = editing?.remoteId === item.remoteId ? editing : serverTemplates.find((row) => row.remoteId === item.remoteId);
    if (!original) return;
    // Only what changed is sent; version guards against overwriting someone else's edit.
    const changes = {};
    if (item.name.trim() && item.name.trim() !== original.name) changes.name = item.name.trim();
    if ((item.description || "").trim() !== (original.description || "").trim()) changes.description = (item.description || "").trim();
    const selectedCategories = item.categoryUuids
      .map((uuid) => serverCategories.find((category) => category.uuid === uuid))
      .filter(Boolean);
    const categoryFields = templateCategoryPayload(selectedCategories);
    const categoryChanged = categoryFields.categoryUuids.join("|") !== templateCategoryUuids(original).join("|");
    if (categoryChanged) Object.assign(changes, categoryFields);
    const requests = [];
    if (Object.keys(changes).length) {
      requests.push(patchTemplate({ templateUuid: item.remoteId, userUpdateTemplateRequest: { clientSchemaVersion: EDITOR_SCHEMA_VERSION, version: original.version ?? 0, ...changes } }).unwrap());
    }
    if (original && item.status !== original.status) {
      if (item.status === "published") requests.push(approveTemplate({ templateUuid: item.remoteId }).unwrap());
      if (item.status === "rejected") requests.push(rejectTemplate({ templateUuid: item.remoteId }).unwrap());
    }
    if (!requests.length) return;
    try {
      await Promise.all(requests);
      setSuccessNotice({
        title: categoryChanged ? "Template categories updated" : "Template updated",
        message: categoryChanged
          ? `${item.name} now has ${selectedCategories.length} ${selectedCategories.length === 1 ? "category" : "categories"}.`
          : `${item.name} was saved successfully.`,
      });
    } catch (error) {
      failed("save this template")(error);
      throw error;
    }
  };
  const removeRow = (item) => (item.remoteId
    ? removeTemplate({ templateUuid: item.remoteId }).unwrap().catch(failed("delete this template"))
    : deleteTemplate(item.id));
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [creator, setCreator] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const creators = [...new Set(templates.map((t) => t.creator))];
  const filterCategories = [...new Set([
    ...categories,
    ...serverCategories.map((item) => item.name),
    ...templates.flatMap(templateCategoryNames),
  ])];

  const result = useMemo(() => {
    const tabFilter = tabs.find(([key]) => key === tab)[2];
    const needle = query.trim().toLowerCase();
    return templates
      .filter(tabFilter)
      .filter((t) => `${t.name} ${t.creator} ${templateCategoryNames(t).join(" ")}`.toLowerCase().includes(needle))
      .filter((t) => status === "all" || t.status === status)
      .filter((t) => category === "all" || templateCategoryNames(t).includes(category))
      .filter((t) => creator === "all" || t.creator === creator)
      .sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "name-desc") return b.name.localeCompare(a.name);
        if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [templates, query, tab, status, category, creator, sort]);

  const pageCount = Math.ceil(result.length / perPage);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const current = result.slice((currentPage - 1) * perPage, currentPage * perPage);
  // Any filter change sends the list back to page 1.
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="ad-page tm-page">
      {successNotice && (
        <AdminNotice {...successNotice} onDismiss={() => setSuccessNotice(null)} />
      )}
      <div className="tm-top">
        <div className="ad-tabs" role="tablist" aria-label="Filter templates">
          {tabs.map(([key, label]) => (
            <button type="button" role="tab" key={key} aria-selected={tab === key} onClick={() => withReset(setTab)(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {serverError && <p className="ad-empty" role="status">{serverError.status === 401 || serverError.status === 403 ? "Live templates need an admin sign-in." : "Couldn't load live templates."}</p>}
      <div className="tm-filters">
        <label className="ad-control search tm-search">
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          <span className="sr-only">Search templates</span>
          <input value={query} onChange={(event) => withReset(setQuery)(event.target.value)} placeholder="Search by template, creator, or category..." />
        </label>
        <div className="tm-selects">
          <SelectControl label="Status" value={status} onChange={withReset(setStatus)}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </SelectControl>
          <SelectControl label="Category" value={category} onChange={withReset(setCategory)}>
            <option value="all">All Categories</option>
            {filterCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectControl>
          <SelectControl label="Creator" value={creator} onChange={withReset(setCreator)}>
            <option value="all">All Creators</option>
            {creators.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectControl>
        </div>
        <div className="tm-sort">
          <label className="ad-control ad-sort">
            <span className="ad-sort-label">Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
            <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
          </label>
          <button type="button" className="ad-button icon-only" disabled title="More filters coming soon" aria-label="More filters, coming soon">
            <Funnel size={16} fill="currentColor" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ad-table-card stack-wide tm-table">
        <table className="ad-table">
          <thead>
            <tr>
              <th scope="col">Template</th>
              <th scope="col">Creator</th>
              <th scope="col" className="is-center">Category</th>
              <th scope="col" className="is-center">Status</th>
              <th scope="col">Created At</th>
              <th scope="col" className="is-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {current.length === 0 && (
              <tr>
                <td colSpan={6} className="ad-table-empty">No templates match these filters.</td>
              </tr>
            )}
            {current.map((t) => {
              const info = statusInfo[t.status] || statusInfo.pending;
              const StatusIcon = info.icon;
              return (
                <tr key={t.id}>
                  <td className="is-primary">
                    <button type="button" className="tm-template" onClick={() => openPreview(t)}>
                      <img src={previewFor(t)} alt="" />
                      <span>
                        <strong>{t.name}</strong>
                        <TemplateState template={t} />
                      </span>
                    </button>
                  </td>
                  <td data-label="Creator">
                    <div className="ad-person">
                      <UserAvatar size={38} person={t.author || { name: t.creator }} />
                      <div>
                        <strong>{t.creator}</strong>
                        <small>{t.email}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Category" className="is-center">
                    <div className="tm-category-pills">
                      {templateCategoryNames(t).slice(0, 2).map((name) => <span key={name} className="ad-pill purple tinted tm-pill">{name}</span>)}
                      {templateCategoryNames(t).length > 2 && <span className="tm-category-more">+{templateCategoryNames(t).length - 2}</span>}
                    </div>
                  </td>
                  <td data-label="Status" className="is-center">
                    <span className={`ad-pill ${info.tone} tm-pill tm-status`}>
                      <StatusIcon size={12} strokeWidth={3} aria-hidden="true" />
                      {info.label}
                    </span>
                  </td>
                  <td data-label="Created At">
                    <div className="ad-date">
                      <strong>{formatDate(t.createdAt)}</strong>
                      <small>{t.createdTime}</small>
                    </div>
                  </td>
                  <td className="is-center is-actions">
                    <RowMenu
                      label={`Actions for ${t.name}`}
                      items={[
                        { label: "Preview", icon: Eye, onSelect: () => openPreview(t) },
                        { label: "Edit", icon: Pencil, onSelect: () => openEdit(t) },
                        { label: "Delete", icon: Trash2, danger: true, onSelect: () => setConfirm(t) },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pageCount={pageCount} total={result.length} perPage={perPage} noun="templates" onChange={setPage} variant="outlined" />

      {editing && (
        <TemplateForm
          initial={editing}
          categories={filterCategories}
          serverCategories={serverCategories}
          onSave={saveTemplate}
          onClose={() => setEditing(null)}
        />
      )}
      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewing(null)} className="tm-preview">
          <header>
            <h2>{viewing.name}</h2>
            <button type="button" onClick={() => setViewing(null)} aria-label="Close">
              <X size={18} />
            </button>
          </header>
          <img src={previewFor(viewing)} alt={`${viewing.name} preview`} />
          <p>{viewing.description}</p>
          <div className="tm-category-pills is-preview">
            {templateCategoryNames(viewing).map((name) => <span key={name} className="ad-pill purple tinted">{name}</span>)}
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal title="Delete template" onClose={() => setConfirm(null)}>
          <header>
            <h2>Delete template?</h2>
          </header>
          <p>“{confirm.name}” will be removed. This action cannot be undone.</p>
          <div className="ad-modal-actions">
            <button type="button" className="ad-button" onClick={() => setConfirm(null)}>Cancel</button>
            <button
              type="button"
              className="ad-button danger"
              onClick={() => {
                removeRow(confirm);
                setConfirm(null);
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
