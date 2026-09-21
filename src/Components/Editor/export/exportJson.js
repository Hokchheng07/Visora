import { serializeDocument } from "../model/editorDocument.js";
import { imageUrlFor } from "../canvas/imageSource.js";
import { isLibrarySrc } from "../model/libraryRef.js";
import { inlineImages } from "./inlineImages.js";

/*
 * Export as JSON, as a file to hand to somebody.
 *
 * A saved document names its photos — "a1b2c3.jpg" — and the address is built
 * when the photo is drawn. That is right for storage: the document stays small
 * and no server address is frozen into it. It is wrong for a file that leaves
 * this machine. Opened by anyone else, those names point at uploads that are
 * not theirs, and the design arrives with grey boxes where its photos were.
 *
 * So the file that is downloaded carries its photos inside it, as data. It is
 * the same document in every other respect, and it needs no new field: an
 * image's source has always been "a stored name, or an address", and a data
 * URL is an address. Every surface already draws one — canvas, page strip,
 * display mode, PDF — and importing one needs no new code at all.
 *
 * This is only the download. Saving, and anything sent to the API, still use
 * serializeDocument and its stored names: nobody wants a megabyte of base64
 * travelling with every autosave.
 *
 * Built-in library artwork ("library:corners/top-left") is left as it is. It
 * resolves from the application's own bundle, so it is already the same
 * picture on anyone's machine, and embedding it would only make the file big.
 */

export const jsonFileName = (editor) => `${(editor?.title || "visora-design").replace(/[^a-z0-9-_]+/gi, "-")}.json`;

/**
 * The document with every uploaded photo embedded.
 *
 * Returns { document, missing } — the JSON to write, and the addresses of any
 * photos that could not be fetched. Those keep their stored name, so a file
 * that fails to embed is no worse than one exported before this existed.
 */
export async function embedImages(editor) {
  const document = serializeDocument(editor);
  const { images, missing } = await inlineImages(editor?.pages || []);
  if (!images.size) return { document, missing };

  document.pages = document.pages.map((page) => ({
    ...page,
    components: page.components.map((component) => {
      const source = component.image?.fileName;
      // Library artwork keeps its reference; only uploads are carried along.
      if (component.type !== "IMAGE" || isLibrarySrc(source)) return component;
      const data = images.get(imageUrlFor(source));
      return data ? { ...component, image: { ...component.image, fileName: data } } : component;
    }),
  }));
  return { document, missing };
}

/**
 * Writes the design to a .json file the reader can open anywhere.
 *
 * Returns { missingImages } so the caller can say plainly when some photos
 * could not be included, rather than letting it be discovered by whoever the
 * file was sent to.
 */
export async function downloadJson(editor) {
  const { document, missing } = await embedImages(editor);
  const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = jsonFileName(editor);
  link.click();
  URL.revokeObjectURL(url);
  return { missingImages: missing.length };
}
