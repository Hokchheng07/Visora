function titleCase(value) {
  const text = String(value || "").trim().toLowerCase();
  return text ? text.replace(/\b\w/g, (character) => character.toUpperCase()) : "";
}

export function templateHasTimer(template = {}) {
  const data = template || {};
  if (typeof data.hasTimer === "boolean") return data.hasTimer;
  return Boolean(
    data.preview?.timer ||
    data.tags?.some((tag) => String(tag).toLowerCase() === "timer")
  );
}

// One category chip, plus "Timer" when the template has a countdown or stopwatch.
export function getTemplateCategoryTags(template = {}) {
  const data = template || {};
  const category = [
    data.eventType,
    data.type,
    ...(data.categories || []),
    ...(data.styles || []),
    ...(data.tags || []),
  ].find((tag) => tag && String(tag).toLowerCase() !== "timer");

  return [category, templateHasTimer(data) ? "Timer" : null].filter(Boolean);
}

export function getTemplateFormat(template = {}) {
  const data = template || {};
  const orientation = titleCase(data.orientation) || "Landscape";
  const pageCount = Math.max(1, Number(data.pageCount) || 1);
  return {
    orientation,
    pageCount,
    label: `${orientation} · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`,
  };
}
