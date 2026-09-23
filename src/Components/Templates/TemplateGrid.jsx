import { Search, TriangleAlert } from "lucide-react";

import Pagination from "./Pagination";
import TemplateCard from "./TemplateCard";
import VisoraLoader from "../ui/VisoraLoader";

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
  const previewLoader = import.meta.env.DEV
    && new URLSearchParams(window.location.search).has("loader-preview");

  if (loading || previewLoader) {
    return (
      <section className="flex min-h-[320px] min-w-0 flex-1 items-center justify-center md:min-h-[380px] lg:min-h-[420px]">
        <VisoraLoader label="Preparing your templates…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[320px] min-w-0 flex-1 items-center justify-center md:min-h-[380px] lg:min-h-[420px]">
        <div className="px-4 text-center">
          <TriangleAlert className="mx-auto h-9 w-9 text-primary lg:h-10 lg:w-10" />

          <h3 className="mt-3 font-semibold text-[var(--text-heading)]">
            Unable to load templates
          </h3>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 flex-1">
      {activeCategory !== "All" && (
        <div className="mb-4 flex justify-end">
          <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            {activeCategory}
          </span>
        </div>
      )}

      {templates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:gap-6 xl:grid-cols-3 xl:gap-7 2xl:gap-8">
            {templates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
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
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[var(--border-card)] bg-[var(--surface-card)] p-6 text-center sm:min-h-[360px] sm:p-8 lg:min-h-[420px]">
          <Search className="h-9 w-9 text-primary lg:h-10 lg:w-10" />

          <h3 className="mt-4 text-lg font-semibold text-[var(--text-heading)] sm:text-xl">
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
