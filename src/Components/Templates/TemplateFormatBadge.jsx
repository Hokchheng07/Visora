export default function TemplateFormatBadge({ format, compact = false }) {
  const pageLabel = `${format.pageCount} ${format.pageCount === 1 ? "page" : "pages"}`;

  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap ${compact ? "gap-1" : "gap-2"}`}
      title={format.label}
      aria-label={format.label}
    >
      <span className={`${compact ? "text-[11px]" : "text-[13px]"} font-semibold text-primary`}>
        {format.orientation}
      </span>
      <span
        className={`${compact ? "h-1.5 w-1.5" : "h-2 w-2"} rotate-45 rounded-[1px] bg-[var(--color-secondary)]`}
        aria-hidden="true"
      />
      <span className={`${compact ? "text-[11px]" : "text-[13px]"} font-medium tabular-nums text-[var(--text-muted)]`}>
        {pageLabel}
      </span>
    </span>
  );
}
