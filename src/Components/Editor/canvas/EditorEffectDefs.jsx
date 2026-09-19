import { effectFilter } from "../model/effectsFilter.js";

/*
 * Every effect filter on the page, rendered once.
 *
 * The canvas, the page strip and display mode all draw the same elements, and
 * one definition per element serves all of them because the filter's numbers
 * are relative to the element's own box. Mount this once near the top of the
 * editor, not inside each surface: duplicate ids resolve to the first match,
 * and a surface that unmounts would take its copy with it.
 *
 * The host SVG is zero-sized and never display:none — Chrome stops drawing
 * filters that live inside an SVG hidden that way.
 */

function Primitive({ tag: Tag, children, ...props }) {
  return <Tag {...props}>{children?.map((child, index) => <Primitive key={index} {...child} />)}</Tag>;
}

/** items: [{ id, w, h, effects, extra, outline }] — extra is canvas pixels drawn past the box; outline is { color, width }. */
export default function EditorEffectDefs({ items }) {
  const filters = items.map((item) => effectFilter(item.id, item.effects, item.w, item.h, { extra: item.extra, outline: item.outline })).filter(Boolean);
  return (
    <svg className="editor-effect-defs" width="0" height="0" aria-hidden="true" focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        {filters.map((filter) => (
          <filter key={filter.id} id={filter.id} x={filter.region.x} y={filter.region.y}
            width={filter.region.width} height={filter.region.height}
            filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
            {filter.primitives.map((primitive, index) => <Primitive key={index} {...primitive} />)}
          </filter>
        ))}
      </defs>
    </svg>
  );
}
