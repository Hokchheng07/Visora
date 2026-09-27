import { useMemo, useState } from "react";
import {
  ChevronDown,
  Funnel,
  Pencil,
  Power,
  PowerOff,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { AdminNotice, Modal, Pagination, RowMenu, formatDate } from "./AdminUi";
import { categoryUpdate } from "./categoryUpdate.js";
import { CATEGORY_ICONS, categoryIcon, categoryTone, guessCategoryIcon } from "./categoryIcons";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "../API/categoryApi";

import "./admin-categories.css";

const perPage = 8;

function EditCategory({ category, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name: category.name || "",
    description: category.description || "",
    // The saved icon, or the one the name suggests, so the picker always shows a choice.
    icon: CATEGORY_ICONS.some((choice) => choice.key === category.icon) ? category.icon : guessCategoryIcon(category.name),
  });
  const [error, setError] = useState(null);

  return (
    <Modal title="Edit category" onClose={onClose}>
      <form
        className="ad-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          try {
            await onSave(form);
            onClose();
          } catch (saveError) {
            setError(saveError?.data?.message || "Unable to save this category.");
          }
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

        <fieldset className="cm-icon-picker">
          <legend>Icon</legend>
          <div role="radiogroup" aria-label="Category icon">
            {CATEGORY_ICONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={form.icon === key}
                aria-label={label}
                title={label}
                className={form.icon === key ? "is-active" : ""}
                onClick={() => setForm({ ...form, icon: key })}
              >
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p className="ad-form-error" role="alert">{error}</p>}

        <div className="ad-modal-actions">
          <button type="button" className="ad-button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="ad-button primary" disabled={saving}>
            Save Category
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function CategoryManagement() {
  const { data, isLoading, isError } = useGetCategoriesQuery();
  const [updateCategory, { isLoading: isSaving }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // The server has no icon or colour per category, so the icon comes from
  // what the name is about (see categoryIcons) and the colour from its row.
  const categories = useMemo(
    () =>
      (data?.data?.contents ?? []).map((category, index) => ({
        ...category,
        active: category.isActive ?? true,
        // The drawn icon; `icon` stays the server's saved key, so an update sends it back unchanged.
        Icon: categoryIcon(category.name, category.icon),
        tone: categoryTone(index),
        filled: false,
      })),
    [data],
  );

  const setActive = async (category, isActive) => {
    setMutationError(null);
    try {
      await updateCategory(categoryUpdate(category, { isActive })).unwrap();
      setSuccessNotice({
        title: isActive ? "Category activated" : "Category deactivated",
        message: `${category.name} is now ${isActive ? "available" : "hidden"}.`,
      });
    } catch (error) {
      setMutationError(error?.data?.message || "Unable to change this category.");
    }
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
          return (b.templateCount ?? 0) - (a.templateCount ?? 0);
        }

        if (sort === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }

        // newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [categories, query, sort]);

  const pageCount = Math.ceil(result.length / perPage);

  const currentPage = Math.min(page, Math.max(pageCount, 1));

  const shown = result.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  if (isLoading || isError) {
    return (
      <div className="ad-page cm-page">
        <div className="ad-table-card stack-wide cm-table">
          <div className="ad-table-empty">
            {isLoading ? "Loading categories…" : "Could not load categories. Try refreshing the page."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-page cm-page">
      {successNotice && (
        <AdminNotice {...successNotice} onDismiss={() => setSuccessNotice(null)} />
      )}

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

      {mutationError && <p className="ad-alert" role="alert">{mutationError}</p>}

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
              const Icon = category.Icon;

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
                      {(category.templateCount ?? 0).toLocaleString()}
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
                              onSelect: () => setActive(category, false),
                            }
                          : {
                              label: "Activate",
                              icon: Power,
                              onSelect: () => setActive(category, true),
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
          saving={isSaving}
          onSave={async (patch) => {
            setMutationError(null);
            await updateCategory(categoryUpdate(editing, patch)).unwrap();
            setSuccessNotice({
              title: "Category updated",
              message: `${patch.name.trim()} was saved successfully.`,
            });
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
            The category is deleted for everyone. Its templates are not
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
              disabled={isDeleting}
              onClick={async () => {
                setMutationError(null);
                try {
                  await deleteCategory(confirm.uuid).unwrap();
                  setConfirm(null);
                } catch (error) {
                  setMutationError(error?.data?.message || "Unable to delete this category.");
                  setConfirm(null);
                }
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
