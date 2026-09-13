import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock, Eye, Funnel, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Modal, Pagination, RowMenu, UserAvatar, formatDate } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
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
const previewFor = (template) => template.image || previewByCategory[template.category] || databaseFundamentals;

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
const empty = {
  name: "",
  creator: "",
  email: "",
  category: "Graduation",
  status: "pending",
  visibility: "public",
  createdAt: "2024-05-25",
};

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

// Sub-label under the template name: review state wins over visibility.
function TemplateState({ template }) {
  if (template.status === "pending") return <span className="tm-state"><Clock size={13} fill="currentColor" className="is-knockout" aria-hidden="true" />Pending</span>;
  if (template.status === "rejected") return <span className="tm-state is-rejected"><X size={14} strokeWidth={3} aria-hidden="true" />Rejected</span>;
  return <span className="tm-state"><Check size={14} strokeWidth={2.5} aria-hidden="true" />{template.visibility === "private" ? "Private" : "Public"}</span>;
}

function TemplateForm({ initial, onSave, onClose, categories }) {
  const [form, setForm] = useState(initial);
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const title = initial.id ? "Edit Template" : "Add Template";
  return (
    <Modal title={title} onClose={onClose}>
      <form
        className="ad-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
          onClose();
        }}
      >
        <header>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {[
          ["name", "Template name", "text"],
          ["creator", "Creator name", "text"],
          ["email", "Creator email", "email"],
          ["createdAt", "Created date", "date"],
        ].map(([key, label, type]) => (
          <label key={key}>
            {label}
            <span className="ad-control">
              <input required value={form[key]} type={type} onChange={(event) => set(key, event.target.value)} />
            </span>
          </label>
        ))}
        <label>
          Category
          <SelectControl label="Category" value={form.category} onChange={(value) => set("category", value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectControl>
        </label>
        <label>
          Status
          <SelectControl label="Status" value={form.status} onChange={(value) => set("status", value)}>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </SelectControl>
        </label>
        <label>
          Visibility
          <SelectControl label="Visibility" value={form.visibility} onChange={(value) => set("visibility", value)}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </SelectControl>
        </label>
        <div className="ad-modal-actions">
          <button type="button" className="ad-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="ad-button primary">Save Template</button>
        </div>
      </form>
    </Modal>
  );
}

export default function TemplateManagement() {
  const { templates, categories, addTemplate, updateTemplate, deleteTemplate } = useDashboardData();
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
  const creators = [...new Set(templates.map((t) => t.creator))];

  const result = useMemo(() => {
    const tabFilter = tabs.find(([key]) => key === tab)[2];
    const needle = query.trim().toLowerCase();
    return templates
      .filter(tabFilter)
      .filter((t) => `${t.name} ${t.creator}`.toLowerCase().includes(needle))
      .filter((t) => status === "all" || t.status === status)
      .filter((t) => category === "all" || t.category === category)
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
      <div className="tm-top">
        <div className="ad-tabs" role="tablist" aria-label="Filter templates">
          {tabs.map(([key, label]) => (
            <button type="button" role="tab" key={key} aria-selected={tab === key} onClick={() => withReset(setTab)(key)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="ad-button primary tm-add" onClick={() => setEditing(empty)}>
          <Plus size={20} strokeWidth={2.5} aria-hidden="true" /> Add Template
        </button>
      </div>

      <div className="tm-filters">
        <label className="ad-control search tm-search">
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          <span className="sr-only">Search templates</span>
          <input value={query} onChange={(event) => withReset(setQuery)(event.target.value)} placeholder="Search template by name or creator..." />
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
            {categories.map((c) => (
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
                    <button type="button" className="tm-template" onClick={() => setViewing(t)}>
                      <img src={previewFor(t)} alt="" />
                      <span>
                        <strong>{t.name}</strong>
                        <TemplateState template={t} />
                      </span>
                    </button>
                  </td>
                  <td data-label="Creator">
                    <div className="ad-person">
                      <UserAvatar size={38} />
                      <div>
                        <strong>{t.creator}</strong>
                        <small>{t.email}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Category" className="is-center">
                    <span className="ad-pill purple tinted tm-pill">{t.category}</span>
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
                        { label: "Preview", icon: Eye, onSelect: () => setViewing(t) },
                        { label: "Edit", icon: Pencil, onSelect: () => setEditing(t) },
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
          categories={categories}
          onSave={(item) => (item.id ? updateTemplate(item.id, item) : addTemplate(item))}
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
          <span className="ad-pill purple tinted">{viewing.category}</span>
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
                deleteTemplate(confirm.id);
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
