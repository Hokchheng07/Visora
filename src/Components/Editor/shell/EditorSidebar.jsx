import { editorSidebarItems } from "./editorSidebarConfig";

export default function EditorSidebar({ activeTool, onToolChange, isPanelOpen = true, ref }) {
  function handleKeyDown(event, index) {
    const last = editorSidebarItems.length - 1;
    const next = {
      ArrowDown: (index + 1) % editorSidebarItems.length,
      ArrowUp: (index + last) % editorSidebarItems.length,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onToolChange(editorSidebarItems[next].id);
    event.currentTarget.parentElement.children[next].focus();
  }

  return (
    <nav ref={ref} className="editor-tool-rail" aria-label="Design tools">
      <div role="tablist" aria-label="Editor tools" aria-orientation="vertical">
        {editorSidebarItems.map(({ id, label, icon: Icon }, index) => (
          <button
            key={id}
            id={`editor-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeTool === id}
            aria-expanded={isPanelOpen && activeTool === id}
            aria-controls={`editor-panel-${id}`}
            tabIndex={activeTool === id ? 0 : -1}
            className="editor-tool-button"
            onClick={() => onToolChange(id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <Icon size={27} strokeWidth={1.65} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
