import {
  ChevronLeft,
  ChevronRight,
  Minimize,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Timer,
  ZoomIn,
} from "lucide-react";

// The unbuilt controls are kept visible but disabled, matching the rest of the
// editor's "coming soon" convention, so the bar keeps its final shape.
const PENDING = [
  { id: "zoom", icon: ZoomIn, label: "Zoom", note: "Zoom is coming soon" },
  { id: "draw", icon: Pencil, label: "Draw", note: "Drawing is coming soon" },
  { id: "effects", icon: Sparkles, label: "Effects", note: "Effects are coming soon" },
  { id: "timer", icon: Timer, label: "Timer", note: "Timers are coming soon" },
  { id: "more", icon: MoreHorizontal, label: "More options", note: "More options coming soon" },
];

export default function EditorDisplayBar({ pages, slide, onSlideChange, onClose }) {
  return (
    <div className="editor-display-bar" aria-label="Display controls">
      <div className="editor-display-nav">
        <button
          type="button"
          onClick={() => onSlideChange(slide - 1)}
          disabled={slide === 0}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={19} aria-hidden="true" />
        </button>
        <span className="editor-display-count">{slide + 1} / {pages.length}</span>
        <button
          type="button"
          onClick={() => onSlideChange(slide + 1)}
          disabled={slide === pages.length - 1}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight size={19} aria-hidden="true" />
        </button>
      </div>

      <div className="editor-display-tools">
        {PENDING.map(({ id, icon: Icon, label, note }) => (
          <button key={id} type="button" disabled aria-label={`${label} (coming soon)`} title={note}>
            <Icon size={18} aria-hidden="true" />
          </button>
        ))}
        <button
          type="button"
          className="editor-display-exit"
          onClick={onClose}
          aria-label="Exit display mode"
          title="Exit display mode"
        >
          <Minimize size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
