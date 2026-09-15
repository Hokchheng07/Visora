import { ChevronDown, Minus, Plus, Ruler } from "lucide-react";
import { StaticElement } from "./EditorElement.jsx";

export default function EditorCanvasBar({
  pages,
  currentPage,
  onAddPage,
  onPageChange,
  onPageMove,
  onPageMenu,
  zoom,
  onZoom,
  showRulers,
  onToggleRulers,
}) {
  return (
    <div className="editor-canvas-bar">
      <button
        type="button"
        className={`editor-ruler-toggle${showRulers ? " is-active" : ""}`}
        onClick={onToggleRulers}
        aria-pressed={showRulers}
      >
        <Ruler size={15} aria-hidden="true" />
        <span>Rulers</span>
      </button>

      <div className="editor-page-strip">
        <div className="editor-page-thumbs">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              className={`editor-page-thumb${index === currentPage ? " is-active" : ""}`}
              onClick={() => onPageChange(index)}
              onContextMenu={(event) => onPageMenu(event, index)}
              aria-label={`Go to page ${index + 1}`}
              aria-current={index === currentPage}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/x-visora-page", String(index))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData("text/x-visora-page")); if (Number.isInteger(from)) onPageMove(from, index); }}
            >
              <span className="editor-thumb-art" aria-hidden="true">{page.elements.map((element) => <StaticElement key={element.id} element={element} />)}</span>
              <span className="editor-page-thumb-number">{index + 1}</span>
            </button>
          ))}
        </div>

        <div className="editor-page-add">
          <button type="button" onClick={onAddPage} aria-label="Add page" title="Add page">
            <Plus size={17} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Page options" title="Page options" onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onPageMenu({ preventDefault() {}, clientX: rect.left, clientY: rect.top }, currentPage);
          }}>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="editor-canvas-bar-tools">
        <span className="editor-page-count">Pages {currentPage + 1} / {pages.length}</span>
        {/* The percentage is measured; the steppers wait on real zoom controls. */}
        <div className="editor-zoom">
          <button type="button" onClick={() => onZoom(Math.max(.1, zoom / 100 - .1))} title="Zoom out" aria-label="Zoom out">
            <Minus size={14} aria-hidden="true" />
          </button>
          <button type="button" className="editor-zoom-value" onClick={() => onZoom(null)} title="Fit canvas"><span>{zoom}%</span></button>
          <button type="button" onClick={() => onZoom(Math.min(2, zoom / 100 + .1))} title="Zoom in" aria-label="Zoom in">
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
