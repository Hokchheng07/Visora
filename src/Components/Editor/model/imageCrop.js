/*
 * Cropping a photo.
 *
 * A crop here is not a second rectangle with its own shape: it is which part
 * of the photo the element's own box shows. The box stays the frame — resize
 * it with the normal handles — and the crop chooses what sits inside it. That
 * is how Canva and Google Slides behave, and it is the only arrangement in
 * which a photo can never be stretched out of proportion by cropping it.
 *
 * Two numbers do the work, both of which CSS already understands:
 *   x, y   which part of the photo is centred in the frame (object-position),
 *          so the photo can be slid about inside its box;
 *   zoom   how much larger than the frame the photo is drawn, so it can be
 *          pushed in on a detail.
 * Neither can leave a gap: object-fit keeps the photo covering the frame, and
 * a zoom below 1 is not allowed.
 */

// Dead centre at natural size — what every photo starts as, and what
// object-fit: cover did on its own before cropping existed.
export const DEFAULT_CROP = { x: 0.5, y: 0.5, zoom: 1 };
// Past 4x a 1920-wide photo is showing single pixels; there is nothing to see.
export const MAX_ZOOM = 4;

const unit = (value, fallback) => (Number.isFinite(Number(value)) ? Math.min(1, Math.max(0, Number(value))) : fallback);
const round = (value) => Math.round(value * 1e4) / 1e4;

export function normalizeCrop(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CROP };
  const zoom = Number(raw.zoom);
  return {
    x: round(unit(raw.x, DEFAULT_CROP.x)),
    y: round(unit(raw.y, DEFAULT_CROP.y)),
    zoom: round(Number.isFinite(zoom) ? Math.min(MAX_ZOOM, Math.max(1, zoom)) : DEFAULT_CROP.zoom),
  };
}

/** True when the crop shows the whole photo, centred — nothing worth saving. */
export const isDefaultCrop = (crop) => {
  const value = normalizeCrop(crop);
  return value.x === DEFAULT_CROP.x && value.y === DEFAULT_CROP.y && value.zoom === DEFAULT_CROP.zoom;
};

/** What a crop saves: nothing at all when it is the default. */
export const serializeCrop = (crop) => (isDefaultCrop(crop) ? null : normalizeCrop(crop));

/** The CSS that puts a cropped photo in its frame. */
export function cropStyle(crop) {
  const { x, y, zoom } = normalizeCrop(crop);
  return {
    objectPosition: `${round(x * 100)}% ${round(y * 100)}%`,
    ...(zoom === 1 ? {} : { scale: String(zoom) }),
  };
}

/*
 * Moving the photo by a drag.
 *
 * A drag is in frame pixels and object-position is a fraction, and the two are
 * not the same distance: object-position spreads its whole range over the part
 * of the photo that does not fit. Dividing by the frame is close enough to
 * feel direct at any zoom, and the result is clamped, so a photo pushed to its
 * edge simply stops there instead of tearing away from the frame.
 */
export function panCrop(crop, dx, dy, frameWidth, frameHeight) {
  const current = normalizeCrop(crop);
  return normalizeCrop({
    ...current,
    // Dragging right shows what was off to the left, as dragging a photo should.
    x: current.x - dx / Math.max(1, frameWidth),
    y: current.y - dy / Math.max(1, frameHeight),
  });
}
