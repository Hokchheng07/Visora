import { useMemo, useState } from "react";
import { BookText, ChevronDown, Ellipsis, FolderOpen, Funnel, GraduationCap, Handshake, Pencil, Power, PowerOff, Search, Sparkles, Trash2, Trophy, X } from "lucide-react";
import { Modal, Pagination, RowMenu, formatDate } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import "./admin-categories.css";

// Category details are not in the shared mock data yet, so they live here.
// Template counts are still read live from the templates list.
const seedCategories = [
  ["Examination", "Templates for exams, tests, and academic evaluations.", "2024-05-24", "10:30 AM", GraduationCap, "purple", true],
  ["Workshop", "Workshop and training session templates.", "2024-05-23", "09:15 AM", Handshake, "orange", false],
  ["Graduation", "Graduation ceremony and celebration templates.", "2024-05-22", "06:45 PM", GraduationCap, "green", true],
  ["Khmer Events", "Khmer cultural events and traditional celebration templates.", "2024-05-21", "04:20 PM", Sparkles, "red", true],
  ["Seminar", "Seminar, conference and meeting templates.", "2024-05-20", "08:50 PM", FolderOpen, "blue", true],
  ["Portfolio", "Portfolio and project presentation templates.", "2024-05-20", "08:50 PM", BookText, "violet", false],
  ["Competition", "Competition and challenge event templates.", "2024-05-20", "08:50 PM", Trophy, "teal", true],
  ["Others", "Other general purpose templates.", "2024-05-18", "10:30 AM", Ellipsis, "yellow", false],
].map(([name, description, createdAt, createdTime, icon, tone, filled], index) => ({
  id: index + 1,
  name,
  description,
  createdAt,
  createdTime,
  icon,
  tone,
  filled,
  active: true,
}));
const perPage = 8;

function EditCategory({ category, onSave, onClose }) {
  const [form, setForm] = useState({ name: category.name, description: category.description });
  return (
    <Modal title="Edit category" onClose={onClose}>
      <form
        className="ad-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
          onClose();
        }}
      >
        <header>
          <h2>Edit Category</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <label>
          Name
          <span className="ad-control">
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </span>
        </label>
        <label>
          Description
          <span className="ad-control">
            <textarea rows={3} required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </span>
        </label>
        <div className="ad-modal-actions">
          <button type="button" className="ad-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="ad-button primary">Save Category</button>
        </div>
      </form>
    </Modal>
  );
}

export default function CategoryManagement() {
  const { templates } = useDashboardData();
  const [categories, setCategories] = useState(seedCategories);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const counts = useMemo(() => {
    const map = {};
    templates.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + 1;
    });
    return map;
  }, [templates]);
  const countFor = (name) => counts[name] || 0;
  const update = (id, patch) => setCategories((old) => old.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const result = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return categories
      .filter((c) => `${c.name} ${c.description}`.toLowerCase().includes(needle))
      .sort((a, b) => {
        if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "templates") return (counts[b.name] || 0) - (counts[a.name] || 0);
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [categories, counts, query, sort]);

  const pageCount = Math.ceil(result.length / perPage);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const shown = result.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="ad-page cm-page">
      <div className="cm-toolbar">
        <label className="ad-control search cm-search">
          <Search size={18} strokeWidth={2.5} aria-hidden="true" />
          <span className="sr-only">Search categories</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search category by name or description..."
          />
        </label>
        <div className="cm-toolbar-end">
          <label className="ad-control ad-sort">
            <span className="ad-sort-label">Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name A–Z</option>
              <option value="templates">Most templates</option>
            </select>
            <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
          </label>
          <button type="button" className="ad-button icon-only" disabled title="More filters coming soon" aria-label="More filters, coming soon">
            <Funnel size={16} fill="currentColor" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ad-table-card stack-wide cm-table">
        <table className="ad-table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Description</th>
              <th scope="col" className="is-center">Templates</th>
              <th scope="col" className="is-center">Status</th>
              <th scope="col">Created At</th>
              <th scope="col" className="is-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="ad-table-empty">No categories match your search.</td>
              </tr>
            )}
            {shown.map((c) => {
              const Icon = c.icon;
              return (
                <tr key={c.id}>
                  <td className="is-primary">
                    <div className="cm-name">
                      <span className={`cm-icon ${c.tone}`}>
                        <Icon size={22} fill={c.filled ? "currentColor" : "none"} strokeWidth={c.filled ? 1.5 : 2.2} aria-hidden="true" />
                      </span>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td data-label="Description" className="cm-description">{c.description}</td>
                  <td data-label="Templates" className="is-center">
                    <span className="cm-count">{countFor(c.name).toLocaleString()}</span>
                  </td>
                  <td data-label="Status" className="is-center">
                    <span className={`ad-pill ${c.active ? "green" : "gray"} cm-status`}>
                      <i className="dot" aria-hidden="true" />
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="Created At">
                    <div className="ad-date">
                      <strong>{formatDate(c.createdAt)}</strong>
                      <small>{c.createdTime}</small>
                    </div>
                  </td>
                  <td className="is-center is-actions">
                    <RowMenu
                      label={`Actions for ${c.name}`}
                      items={[
                        { label: "Edit", icon: Pencil, onSelect: () => setEditing(c) },
                        c.active
                          ? { label: "Deactivate", icon: PowerOff, onSelect: () => update(c.id, { active: false }) }
                          : { label: "Activate", icon: Power, onSelect: () => update(c.id, { active: true }) },
                        { label: "Delete", icon: Trash2, danger: true, onSelect: () => setConfirm(c) },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} pageCount={pageCount} total={result.length} perPage={perPage} noun="categories" onChange={setPage} variant="outlined" />

      {editing && <EditCategory category={editing} onSave={(patch) => update(editing.id, patch)} onClose={() => setEditing(null)} />}
      {confirm && (
        <Modal title="Delete category" onClose={() => setConfirm(null)}>
          <header>
            <h2>Delete {confirm.name}?</h2>
          </header>
          <p>The category is removed from this list. Its templates are not deleted.</p>
          <div className="ad-modal-actions">
            <button type="button" className="ad-button" onClick={() => setConfirm(null)}>Cancel</button>
            <button
              type="button"
              className="ad-button danger"
              onClick={() => {
                setCategories((old) => old.filter((c) => c.id !== confirm.id));
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
