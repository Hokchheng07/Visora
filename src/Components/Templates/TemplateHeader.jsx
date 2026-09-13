import { PenLine, Search, SlidersHorizontal } from "lucide-react";
import yellowLine from "../../assets/pages/templates/yellow-line.svg";

export default function TemplateHeader({
  search,
  setSearch,
  onCreate,
  onToggleFilters,
  activeFilterCount = 0,
}) {
  return (
    <div className="mx-auto max-w-6xl text-center">
      <h1 className="text-[32px] font-bold leading-[1.15] text-[var(--text-heading)] min-[375px]:text-4xl sm:text-5xl lg:whitespace-nowrap lg:text-[46px] xl:text-[50px]">
        Find Your Perfect{" "}
        <span className="relative inline-block text-primary">
          Templates

          <img
            src={yellowLine}
            alt=""
            className="pointer-events-none absolute -bottom-4 left-1/2 w-[95%] -translate-x-1/2 select-none"
          />
        </span>
      </h1>

      <p className="mx-auto mt-4 max-w-2xl px-2 text-sm leading-7 text-[var(--text-body)] sm:text-base">
        Start with a professionally designed backdrop and make it uniquely yours.
      </p>

      <div className="mx-auto mt-5 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Templates..."
            className="h-12 w-full rounded-xl border border-[var(--border-card)] bg-[var(--surface-overlay)] pl-11 pr-12 text-sm text-[var(--text-heading)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          <button
            type="button"
            onClick={onToggleFilters}
            aria-label="Toggle filters"
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-primary transition hover:bg-primary/10 min-[900px]:hidden"
          >
            <SlidersHorizontal size={18} />

            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-secondary px-1 text-[9px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 active:scale-[0.98]"
        >
          <PenLine size={18} />
          Create from Scratch
        </button>
      </div>
    </div>
  );
}