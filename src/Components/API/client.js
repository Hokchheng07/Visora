import { API_BASE_URL } from "./config";
import { getAuthToken } from "../Firebase/config";
 
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
 
// Every request to the Visora API goes through here. Centralizing it means:
// - the base URL is read from config in exactly one place
// - auth headers are attached the same way every time
// - error shape is consistent, so pages can just catch ApiError
//
// path: "/dashboard", "/templates/123", etc — leading slash optional.
// options: same shape as fetch's second arg (method, body, signal, ...).
// If `auth` is false, skip attaching the Firebase token (for public endpoints).
export async function apiFetch(path, { auth = true, headers, body, ...options } = {}) {
  const url = `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
  const finalHeaders = { ...headers };
 
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = await getAuthToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }
 
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: finalHeaders,
      body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : body,
    });
  } catch (networkError) {
    throw new ApiError(`Network error calling ${path}: ${networkError.message}`, 0, null);
  }
 
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text();
 
  if (!response.ok) {
    const message = (payload && payload.message) || `Request to ${path} failed with ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }
  return payload;
}
 
export const api = {
  get: (path, options) => apiFetch(path, { ...options, method: "GET" }),
  post: (path, body, options) => apiFetch(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => apiFetch(path, { ...options, method: "PATCH", body }),
  put: (path, body, options) => apiFetch(path, { ...options, method: "PUT", body }),
  delete: (path, options) => apiFetch(path, { ...options, method: "DELETE" }),
};
 