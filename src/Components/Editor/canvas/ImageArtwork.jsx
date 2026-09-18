import { useState } from "react";
import { ImageOff } from "lucide-react";
import { getStorageUrl } from "../../API/storageApi";
import { filterId, hasVisibleEffects } from "../model/effectsFilter.js";

/*
 * An uploaded picture. The element stores only the storage fileName; the link
 * is built here, so saved documents never hold a server address.
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
  const url = element.src ? (/^(https?:|data:|blob:)/.test(element.src) ? element.src : getStorageUrl(element.src)) : "";
  const [failedUrl, setFailedUrl] = useState(null);
  const broken = !url || failedUrl === url;
  const radius = `${(element.cornerRadius || 0) / 19.2}cqw`;
  const flip = element.flipX || element.flipY ? `scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})` : undefined;

  const picture = broken ? (
    <span className="editor-element-art editor-image-missing" style={{ borderRadius: radius, opacity: element.opacity }} aria-hidden="true">
      <ImageOff strokeWidth={1.5} />
    </span>
  ) : (
    <img className="editor-element-art editor-image-art" src={url} alt="" draggable={false}
      style={{ borderRadius: radius, opacity: element.opacity, transform: flip }}
      onError={() => setFailedUrl(url)} />
  );
  if (broken || !hasVisibleEffects(element)) return picture;
  // Shadows are a filter on a wrapper, the same way text and shapes get them.
  return <span className="editor-element-art editor-element-effects" style={{ filter: `url(#${filterId(element.id)})` }} aria-hidden="true">{picture}</span>;
}
