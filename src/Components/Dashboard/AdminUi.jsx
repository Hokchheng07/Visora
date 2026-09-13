import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Ellipsis, UserRound } from "lucide-react";
import "./admin-ui.css";

// Building blocks shared by the redesigned admin pages (overview, users,
// templates). Styles live in admin-ui.css and read the --dash-* tokens.

// knockout: solid first shape with the inner lines cut out (globe, clock, file).
// outline: plain strokes, for icons that cannot be filled (check, cloud).
export function StatCard({ label, value, icon: Icon, tone, knockout, outline }) {
  return (
    <article className="ad-stat">
      <span className={`ad-stat-icon ${tone} ${knockout ? "is-knockout" : ""}`}>
        <Icon size={24} fill={knockout || outline ? "none" : "currentColor"} strokeWidth={knockout ? 2 : outline ? 2.6 : 1.5} aria-hidden="true" />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value.toLocaleString()}</strong>
      </div>
    </article>
  );
}

export function StatCards({ items, label = "Totals" }) {
  return (
    <section className={`ad-stats count-${items.length}`} aria-label={label}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </section>
  );
}

export function CardHeader({ icon: Icon, title, linkLabel, to, filled = true }) {
  return (
    <header className="ad-card-head">
      <h2>
        <Icon size={22} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 1.5 : 2} aria-hidden="true" />
        {title}
      </h2>
      {to && (
        <Link to={to}>
          {linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </header>
  );
}

export function UserAvatar({ size = 36 }) {
  return (
    <span className="ad-avatar" style={{ width: size, height: size }} aria-hidden="true">
      <UserRound size={Math.round(size * 0.78)} fill="currentColor" strokeWidth={1} />
    </span>
  );
}

export function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Page numbers with an ellipsis once there are more than 5 pages:
// 1 2 3 … 9, or 1 … 4 5 6 … 9 when the current page is in the middle.
function pageItems(page, pageCount) {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "end-gap", pageCount];
  if (page >= pageCount - 2) return [1, "start-gap", pageCount - 2, pageCount - 1, pageCount];
  return [1, "start-gap", page - 1, page, page + 1, "end-gap", pageCount];
}

export function Pagination({ page, pageCount, total, perPage, noun, onChange, variant = "filled" }) {
  const from = total ? (page - 1) * perPage + 1 : 0;
  const to = Math.min(page * perPage, total);
  const pages = Math.max(pageCount, 1);
  return (
    <footer className="ad-pagination">
      <p>Showing {from} to {to} of {total.toLocaleString()} {noun}</p>
      <nav aria-label={`${noun} pages`}>
        <button type="button" className="ad-page-arrow" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        {pageItems(page, pages).map((item) =>
          typeof item === "string" ? (
            <span key={item} className="ad-page-gap" aria-hidden="true"><Ellipsis size={20} strokeWidth={3} /></span>
          ) : (
            <button
              type="button"
              key={item}
              className={`ad-page-number ${item === page ? `is-current ${variant}` : ""}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ),
        )}
        <button type="button" className="ad-page-arrow" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>
      </nav>
    </footer>
  );
}

// "•••" actions menu. Rendered inside the page (not a portal) so it keeps the
// dashboard tokens; closes on outside click or Escape.
export function RowMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.type === "keydown" ? event.key === "Escape" : !ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div className="ad-row-menu" ref={ref}>
      <button type="button" className="ad-row-menu-trigger" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Ellipsis size={22} strokeWidth={3} />
      </button>
      {open && (
        <div className="ad-row-menu-list" role="menu">
          {items.map(({ label: itemLabel, icon: Icon, onSelect, danger }) => (
            <button
              type="button"
              role="menuitem"
              key={itemLabel}
              className={danger ? "danger" : undefined}
              onClick={() => {
                setOpen(false);
                onSelect();
              }}
            >
              {Icon && <Icon size={15} aria-hidden="true" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Modal({ title, onClose, children, className = "" }) {
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="ad-modal-backdrop" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`ad-modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        {children}
      </div>
    </div>
  );
}
