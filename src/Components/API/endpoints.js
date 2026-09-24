import { api } from "./client";
 
// Adjust these paths to match your actual backend routes — these are
// reasonable guesses based on the REST resources the dashboard uses
// (templates, users, categories, dashboard summary). Grep your API's
// route list or ask the backend dev to confirm the real paths.
 
export function getDashboardSummary(signal) {
  return api.get("/admin/dashboard", { signal });
}
 
export function updateTemplate(id, patch) {
  return api.patch(`/admin/templates/${id}`, patch);
}
 
export function createTemplate(template) {
  return api.post("/admin/templates", template);
}
 
export function deleteTemplate(id) {
  return api.delete(`/admin/templates/${id}`);
}
 
export function updateUser(id, patch) {
  return api.patch(`/admin/users/${id}`, patch);
}
 
export function deleteUser(id) {
  return api.delete(`/admin/users/${id}`);
}
 
export function createCategory(category) {
  return api.post("/admin/categories", category);
}
 
export function updateCategory(id, patch) {
  return api.patch(`/admin/categories/${id}`, patch);
}
 
export function deleteCategory(id) {
  return api.delete(`/admin/categories/${id}`);
}
 