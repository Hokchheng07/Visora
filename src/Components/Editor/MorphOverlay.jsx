import { ElementArtwork } from "./EditorElement.jsx";
import EditorEffectDefs from "./EditorEffectDefs.jsx";
import { hasVisibleEffects, strokeOverflow } from "./effectsFilter.js";
export default function MorphOverlay({ rootRef, pairs, oldPage, page, reducedMotion }) {
  return <div className="editor-morph-overlay" ref={rootRef} aria-hidden="true" inert>
    <div className="editor-morph-background" style={{ background: oldPage.background?.value || "#FFFFFF" }} />
    <div className="editor-morph-background" style={{ background: page.background?.value || "#FFFFFF", opacity: 0 }} />
    {pairs.map((pair, index) => <div key={index} className={`editor-morph-box${reducedMotion ? " is-reduced" : ""}`}>
      {[["old", pair.from], ["new", pair.to]].map(([side, element]) => element && <div key={side} className="editor-morph-look" data-morph-look={side} style={{ opacity: side === "old" ? 1 : 0 }}>
        {hasVisibleEffects(element) && <EditorEffectDefs items={[{ ...element, extra: strokeOverflow(element) }]} />}
        <ElementArtwork element={{ ...element, opacity: 1 }} />
      </div>)}
    </div>)}
  </div>;
}
