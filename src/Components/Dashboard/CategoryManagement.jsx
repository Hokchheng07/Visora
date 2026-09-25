import { useMemo, useState } from "react";
import {
  ChevronDown,
  FolderOpen,
  Funnel,
  Pencil,
  Power,
  PowerOff,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Modal, Pagination, RowMenu, formatDate } from "./AdminUi";
import { useDashboardData } from "./dashboardData";
import { useGetCategoriesQuery } from "../API/categoryApi";

import "./admin-categories.css";

const perPage = 8;

function EditCategory({ category, onSave, onClose }) {
  const [form, setForm] = useState({
    name: category.name || "",
    description: category.description || "",
  });

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
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
            />
          </span>
        </label>

        <label>
          Description
          <span className="ad-control">
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
            />
          </span>
        </label>

        <div className="ad-modal-actions">
          <button type="button" className="ad-button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="ad-button primary">
            Save Category
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CategoryManagement() {
  const { templates } = useDashboardData();

  // Get real categories from backend
  const { data, isLoading, isError } = useGetCategoriesQuery();
  console.log("CATEGORY API RESPONSE:", JSON.stringify(data, null, 2));

  // Temporary local state for UI actions.
  // We will connect these to Admin API later.
  const [localCategories, setLocalCategories] = useState({});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  /*
   * Backend response is expected to look like:
   *
   * {
   *   data: [...]
   * }
   */
  const categories = useMemo(() => {
    const backendCategories = Array.isArray(data?.data?.contents)
      ? data.data.contents
      : [];

    return backendCategories
      .filter((category) => !localCategories[category.uuid]?.deleted)
      .map((category) => ({
        ...category,

        // Make sure the UI has an id
        id: category.uuid,

        // Temporary UI status
        active:
          localCategories[category.uuid]?.active ?? category.isactive ?? true,

        // Temporary UI values
        icon: FolderOpen,
        tone: "blue",
        filled: false,
      }));
  }, [data, localCategories]);

  // Count templates belonging to each category
  const counts = useMemo(() => {
    const map = {};

    templates.forEach((template) => {
      if (!template.category) return;

      map[template.category] = (map[template.category] || 0) + 1;
    });

    return map;
  }, [templates]);

  const countFor = (name) => counts[name] || 0;

  // Temporary local update.
  // Later replace this with updateCategory API.
  const update = (id, patch) => {
    setLocalCategories((old) => ({
      ...old,
      [id]: {
        ...old[id],
        ...patch,
      },
    }));
  };

  // Search + sort
  const result = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return categories
      .filter((category) =>
        `${category.name || ""} ${category.description || ""}`
          .toLowerCase()
          .includes(needle),
      )
      .sort((a, b) => {
        if (sort === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }

        if (sort === "templates") {
          return countFor(b.name) - countFor(a.name);
        }

        if (sort === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }

        // newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [categories, query, sort, counts]);

  const pageCount = Math.ceil(result.length / perPage);

  const currentPage = Math.min(page, Math.max(pageCount, 1));

  const shown = result.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  // Loading
  if (isLoading) {
    return (
      <div className="ad-page cm-page">
        <div className="ad-table-card stack-wide cm-table">
          <div className="ad-table-empty">Loading categories...</div>
        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="ad-page cm-page">
        <div className="ad-table-card stack-wide cm-table">
          <div className="ad-table-empty">Failed to load categories.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-page cm-page">
      {/* Toolbar */}
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

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest</option>

              <option value="oldest">Oldest</option>

              <option value="name">Name A–Z</option>

              <option value="templates">Most templates</option>
            </select>

            <ChevronDown size={16} strokeWidth={2.5} aria-hidden="true" />
          </label>

          <button
            type="button"
            className="ad-button icon-only"
            disabled
            title="More filters coming soon"
            aria-label="More filters, coming soon"
          >
            <Funnel size={16} fill="currentColor" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Category table */}
      <div className="ad-table-card stack-wide cm-table">
        <table className="ad-table">
          <thead>
            <tr>
              <th scope="col">Category</th>

              <th scope="col">Description</th>

              <th scope="col" className="is-center">
                Templates
              </th>

              <th scope="col" className="is-center">
                Status
              </th>

              <th scope="col">Created At</th>

              <th scope="col" className="is-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="ad-table-empty">
                  No categories match your search.
                </td>
              </tr>
            )}

            {shown.map((category) => {
              const Icon = category.icon;

              return (
                <tr key={category.uuid}>
                  {/* Category */}
                  <td className="is-primary">
                    <div className="cm-name">
                      <span className={`cm-icon ${category.tone}`}>
                        <Icon
                          size={22}
                          fill={category.filled ? "currentColor" : "none"}
                          strokeWidth={category.filled ? 1.5 : 2.2}
                          aria-hidden="true"
                        />
                      </span>

                      <strong>{category.name}</strong>
                    </div>
                  </td>

                  {/* Description */}
                  <td data-label="Description" className="cm-description">
                    {category.description || "—"}
                  </td>

                  {/* Template count */}
                  <td data-label="Templates" className="is-center">
                    <span className="cm-count">
                      {countFor(category.name).toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td data-label="Status" className="is-center">
                    <span
                      className={`ad-pill ${
                        category.active ? "green" : "gray"
                      } cm-status`}
                    >
                      <i className="dot" aria-hidden="true" />

                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td data-label="Created At">
                    <div className="ad-date">
                      <strong>
                        {category.createdAt
                          ? formatDate(category.createdAt)
                          : "—"}
                      </strong>

                      <small>
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </small>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="is-center is-actions">
                    <RowMenu
                      label={`Actions for ${category.name}`}
                      items={[
                        {
                          label: "Edit",
                          icon: Pencil,
                          onSelect: () => setEditing(category),
                        },

                        category.active
                          ? {
                              label: "Deactivate",
                              icon: PowerOff,
                              onSelect: () =>
                                update(category.uuid, {
                                  active: false,
                                }),
                            }
                          : {
                              label: "Activate",
                              icon: Power,
                              onSelect: () =>
                                update(category.uuid, {
                                  active: true,
                                }),
                            },

                        {
                          label: "Delete",
                          icon: Trash2,
                          danger: true,
                          onSelect: () => setConfirm(category),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={currentPage}
        pageCount={pageCount}
        total={result.length}
        perPage={perPage}
        noun="categories"
        onChange={setPage}
        variant="outlined"
      />

      {/* Edit modal */}
      {editing && (
        <EditCategory
          category={editing}
          onSave={(patch) => {
            update(editing.uuid, patch);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Delete modal */}
      {confirm && (
        <Modal title="Delete category" onClose={() => setConfirm(null)}>
          <header>
            <h2>Delete {confirm.name}?</h2>
          </header>

          <p>
            The category is removed from this list. Its templates are not
            deleted.
          </p>

          <div className="ad-modal-actions">
            <button
              type="button"
              className="ad-button"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="ad-button danger"
              onClick={() => {
                update(confirm.uuid, {
                  deleted: true,
                });

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
