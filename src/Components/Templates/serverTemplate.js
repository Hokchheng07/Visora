import { getStorageUrl } from "../API/storageApi";
import { templateCategoryNames } from "./templateCategories.js";

/* A template from the server, in the shape the sample templates use, so the
   filters, search and cards treat both alike. */
export function fromServerTemplate(template) {
  const categories = templateCategoryNames(template);
  const eventType = categories[0] || "";
  return {
    id: `template-${template.uuid}`,
    remoteId: template.uuid,
    title: template.name || template.proposedName || "Untitled",
    description: template.description || "",
    type: eventType,
    categories,
    eventType,
    styles: template.styles || [],
    tags: [...categories, ...(template.hasTimer ? ["Timer"] : []), ...(template.styles || [])].filter(Boolean),
    orientation: template.orientation === "PORTRAIT" ? "Portrait" : "Landscape",
    pageCount: Math.max(1, Number(template.pageCount) || 1),
    hasTimer: Boolean(template.hasTimer),
    image: template.thumbnail ? getStorageUrl(template.thumbnail) : null,
  };
}
