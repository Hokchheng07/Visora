import { useRef } from "react";
import { ChevronDown, Minus, Plus, Ruler } from "lucide-react";
import { StaticElement } from "./EditorElement.jsx";
import { pageLabel, visibleElements } from "../model/layerModel.js";

export default function EditorCanvasBar({
  pages,
  currentPage,
  selectedPages = [],
  onAddPage,
  onPageChange,
  onPageSelect,
  onPageMove,
  onPageMenu,
  zoom,
  onZoom,
  showRulers,
  onToggleRulers,
}) {
  const selected = new Set(selectedPages.length ? selectedPages : [pages[currentPage]?.id]);
  const anchor = useRef(currentPage);

  function choose(event, index) {
    const id = pages[index].id;
    if (event.shiftKey) {
      const [from, to] = [anchor.current, index].sort((a, b) => a - b);
      onPageSelect(pages.slice(from, to + 1).map((page) => page.id), id);
      return;
    }
    anchor.current = index;
    if (event.metaKey || event.ctrlKey) {
      const next = selected.has(id) ? [...selected].filter((item) => item !== id) : [...selected, id];
      // The last page cannot be deselected: something is always current.
      onPageSelect(next.length ? next : [id], selected.has(id) ? pages[currentPage].id : id);
      return;
    }
    onPageChange(index);
  }

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
        {/* A multi-select list, not a row of buttons: Ctrl-click adds a page,
            Shift-click takes the run from the last one clicked, Ctrl+A takes
            the lot. The anchor is kept here because it is about what was
            clicked, not about the document. */}
        <div className="editor-page-thumbs" role="listbox" aria-multiselectable="true" aria-label="Pages"
          onKeyDown={(event) => {
            if (event.key.toLowerCase() !== "a" || !(event.metaKey || event.ctrlKey)) return;
            event.preventDefault();
            onPageSelect(pages.map((page) => page.id), pages[currentPage].id);
          }}>
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              role="option"
              className={`editor-page-thumb${index === currentPage ? " is-active" : ""}${selected.has(page.id) ? " is-selected" : ""}`}
              onClick={(event) => choose(event, index)}
              onContextMenu={(event) => {
                // Right-clicking outside the selection moves it, the way a file
                // manager does; inside it, the menu acts on every page picked.
                if (!selected.has(page.id)) choose(event, index);
                onPageMenu(event, index);
              }}
              aria-label={`Go to page ${index + 1}: ${pageLabel(page, index)}`}
              title={pageLabel(page, index)}
              aria-current={index === currentPage}
              aria-selected={selected.has(page.id)}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/x-visora-page", String(index))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData("text/x-visora-page")); if (Number.isInteger(from)) onPageMove(from, index); }}
            >
              {/* The page's own colour, so the strip shows the page and not a
                  white card with the page's elements floating on it. */}
              <span className="editor-thumb-art" aria-hidden="true" style={{ background: page.background?.type === "COLOR" ? page.background.value : "#FFFFFF" }}>
                {visibleElements(page).map((element) => <StaticElement key={element.id} element={element} />)}</span>
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
