import { shapeDefinition } from "../model/shapeCatalog.js";
import { shapePath } from "../model/vectorPath.js";
import { gradientVector, normalizeGradient, strokePaint } from "../model/shapePaint.js";
import { normalizeCrop } from "../model/imageCrop.js";
import { hasVisibleEffects } from "../model/effectsFilter.js";
import { visibleElements } from "../model/layerModel.js";

/*
 * One design page as a standalone SVG document, for the Adobe Illustrator
 * export.
 *
 * The PDF export photographs the page, which is right for a PDF and useless
 * for Illustrator: the file has to open as paths someone can pick up and edit.
 * So this draws the page again from the model, as vectors, the same way the
 * canvas draws it — shapes through shapePath, gradients in the shape's own
 * box, strokes by their alignment — and the caller hands the result to
 * svg2pdf.
 *
 * It is a plain function over the model and never touches the DOM, so what it
 * draws is testable in node. Anything it cannot know on its own is asked of
 * `assets`:
 *
 *   picture(element) -> the picture an image element (or a shape's image fill)
 *     shows: { href, width, height } for a bitmap, { svg: { viewBox, width,
 *     height, body } } for library artwork drawn inline, or null when it could
 *     not be loaded.
 *   text(element) -> SVG markup for a text box as outlines, in the box's own
 *     pixels, or null when it cannot be outlined faithfully (see editorAi).
 *   raster(element) -> { href, x, y, width, height } in page pixels: the
 *     picture of a text box that could not be outlined, or null to leave it out.
 *
 * Text is outlined where it can be and falls back to a picture of itself
 * where it cannot, so the page always comes out whole.
 *
 * What svg2pdf cannot draw is written around rather than left to fail:
 * it has no <mask>, so an outside stroke is clipped with an even-odd hole
 * instead, and it has no filters, so shadows on shapes and images are dropped
 * and counted for the caller to report.
 */

const round = (value) => Math.round(Number(value) * 1000) / 1000;
const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Attributes from a { name: value } object, skipping the empty ones.
const attrs = (list) => Object.entries(list)
  .filter(([, value]) => value !== undefined && value !== null && value !== false && value !== "")
  .map(([name, value]) => ` ${name}="${esc(typeof value === "number" ? round(value) : value)}"`).join("");

// The grey the editor shows for a picture that will not load.
const MISSING_FILL = "#ECEBF1";

// A page's own colour, and white for a page that has never been given one.
const background = (page) => (page?.background?.type === "COLOR" && page.background.value) || "#FFFFFF";

/** Elements the caller has to prepare first: outlined where possible, else pictured. */
export const isRasterElement = (element) => element?.type === "text" || element?.type === "timer";

/** Every element on the page that the caller has to rasterise first, in paint order. */
export const rasterElements = (page) => visibleElements(page).filter(isRasterElement);

/*
 * The group that puts an element in place: its box moved to x, y and turned
 * about its own centre, which is where CSS `rotate` turns it on the canvas.
 */
function placed(element, body) {
  const w = element.w || 0, h = element.h || 0;
  const turn = element.rotation ? ` rotate(${round(element.rotation)} ${round(w / 2)} ${round(h / 2)})` : "";
  const opacity = element.opacity ?? 1;
  return `<g${attrs({ transform: `translate(${round(element.x || 0)} ${round(element.y || 0)})${turn}`, opacity: opacity < 1 ? opacity : undefined })}>${body}</g>`;
}

/* How big a picture of `width` × `height` is drawn to cover a w × h frame,
   and where, for a crop's position (0–1 across the part that does not fit).
   This is object-fit: cover with object-position, in numbers. */
function coverRect(width, height, w, h, px, py) {
  const scale = Math.max(w / Math.max(width, 1), h / Math.max(height, 1));
  const dw = width * scale, dh = height * scale;
  return { x: (w - dw) * px, y: (h - dh) * py, width: dw, height: dh };
}

// The picture itself, drawn into the rect it was given.
function pictureBody(picture, rect) {
  if (picture.svg) {
    return `<svg${attrs({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, viewBox: picture.svg.viewBox, preserveAspectRatio: "none" })}>${picture.svg.body}</svg>`;
  }
  return `<image${attrs({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, href: picture.href, preserveAspectRatio: "none" })}/>`;
}

const pictureSize = (picture) => (picture.svg ? picture.svg : picture);

