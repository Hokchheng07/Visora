import { imageUrlFor } from "../canvas/imageSource.js";

/*
 * Downloads every picture a design uses, once, as data.
 *
 * Export captures a page into an SVG, and an <img> in that SVG pointing at the
 * storage server has to be fetched again by the capture — cross-origin, per
 * page, with no way to wait for it or retry. Uploaded photos would arrive as
 * blanks on a slow connection, and the same photo on five pages would be
 * fetched five times.
 *
 * So the pictures are collected first, fetched once each, and handed to the
 * sheet as data URLs. A picture that cannot be fetched is left out of the map
 * rather than faked: the element falls back to its real address, draws the
 * same grey placeholder the editor shows, and the count comes back so the
 * caller can say plainly that some pictures are missing instead of handing
 * over a file with holes in it and saying nothing.
 */

/** Every distinct picture address used by these pages, in page order. */
export function imageAddresses(pages) {
  const seen = new Set();
  for (const page of pages || []) {
    for (const element of page?.elements || []) {
      if (element?.type !== "image") continue;
      const address = imageUrlFor(element.src);
      // Already-inline data has nothing to download.
      if (address && !address.startsWith("data:")) seen.add(address);
    }
  }
  return [...seen];
}

async function toDataUrl(address) {
  const response = await fetch(address, { mode: "cors", credentials: "omit" });
  if (!response.ok) throw new Error(`${response.status}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetches the pages' pictures.
 *
 * Returns { images, missing } — a Map of address -> data URL, and the
 * addresses that could not be fetched.
 */
export async function inlineImages(pages) {
  const addresses = imageAddresses(pages);
  const images = new Map();
  const missing = [];
  /* All at once: these are a handful of small files, and a design with a photo
     on every page would otherwise spend the whole export waiting in turn. One
     failure must not take the others down, so each is settled on its own. */
  const results = await Promise.allSettled(addresses.map(toDataUrl));
  results.forEach((result, index) => {
    if (result.status === "fulfilled") images.set(addresses[index], result.value);
    else missing.push(addresses[index]);
  });
  return { images, missing };
}
