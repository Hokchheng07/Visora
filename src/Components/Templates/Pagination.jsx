import { ChevronLeft, ChevronRight } from "lucide-react";

import yellow from "../../assets/pages/templates/yellow.svg";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="relative mt-10 flex justify-center sm:mt-12 lg:mt-16">
      <div className="flex items-center gap-0.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-1 shadow-sm sm:p-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onChange(Math.max(1, page - 1))}
          className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9"
        >
          <ChevronLeft size={17} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (number) => (
            <button
              key={number}
              type="button"
              onClick={() => onChange(number)}
              className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs font-semibold transition sm:h-9 sm:min-w-9 sm:text-sm ${
                page === number
                  ? "bg-primary text-white"
                  : "text-[var(--text-body)] hover:bg-primary/10"
              }`}
            >
              {number}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={page === totalPages}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted)] transition hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <img
        src={yellow}
        alt=""
        className="pointer-events-none absolute left-[calc(50%+60px)] top-1/2 hidden w-[65px] -translate-y-1/2 select-none sm:block lg:w-[85px]"
      />
    </div>
  );
}