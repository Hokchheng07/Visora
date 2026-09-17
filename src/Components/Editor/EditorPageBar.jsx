import { Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/hook.js";
import { pageAnimationChanged, pageBackgroundChanged } from "../redux/editorSlice.js";
import { animationPresets } from "./animationPresets.js";
import { pageLabel } from "./layerModel.js";
import { SwatchButton, ToolPopover } from "./EditorControls.jsx";

/*
 * The page bar, pinned above the canvas. It shows only while nothing is
 * selected: select an element and every setting for it is in the Customize
 * column instead, so the same control never lives in two places.
 */
export default function EditorPageBar() {
  const dispatch = useAppDispatch();
  const { pages, currentPage, selectedIds, gesture } = useAppSelector((state) => state.editor);
  if (selectedIds.length) return null;
  return <PageProperties page={pages[currentPage]} label={pageLabel(pages[currentPage], currentPage)} busy={!!gesture} dispatch={dispatch} />;
}

/* Nothing selected: the bar describes the page. For a backdrop the background
   is most of the design, so it gets a named button rather than a bare chip. */
function PageProperties({ page, label, busy, dispatch }) {
  const background = page.background?.value || "#FFFFFF";
  const preset = page.animation?.preset || "none";
  return (
    <div className="editor-shape-tools" role="group" aria-label="Page settings"
      onPointerDown={(event) => event.stopPropagation()}>
      <div className="editor-toolbar-group">
        {/* The page's own name, so a rename shows here too; falls back to "Page N". */}
        <span className="editor-selected-name" title={label}>{label}</span>
      </div>
      <div className="editor-toolbar-group">
        <SwatchButton label="Background" named value={background} disabled={busy}
          onChange={(value) => dispatch(pageBackgroundChanged({ type: "COLOR", value }))} />
      </div>
      <div className="editor-toolbar-group">
        <span className="editor-canvas-size">1920 &times; 1080</span>
      </div>
      <div className="editor-toolbar-group">
        <ToolPopover label="Page animation" disabled={busy} panelClassName="editor-popover-list"
          trigger={<><Sparkles size={16} aria-hidden="true" /><span className="editor-ctl-text">Animate</span></>}>
          {animationPresets.map((item) => (
            <button type="button" key={item.id} className="editor-menu-row" aria-pressed={preset === item.id}
              onClick={() => dispatch(pageAnimationChanged(item.id))}>
              <span>{item.label}</span>
            </button>
          ))}
        </ToolPopover>
      </div>
    </div>
  );
}
