/* One category per template: the server stores a single categoryUuid and
   eventType, so any others would be silently dropped. Raise this (and make
   the pickers multi-choice again) once the API accepts a list. */
export const MAX_TEMPLATE_CATEGORIES = 1;

const asArray = (value) => value == null ? [] : Array.isArray(value) ? value : [value];

// Reading is not capped by the picker: sample data (and a future API) can carry several.
const READ_LIMIT = 5;

const unique = (values, limit = READ_LIMIT) => {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const text = String(value || "").trim();
    const key = text.toLocaleLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    result.push(text);
    if (result.length === limit) break;
  }

  return result;
};

const categoryName = (category) => typeof category === "string"
  ? category
  : category?.name || category?.eventType || category?.label || "";

const categoryUuid = (category) => typeof category === "object" && category
  ? category.uuid || category.categoryUuid || category.id || ""
  : "";

/** Read both today's scalar API fields and the multi-category response shape. */
export function templateCategoryNames(template = {}) {
  return unique([
    ...asArray(template.categories).map(categoryName),
    ...asArray(template.eventTypes).map(categoryName),
    ...asArray(template.categoryNames).map(categoryName),
    template.eventType,
    template.category,
  ]);
}

/** Read category identifiers from either category objects or explicit UUID fields. */
export function templateCategoryUuids(template = {}) {
  return unique([
    ...asArray(template.categoryUuids),
    ...asArray(template.categories).map(categoryUuid),
    template.categoryUuid,
  ]);
}

/** Keep picker values unique and capped, even if callers pass stale or duplicate data. */
export function normalizeSelectedCategories(categories = []) {
  const seen = new Set();
  const result = [];

  for (const category of asArray(categories)) {
    const name = categoryName(category).trim();
    const uuid = categoryUuid(category).trim();
    const key = (uuid || name).toLocaleLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({ ...(typeof category === "object" && category ? category : {}), uuid, name });
    if (result.length === MAX_TEMPLATE_CATEGORIES) break;
  }

  return result;
}

/**
 * New servers can persist the arrays. The scalar pair keeps this client
 * compatible with the current API during the relation migration.
 */
export function templateCategoryPayload(categories = []) {
  const selected = normalizeSelectedCategories(categories);
  const categoryUuids = selected.map((category) => category.uuid).filter(Boolean);
  const eventTypes = selected.map((category) => category.name).filter(Boolean);

  return {
    categoryUuids,
    eventTypes,
    categoryUuid: categoryUuids[0] || null,
    eventType: eventTypes[0] || null,
  };
}

