import { Heart, UsersRound } from "lucide-react";

import TemplatePreview from "./TemplatePreview";

export default function TemplateCard({
  template,
  favorite,
  onFavorite,
  onOpen,
}) {
  return (
    <article className="relative h-full overflow-hidden rounded-[18px] border border-[var(--border-card)] bg-[var(--surface-card)] p-2 shadow-[0_8px_20px_rgba(112,90,224,0.10)] transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_14px_28px_rgba(112,90,224,0.18)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.20)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.35)]">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full overflow-hidden rounded-[14px] bg-accent/60 p-1.5"
      >
        <div className="aspect-video overflow-hidden rounded-[11px] bg-[#faf9f4]">
          <TemplatePreview template={template} />
        </div>
      </button>

      <div className="px-1.5 pb-1.5 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={onOpen} className="min-w-0 text-left">
            <h3 className="truncate text-sm font-semibold text-[var(--text-heading)] sm:text-base">
              {template.title}
            </h3>
          </button>

          <button
            type="button"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorite}
            onClick={onFavorite}
            className="shrink-0 transition hover:scale-110"
          >
            <Heart
              size={19}
              className={
                favorite
                  ? "fill-primary text-primary"
                  : "text-[var(--text-heading)]"
              }
            />
          </button>
        </div>

        <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-[var(--text-muted)] sm:text-xs">
          {template.description}
        </p>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 gap-1 overflow-hidden">
            {template.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={tag}
                className={`max-w-[6rem] shrink-0 truncate rounded-full px-2 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                  index === 0
                    ? "bg-primary/10 text-primary"
                    : index === 1
                      ? "bg-secondary/20 text-[var(--text-heading)]"
                      : "bg-accent/20 text-primary"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1 text-[10px] text-[var(--text-muted)] sm:text-xs">
            <UsersRound size={12} />
            {template.users} uses
          </div>
        </div>
      </div>
    </article>
  );
}