import { ElementArtwork } from "../canvas/EditorElement.jsx";
import EditorEffectDefs from "../canvas/EditorEffectDefs.jsx";
import { hasVisibleEffects, strokeOverflow } from "../model/effectsFilter.js";
import { pageBackgroundCss } from "../model/pageBackground.js";
export default function MorphOverlay({ rootRef, pairs, oldPage, page, reducedMotion, showBackground = true }) {
  return <div className="editor-morph-overlay" ref={rootRef} aria-hidden="true" inert>
    {showBackground && <><div className="editor-morph-background" style={{ background: pageBackgroundCss(oldPage.background) }} />
      <div className="editor-morph-background" style={{ background: pageBackgroundCss(page.background), opacity: 0 }} /></>}
    {pairs.map((pair, index) => <div key={index} className={`editor-morph-box${reducedMotion ? " is-reduced" : ""}`}>
      {[["old", pair.from], ["new", pair.to]].map(([side, element]) => element && <div key={side} className="editor-morph-look" data-morph-look={side} style={{ opacity: side === "old" ? 1 : 0 }}>
        {hasVisibleEffects(element) && <EditorEffectDefs items={[{ ...element, extra: strokeOverflow(element) }]} />}
        <ElementArtwork element={{ ...element, opacity: 1 }} />
      </div>)}
    </div>)}
  </div>;
}
