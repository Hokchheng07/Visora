export default function VisoraLoader({
  label = "Crafting your canvas…",
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`visora-loader ${compact ? "visora-loader-compact" : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="visora-loader-stage" aria-hidden="true">
        <span className="visora-loader-glow" />

        {["left", "center", "right"].map((position) => (
          <span key={position} className={`visora-loader-card visora-loader-card-${position}`}>
            <span className="visora-loader-card-flower">✦</span>
            <span className="visora-loader-card-line" />
            <span className="visora-loader-card-line visora-loader-card-line-short" />
          </span>
        ))}

        <span className="visora-loader-seal">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M24 8c2.4 6.4 7.5 8.9 7.5 15.2 0 4.4-3.1 7.2-7.5 9.8-4.4-2.6-7.5-5.4-7.5-9.8C16.5 16.9 21.6 14.4 24 8Z" />
            <path d="M9.5 22.2c6.9.5 10.2 4.8 14.5 10.8-7.1 1.6-12.5-.5-14.5-10.8ZM38.5 22.2C31.6 22.7 28.3 27 24 33c7.1 1.6 12.5-.5 14.5-10.8Z" />
            <circle cx="24" cy="34" r="3.6" />
          </svg>
        </span>

        <span className="visora-loader-spark visora-loader-spark-one" />
        <span className="visora-loader-spark visora-loader-spark-two" />
        <span className="visora-loader-spark visora-loader-spark-three" />

        <span className="visora-loader-track">
          <span className="visora-loader-progress" />
        </span>
      </div>

      <p className="visora-loader-label">{label}</p>
    </div>
  );
}