function shapeSvg(element, id, assets) {
  const preset = shapeDefinition(element.shape);
  const w = element.w || preset?.w || 100, h = element.h || preset?.h || 100;
  const d = shapePath({ shape: element.shape, vector: element.vector, w, h, cornerRadius: element.cornerRadius || 0,
    cornerRadii: element.cornerRadii, flipX: element.flipX, flipY: element.flipY });
  const gradient = normalizeGradient(element.gradient);
  const fillOn = (!!element.fill || !!gradient) && element.fillVisible !== false;
  const strokeWidth = element.strokeWidth || 0;
  const strokeOn = !!element.stroke && element.stroke !== "transparent" && element.strokeVisible !== false && strokeWidth > 0;
  const align = strokeOn ? element.strokeAlign || "inside" : null;
  const fillPicture = element.fillImage && element.fillVisible !== false ? assets.picture({ src: element.fillImage }) : null;

  const defs = [];
  let body = "";
  if (gradient) {
    const ramp = gradientVector(gradient.angle);
    const stops = gradient.stops.map((stop) => `<stop${attrs({ offset: stop.offset, "stop-color": stop.color, "stop-opacity": stop.opacity })}/>`).join("");
    defs.push(`<linearGradient${attrs({ id: `fill-${id}`, ...ramp })}>${stops}</linearGradient>`);
  }
  if (fillOn) body += `<path${attrs({ d, fill: gradient ? `url(#fill-${id})` : element.fill, "fill-opacity": element.fillOpacity ?? 1 })}/>`;
  if (fillPicture) {
    // An image fill covers the shape's box, clipped to the shape.
    defs.push(`<clipPath id="imgclip-${id}"><path${attrs({ d })}/></clipPath>`);
    const size = pictureSize(fillPicture);
    body += `<g clip-path="url(#imgclip-${id})">${pictureBody(fillPicture, coverRect(size.width, size.height, w, h, 0.5, 0.5))}</g>`;
  }
  if (strokeOn) {
    const paint = strokePaint(element);
    /* SVG strokes on the centre of the edge. Inside is a double-width stroke
       clipped to the shape; outside is the same clipped to everything but the
       shape — an even-odd hole, because svg2pdf has no <mask>. */
    const margin = strokeWidth * 2 + 2;
    if (align === "inside") defs.push(`<clipPath id="clip-${id}"><path${attrs({ d })}/></clipPath>`);
    if (align === "outside") {
      const frame = `M${round(-margin)} ${round(-margin)}H${round(w + margin)}V${round(h + margin)}H${round(-margin)}Z`;
      defs.push(`<clipPath id="clip-${id}"><path${attrs({ d: `${frame}${d}`, "clip-rule": "evenodd" })}/></clipPath>`);
    }
    body += `<path${attrs({ d, fill: "none", stroke: element.stroke, "stroke-opacity": element.strokeOpacity ?? 1,
      "stroke-width": align === "center" ? strokeWidth : strokeWidth * 2,
      "stroke-dasharray": paint.strokeDasharray, "stroke-linecap": paint.strokeLinecap,
      "stroke-linejoin": paint.strokeLinejoin, "stroke-miterlimit": paint.strokeMiterlimit,
      "clip-path": align === "center" ? undefined : `url(#clip-${id})` })}/>`;
  }
  // The box may be drawn at another size than its preset; the path is already in the box's pixels.
  return placed({ ...element, w, h }, `${defs.length ? `<defs>${defs.join("")}</defs>` : ""}${body}`);
}

function imageSvg(element, id, assets) {
  const w = element.w || 0, h = element.h || 0;
  const picture = assets.picture(element);
  const radius = element.cornerRadius || 0;
  if (!picture) {
    // The same grey box the editor shows, so the layout does not move.
    return placed(element, `<rect${attrs({ width: w, height: h, rx: radius || undefined, fill: MISSING_FILL })}/>`);
  }
  const fx = element.flipX ? -1 : 1, fy = element.flipY ? -1 : 1;

  /* Recoloured library artwork is a stencil stretched over the box (the
     canvas draws it as a CSS mask at 100% 100%), so it is not cropped. */
  if (picture.tint) {
    const flip = fx < 0 || fy < 0 ? ` transform="translate(${round(w / 2)} ${round(h / 2)}) scale(${fx} ${fy}) translate(${round(-w / 2)} ${round(-h / 2)})"` : "";
    return placed(element, `<g${flip}>${pictureBody(picture, { x: 0, y: 0, width: w, height: h })}</g>`);
  }

  /* A photo covers its frame and is cropped by it: object-position slides it
     (counter-mirrored when flipped, as cropStyle does) and the zoom and flip
     both scale it about the frame's centre. */
  const crop = normalizeCrop(element.crop);
  const size = pictureSize(picture);
  const rect = coverRect(size.width, size.height, w, h, element.flipX ? 1 - crop.x : crop.x, element.flipY ? 1 - crop.y : crop.y);
  const sx = crop.zoom * fx, sy = crop.zoom * fy;
  const scaled = sx === 1 && sy === 1 ? "" : ` transform="translate(${round(w / 2)} ${round(h / 2)}) scale(${round(sx)} ${round(sy)}) translate(${round(-w / 2)} ${round(-h / 2)})"`;
  const clip = `<clipPath id="frame-${id}"><rect${attrs({ width: w, height: h, rx: radius || undefined })}/></clipPath>`;
  return placed(element, `<defs>${clip}</defs><g clip-path="url(#frame-${id})"><g${scaled}>${pictureBody(picture, rect)}</g></g>`);
}

/* Outlined text, clipped to its box: the canvas clips text that overflows
   (overflow: hidden), so the file does too. */
function textSvg(element, id, body) {
  const clip = `<clipPath id="text-${id}"><rect${attrs({ width: element.w || 0, height: element.h || 0 })}/></clipPath>`;
  return placed(element, `<defs>${clip}</defs><g clip-path="url(#text-${id})">${body}</g>`);
}

function rasterSvg(element, assets) {
  const shot = assets.raster(element);
  if (!shot) return "";
  // Already in page pixels, turned and all: the browser drew it in place.
  return `<image${attrs({ x: shot.x, y: shot.y, width: shot.width, height: shot.height, href: shot.href, preserveAspectRatio: "none" })}/>`;
}

/**
 * The page as SVG markup, `size` design pixels across.
 *
 * Returns { svg, droppedEffects } — the markup, and how many vector layers
 * had shadows that a vector file cannot carry.
 */
export function pageSvg(page, size, assets) {
  const parts = [`<rect${attrs({ width: size.width, height: size.height, fill: background(page) })}/>`];
  let droppedEffects = 0;
  visibleElements(page).forEach((element, index) => {
    const id = `e${index}`;
    const outlined = isRasterElement(element) ? assets.text?.(element) : null;
    if (isRasterElement(element) && typeof outlined !== "string") { parts.push(rasterSvg(element, assets)); return; }
    if (hasVisibleEffects(element)) droppedEffects += 1;
    if (typeof outlined === "string") { parts.push(textSvg(element, id, outlined)); return; }
    parts.push(element.type === "image" ? imageSvg(element, id, assets) : shapeSvg(element, id, assets));
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"${attrs({ width: size.width, height: size.height, viewBox: `0 0 ${size.width} ${size.height}` })}>${parts.join("")}</svg>`;
  return { svg, droppedEffects };
}

/**
 * Library artwork (a bundled SVG file) ready to draw inline.
 *
 * Returns { viewBox, width, height, body } — the file's own drawing without
 * its <svg> wrapper. With `tint`, every painted fill and stroke becomes that
 * colour, which is what the canvas's CSS mask does to a recolourable element.
 * Returns null for anything that is not an SVG with a viewBox.
 */
export function librarySvg(text, tint = null) {
  const open = /<svg\b[^>]*>/i.exec(text || "");
  const close = (text || "").lastIndexOf("</svg>");
  if (!open || close < 0) return null;
  const viewBox = /viewBox="([^"]+)"/i.exec(open[0])?.[1];
  const box = viewBox?.trim().split(/[\s,]+/).map(Number);
  if (!box || box.length !== 4 || box.some((value) => !Number.isFinite(value))) return null;
  let body = text.slice(open.index + open[0].length, close).replace(/<!--[\s\S]*?-->/g, "").trim();
  if (tint) {
    body = body.replace(/\b(fill|stroke)="(?!none)[^"]*"/gi, (_, name) => `${name}="${esc(tint)}"`);
    // A path with no fill of its own would otherwise paint in SVG's default black.
    body = `<g fill="${esc(tint)}">${body}</g>`;
  }
  return { viewBox: box.join(" "), width: box[2], height: box[3], body };
}
