import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Avatar, Pagination, StatusBadge, TemplateThumb } from "./ManagementUi";
import { useDashboardData } from "./dashboardData";
import "./management.css";

const tabs = [
  "All Templates",
  "Public",
  "Private",
  "Pending Review",
  "Rejected",
];
const empty = {
  name: "",
  creator: "",
  email: "",
  category: "Graduation",
  status: "pending",
  visibility: "public",
  createdAt: "2024-05-25",
};
function TemplateForm({ initial = empty, onSave, onClose, categories }) {
  const [form, setForm] = useState(initial);
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  return (
    <div className="modal-backdrop">
      <form
        className="dashboard-modal"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
          onClose();
        }}
      >
        <header>
          <h2>{initial.id ? "Edit Template" : "Add Template"}</h2>
          <button type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {[
          ["name", "Template name"],
          ["creator", "Creator name"],
          ["email", "Creator email"],
          ["createdAt", "Created date"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              required
              value={form[key]}
              type={key === "createdAt" ? "date" : "text"}
              onChange={(e) => set(key, e.target.value)}
            />
          </label>
        ))}
        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label>
          Visibility
          <select
            value={form.visibility}
            onChange={(e) => set("visibility", e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <button className="modal-submit">Save Template</button>
      </form>
    </div>
  );
}
export default function TemplateManagement() {
  const { templates, categories, addTemplate, updateTemplate, deleteTemplate } =
    useDashboardData();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All Templates");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [creator, setCreator] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const creators = [...new Set(templates.map((t) => t.creator))];
  const result = useMemo(
    () =>
      templates
        .filter((t) =>
          `${t.name} ${t.creator}`.toLowerCase().includes(query.toLowerCase()),
        )
        .filter((t) =>
          tab === "All Templates" || tab === "Public"
            ? tab !== "Public" || t.visibility === "public"
            : tab === "Private"
              ? t.visibility === "private"
              : tab === "Pending Review"
                ? t.status === "pending"
                : t.status === "rejected",
        )
        .filter((t) => status === "all" || t.status === status)
        .filter((t) => category === "all" || t.category === category)
        .filter((t) => creator === "all" || t.creator === creator)
        .sort((a, b) =>
          sort === "name-asc"
            ? a.name.localeCompare(b.name)
            : sort === "name-desc"
              ? b.name.localeCompare(a.name)
              : sort === "oldest"
                ? a.createdAt.localeCompare(b.createdAt)
                : b.createdAt.localeCompare(a.createdAt),
        ),
    [templates, query, tab, status, category, creator, sort],
  );
  const perPage = 7;
  const current = result.slice((page - 1) * perPage, page * perPage);
  return (
    <div className="dashboard-content page-content management-page templates-page">
      <div className="template-title">
        <div>
        </div>
        <button className="add-button" onClick={() => setEditing(empty)}>
          <Plus size={16} />
          Add Template
        </button>
      </div>
      <div className="template-tabs">
        {tabs.map((item) => (
          <button
            className={tab === item ? "active" : ""}
            onClick={() => {
              setTab(item);
              setPage(1);
            }}
            key={item}
          >
            {item}{" "}
            <span className="!text-[13px] font-semibold text-gray-500">
              {item === "All Templates"
                ? templates.length
                : item === "Public"
                  ? templates.filter((t) => t.visibility === "public").length
                  : item === "Private"
                    ? templates.filter((t) => t.visibility === "private").length
                    : item === "Pending Review"
                      ? templates.filter((t) => t.status === "pending").length
                      : templates.filter((t) => t.status === "rejected").length}
            </span>
          </button>
        ))}
      </div>
      <div className="template-filters">
        <label className="search-control">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search template by name or creator..."
          />
        </label>
        <div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={creator} onChange={(e) => setCreator(e.target.value)}>
            <option value="all">All Creators</option>
            {creators.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
          <button>
            <Filter size={15} />
            Filter
          </button>
        </div>
      </div>
      <div className="management-card table-scroll">
        <div className="management-table templates-table">
          <div className="management-head">
            <span>Template</span>
            <span>Creator</span>
            <span>Category</span>
            <span>Status</span>
            <span>Created At</span>
            <span>Actions</span>
          </div>
          {current.map((t) => (
            <div className="management-row" key={t.id}>
              <button
                className="pending-template template-link"
                onClick={() => setViewing(t)}
              >
                <TemplateThumb shade={t.shade} label={t.name} />
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.visibility}</small>
                </div>
              </button>
              <div className="person">
                <Avatar name={t.creator} />
                <div>
                  <strong>{t.creator}</strong>
                  <small>{t.email}</small>
                </div>
              </div>
              <span className="outlined-tag">{t.category}</span>
              <StatusBadge status={t.status} />
              <div className="date-cell">
                <strong>{t.createdAt}</strong>
                <small>{t.createdTime}</small>
              </div>
              <div className="row-menu">
                <button onClick={() => setEditing(t)}>
                  <MoreHorizontal size={18} />
                </button>
                <button onClick={() => setConfirm(t)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination
        text={`Showing ${result.length ? (page - 1) * perPage + 1 : 0} to ${Math.min(page * perPage, result.length)} of ${result.length} templates`}
      />
      {editing && (
        <TemplateForm
          initial={editing}
          categories={categories}
          onSave={(item) =>
            item.id ? updateTemplate(item.id, item) : addTemplate(item)
          }
          onClose={() => setEditing(null)}
        />
      )}{" "}
      {viewing && (
        <div className="modal-backdrop">
          <article className="dashboard-modal preview-modal">
            <header>
              <h2>{viewing.name}</h2>
              <button onClick={() => setViewing(null)}>
                <X size={18} />
              </button>
            </header>
            <TemplateThumb shade={viewing.shade} label={viewing.name} />
            <p>{viewing.description}</p>
            <span className="outlined-tag">{viewing.category}</span>
          </article>
        </div>
      )}{" "}
      {confirm && (
        <div className="modal-backdrop">
          <article className="dashboard-modal confirm-modal">
            <h2>Delete template?</h2>
            <p>This action cannot be undone.</p>
            <div>
              <button onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className="danger"
                onClick={() => {
                  deleteTemplate(confirm.id);
                  setConfirm(null);
                }}
              >
                Delete
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
