import { useContext, useState } from "react";
import { ImageOff } from "lucide-react";
import { filterId, hasVisibleEffects } from "../model/effectsFilter.js";
import { KHMER_GOLD, libraryElement } from "../model/khmerElements.js";
import { cropStyle } from "../model/imageCrop.js";
import { imageUrlFor, InlinedImages } from "./imageSource.js";
import { STORAGE_CONFIGURED } from "../../API/storageApi";

/*
 * An uploaded picture or a built-in library element. The address comes from
 * imageSource, so saved documents never hold a server address.
 *
 * The photo fills its box (object-fit: cover), so resizing without the
 * proportion lock crops the photo instead of stretching it. Corner radius is
 * in canvas pixels like a shape's; 19.2 converts it to the container-query
 * units the canvas, page strip and display mode all scale with.
 *
 * If the file cannot load (deleted, offline) a grey placeholder keeps the box
 * visible, so the layout does not jump and the layer can still be selected.
 */
export default function ImageArtwork({ element }) {
  /* PDF export hands over the same pictures already downloaded as data, so the
     capture never waits on the network; everywhere else the map is null. */
  const inlined = useContext(InlinedImages);
  const address = imageUrlFor(element.src);
  const url = inlined?.get(address) || address;
  const [failedUrl, setFailedUrl] = useState(null);
  const broken = !url || failedUrl === url;
  const radius = `${(element.cornerRadius || 0) / 19.2}cqw`;
  const flip = element.flipX || element.flipY ? `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})` : undefined;

  /* A single-colour library element is drawn as its colour through the shape's
     outline (a CSS mask), so `fill` recolours it the way it recolours a shape.
     Full-colour artwork (the Graphics section) is drawn like a photo. */
  /* An upload with nowhere to be fetched from is not a missing picture, it is
     a missing setting, and saying so is the difference between a five-second
     fix and an afternoon. */
  const unconfigured = !STORAGE_CONFIGURED && !!element.src && !/^(https?:|data:|blob:|library:)/.test(element.src);
  const label = unconfigured ? `Image storage isn't configured, so this upload can't be shown`
    : url ? `Couldn't load ${url}`
    : "This element has no image";
  const library = !broken ? libraryElement(element.src) : null;
  const tinted = !!library?.recolour;
  const mask = tinted ? `url("${url}") center / 100% 100% no-repeat` : undefined;
  const picture = tinted ? (
    <span className="editor-element-art editor-library-art" aria-hidden="true"
      style={{ background: element.fill || library.color || KHMER_GOLD, WebkitMask: mask, mask, opacity: element.opacity, transform: flip }} />
  ) : broken ? (
    /* The placeholder says which address failed. A picture that will not load
       is nearly always the address rather than the file — the wrong backend in
       VITE_STORAGE_URL, an upload that has been removed — and without the
       address there is nothing to check: every one of those causes looks like
       the same grey box. Hovering it gives the link to try in a tab. */
    <span className="editor-element-art editor-image-missing" style={{ borderRadius: radius, opacity: element.opacity }}
      role="img" aria-label={label} title={label}>
      <ImageOff strokeWidth={1.5} />
    </span>
  ) : (
    /* The crop rides on the photo itself: object-position slides it inside the
       frame and the scale pushes in on it, both under object-fit: cover, so
       neither can stretch it or leave the frame showing through. The frame
       around it does the clipping — a photo zoomed in would otherwise spill
       across the page — and carries the corner radius, which has to be cut
       from the frame rather than the photo for the same reason. A flipped photo
       counter-mirrors its object-position so the visible crop stays anchored. */
    <span className="editor-element-art editor-image-frame" style={{ borderRadius: radius, opacity: element.opacity }}>
      <img className="editor-image-art" src={url} alt="" draggable={false}
        style={{ transform: flip, ...cropStyle(element.crop, element) }}
        onError={() => {
        setFailedUrl(url);
        /* Written once per address, where anyone debugging will look first.
           The canvas shows a placeholder; the console says what was asked for. */
        console.warn(`[Visora] Image failed to load: ${url}`);
      }} />
    </span>
  );
  if (broken || !hasVisibleEffects(element)) return picture;
  // Shadows are a filter on a wrapper, the same way text and shapes get them.
  return <span className="editor-element-art editor-element-effects" style={{ filter: `url(#${filterId(element.id)})` }} aria-hidden="true">{picture}</span>;
}
