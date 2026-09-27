/* UpdateCategoryRequest is a Java record: isActive (boolean) and
   displayOrder (int) are primitives, and a field left out is read as null,
   which the server refuses ("Cannot map `null` into type `boolean`"). So an
   update always sends the category's full current values with the change on
   top, never only the changed field. */
export function categoryUpdate(category, patch = {}) {
  const merged = { ...category, ...patch };
  return {
    uuid: category.uuid,
    name: merged.name ?? "",
    ...(merged.slug ? { slug: merged.slug } : {}),
    description: merged.description ?? "",
    ...(merged.icon ? { icon: merged.icon } : {}),
    displayOrder: Number.isFinite(Number(merged.displayOrder)) ? Number(merged.displayOrder) : 0,
    isActive: typeof merged.isActive === "boolean" ? merged.isActive : merged.active !== false,
  };
}
