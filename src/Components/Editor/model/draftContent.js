/* What a new design is called until its author names it (the editor's default title). */
export const DEFAULT_TITLE = "Untitled design";
// Names a design gets without its author choosing one: today's, and the one designs used to get.
const UNNAMED = new Set([DEFAULT_TITLE, "Untitled-1", "Untitled"]);

/**
 * Whether a design holds anything worth keeping as a draft. A blank new
 * design — one white page, no layers, the default name — is not saved, so
 * opening the editor and leaving again does not fill Drafts with empty cards.
 */
export function hasContent(editor) {
  const pages = editor?.pages || [];
  return pages.length > 1
    || pages.some((page) => page.elements?.length)
    || pages.some((page) => page.background?.type !== "COLOR" || String(page.background?.value || "").toUpperCase() !== "#FFFFFF")
    || (!!editor?.title && !UNNAMED.has(editor.title.trim()));
}
