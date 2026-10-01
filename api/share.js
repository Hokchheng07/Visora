/*
 * Serves the editor's page with a template's own link-preview tags.
 *
 * vercel.json sends /editor here. For /editor?template=<uuid> the template is
 * fetched from the Visora API and its title, description and thumbnail are
 * written into the page's SEO block, so a shared link shows that template's
 * card. The page is otherwise the normal app: a person who opens the link is
 * still asked to sign in, then lands on the template.
 *
 * Anything that goes wrong — no template, an unapproved one, a slow API —
 * falls back to the default card. A link preview never blocks the page.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { defaultMeta, injectMeta, isTemplateUuid, resolveSiteUrl, templateMeta } from "../src/lib/seo/shareMeta.js";

const API_TIMEOUT_MS = 2500;
const CACHE_HIT = "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";
const CACHE_MISS = "public, max-age=0, s-maxage=60";

let indexHtml = null;

/* The built page. vercel.json bundles dist/index.html with this function; the
   fetch is a fallback for a deployment where that file is missing. */
async function loadIndexHtml(origin) {
  if (indexHtml) return indexHtml;
  try {
    indexHtml = await readFile(path.join(process.cwd(), "dist", "index.html"), "utf8");
  } catch {
    const response = await fetch(`${origin}/index.html`);
    if (!response.ok) throw new Error(`index.html answered ${response.status}`);
    indexHtml = await response.text();
  }
  return indexHtml;
}

async function fetchTemplate(uuid) {
  const apiBase = String(process.env.VITE_BASE_VISORA_URL || "").replace(/\/+$/, "");
  if (!apiBase) return null;
  const response = await fetch(`${apiBase}/templates/${encodeURIComponent(uuid)}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (!response.ok) return null;
  return (await response.json())?.data ?? null;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const siteUrl = resolveSiteUrl(process.env) || requestUrl.origin;
  const uuid = requestUrl.searchParams.get("template");

  let meta = null;
  if (isTemplateUuid(uuid)) {
    try {
      meta = templateMeta(await fetchTemplate(uuid), { siteUrl, storageUrl: process.env.VITE_STORAGE_URL });
    } catch (error) {
      console.error(`[share] template ${uuid}: ${error?.message || error}`);
    }
  }

  let html;
  try {
    html = await loadIndexHtml(requestUrl.origin);
  } catch (error) {
    console.error(`[share] ${error?.message || error}`);
    return new Response("Visora is unavailable right now.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const page = injectMeta(html, meta || { ...defaultMeta(siteUrl), noindex: true });
  return new Response(page, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": meta ? CACHE_HIT : CACHE_MISS,
    },
  });
}
