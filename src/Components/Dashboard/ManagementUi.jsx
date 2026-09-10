import { ChevronLeft, ChevronRight } from "lucide-react";

export function Avatar({ name }) {
  return (
    <span className="member-avatar">
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}
export function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
  );
}
export function Pagination({ text }) {
  return (
    <footer className="management-pagination">
      <p>{text}</p>
      <div>
        <button aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className="active">1</button>
        <button>2</button>
        <button>3</button>
        <span>...</span>
        <button>10</button>
        <button aria-label="Next">
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  );
}
export function StatCards({ items }) {
  return (
    <section className="stats-grid">
      {items.map(([label, value, Icon, shade]) => (
        <article className="stat-card" key={label}>
          <span className={`stat-icon ${shade}`}>
            <Icon size={22} />
          </span>
          <div>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
export function TemplateThumb({ shade = "violet", label = "T" }) {
  return (
    <span className={`management-thumb ${shade}`}>
      <i>{label.slice(0, 1)}</i>
      <b />
      <em />
      <small />
    </span>
  );
}
