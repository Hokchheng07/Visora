import { LoaderCircle, Search, TriangleAlert } from "lucide-react";

import Pagination from "./Pagination";
import TemplateCard from "./TemplateCard";

export default function TemplateGrid({
  templates,
  loading,
  error,
  activeCategory,
  favorites,
  onFavorite,
  onOpen,
  onReset,
  page,
  totalPages,
  onPageChange,
}) {
  if (loading) {
    return (
      <section className="flex min-h-[420px] min-w-0 flex-1 items-center justify-center">
        <div className="text-center">
          <LoaderCircle size={38} className="mx-auto animate-spin text-primary" />

          <p className="mt-3 text-sm text-[var(--text-body)]">
            Loading templates...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[420px] min-w-0 flex-1 items-center justify-center">
        <div className="text-center">
          <TriangleAlert size={38} className="mx-auto text-primary" />

          <h3 className="mt-3 font-semibold text-[var(--text-heading)]">
            Unable to load templates
          </h3>

          <p className="mt-1 text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 flex-1">
      {activeCategory !== "All" && (
        <div className="mb-4 flex justify-end px-1">
          <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            {activeCategory}
          </span>
        </div>
      )}

      {templates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                favorite={favorites.includes(template.id)}
                onFavorite={() => onFavorite(template.id)}
                onOpen={() => onOpen(template)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={onPageChange}
          />
        </>
      ) : (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-8 text-center">
          <Search size={40} className="text-primary" />

          <h3 className="mt-4 text-xl font-semibold text-[var(--text-heading)]">
            No templates found
          </h3>

          <p className="mt-2 max-w-sm text-sm text-[var(--text-body)]">
            Try changing your category, search, or filters.
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Reset filters
          </button>
        </div>
      )}
    </section>
  );
}