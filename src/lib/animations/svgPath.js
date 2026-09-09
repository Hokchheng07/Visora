/*
 * Helpers for reading geometry out of Figma's exported SVGs.
 *
 * Figma exports dashed lines with the stroke outlined, so what arrives is a
 * single *filled* path made of one closed subpath per dash — there is no
 * stroked centreline to follow. `stroke-dashoffset` does nothing to it, and
 * `getPointAtLength` walks the dash outlines rather than the line. Anything
 * that needs to draw or travel along such a line has to rebuild a centreline
 * from the dashes first, which is what these three functions do together:
 *
 *   createSmoothPath(dashCentrelinePoints(getPathData(svgSource)))
 *
 * Used by the How It Works line on Home and the journey line on About.
 */

/** Pull the `d` of the first <path> out of a raw SVG source string. */
export const getPathData = (svgSource) =>
  svgSource.match(/<path d="([^"]+)"/)?.[1] ?? "";

/**
 * One point per dash, taken from each dash's start point.
 *
 * These exports carry a few decorative subpaths alongside the dashes — an
 * arrowhead, a handful of stray dots — and they always sit at the front of the
 * `d`. They are told apart by shape rather than by index: a dash is drawn with
 * curves (rounded caps) while the decorations are straight-line-only. That
 * holds for both current assets, and unlike a hardcoded slice count it does not
 * silently mis-align if one of them is re-exported with a different dash count.
 */
export const dashCentrelinePoints = (pathData) => {
  const points = (pathData.match(/M[\s\S]*?(?=M|$)/g) ?? [])
    .filter((subpath) => subpath.includes("C"))
    .map((subpath) => subpath.match(/^M(-?[\d.]+) (-?[\d.]+)/))
    .filter(Boolean)
    .map(([, x, y]) => ({ x: Number(x), y: Number(y) }));

  // The curve test is a heuristic about how Figma happens to export these. If a
  // future re-export breaks it, fail loudly in dev rather than quietly handing
  // back a path that is subtly wrong.
  if (points.length < 2 && import.meta.env.DEV) {
    throw new Error(
      `dashCentrelinePoints: extracted ${points.length} point(s). The artwork was ` +
        "probably re-exported with different path commands, so the \"contains C\" " +
        "dash filter no longer holds.",
    );
  }

  return points;
};

/**
 * A smooth open path through the given points (Catmull-Rom style control
 * points). Returns "" for fewer than two points, so a caller that fed it a
 * broken extraction renders nothing instead of throwing in production.
 */
export const createSmoothPath = (points) => {
  if (points.length < 2) return "";

  return points.slice(0, -1).reduce((path, point, index) => {
    const previous = points[index - 1] ?? point;
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    const controlOneX = point.x + (next.x - previous.x) / 6;
    const controlOneY = point.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (afterNext.x - point.x) / 6;
    const controlTwoY = next.y - (afterNext.y - point.y) / 6;

    return `${path} C${controlOneX} ${controlOneY} ${controlTwoX} ${controlTwoY} ${next.x} ${next.y}`;
  }, `M${points[0].x} ${points[0].y}`);
};
