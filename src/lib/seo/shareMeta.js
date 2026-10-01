/*
 * The tags a link preview is built from: title, description, picture.
 *
 * Facebook, X, Telegram, Discord and LinkedIn read only the first HTML the
 * server sends; they never run the app's JavaScript. So these tags must be in
 * that HTML, not set by React afterwards. index.html carries the defaults
 * between the two SEO markers, and api/share.js swaps that block for a
 * template's own tags when a template link is opened.
 *
 * Plain functions with no browser or Node dependency, so the build, the
 * Vercel function and the tests share them.
 */

export const SEO_START = "<!-- seo:start -->";
export const SEO_END = "<!-- seo:end -->";

export const SITE_NAME = "Visora";
export const DEFAULT_TITLE = "Visora — Design stunning backdrops";
export const DEFAULT_DESCRIPTION =
  "Create event backdrops, posters and presentations in minutes with Visora's free templates. Create. Celebrate. Inspire.";
export const DEFAULT_IMAGE_PATH = "/og-image.jpg";
export const DEFAULT_IMAGE_ALT = "Visora — Design stunning backdrops.";
export const DEFAULT_IMAGE_SIZE = { width: 1200, height: 630 };

const DESCRIPTION_LIMIT = 200;
const TEMPLATE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isTemplateUuid = (value) => typeof value === "string" && TEMPLATE_UUID.test(value);

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The site's public address, without a trailing slash, or "" when unknown.
 *
 * VITE_SITE_URL wins, for a custom domain. On Vercel the production domain is
 * also given to every build and function as VERCEL_PROJECT_PRODUCTION_URL.
 */
export function resolveSiteUrl(env = {}) {
  const explicit = String(env.VITE_SITE_URL || "").trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = String(env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
  return vercel ? `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}` : "";
}

/** Joins a base address and a path without doubling or dropping the slash. */
export function joinUrl(base, path) {
  const root = String(base || "").replace(/\/+$/, "");
  const tail = String(path || "").replace(/^\/+/, "");
  return root ? `${root}/${tail}` : `/${tail}`;
}

/** Collapses whitespace and cuts at a word, so previews never end mid-word. */
export function clip(text, limit = DESCRIPTION_LIMIT) {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, "")}…`;
}

/**
 * Every page's defaults. `siteUrl` makes the picture's address absolute, which
 * crawlers need.
 *
 * No page address: every route is served this same HTML, and a canonical of
 * "/" on /templates would tell search engines it is a copy of the home page.
 * Without og:url, a crawler uses the address it fetched.
 */
export function defaultMeta(siteUrl) {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: null,
    image: joinUrl(siteUrl, DEFAULT_IMAGE_PATH),
    imageAlt: DEFAULT_IMAGE_ALT,
    imageSize: DEFAULT_IMAGE_SIZE,
    type: "website",
    noindex: false,
  };
}

/**
 * A template's preview, or null when it should not get one.
 *
 * Only approved, active templates are described: a pending, rejected or
 * archived one keeps the generic card, so a link never shows what the
 * gallery itself does not.
 */
export function templateMeta(template, { siteUrl, storageUrl }) {
  if (!template || !isTemplateUuid(template.uuid)) return null;
  if (template.status !== "ACTIVE" || template.templateStatus !== "APPROVED") return null;

  const name = clip(template.name || template.proposedName || "Untitled", 90);
  const description = clip(template.description)
    || `Open the “${name}” template on Visora and make it yours in minutes.`;
  const hasThumbnail = Boolean(template.thumbnail && storageUrl);

  return {
    title: `${name} · ${SITE_NAME}`,
    description,
    url: joinUrl(siteUrl, `/editor?template=${encodeURIComponent(template.uuid)}`),
    image: hasThumbnail ? joinUrl(storageUrl, template.thumbnail) : joinUrl(siteUrl, DEFAULT_IMAGE_PATH),
    imageAlt: hasThumbnail ? `${name} template preview` : DEFAULT_IMAGE_ALT,
    // The thumbnail's size is not known here, and a wrong size is worse than none.
    imageSize: hasThumbnail ? null : DEFAULT_IMAGE_SIZE,
    type: "website",
    // The editor sits behind sign-in, so search engines would only find the login page there.
    noindex: true,
  };
}

/** The tags for one page, as the HTML that goes between the SEO markers. */
export function renderMetaTags(meta) {
  const tag = (attribute, key, value) => `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const lines = [
    `<title>${escapeHtml(meta.title)}</title>`,
    tag("name", "description", meta.description),
    meta.noindex ? tag("name", "robots", "noindex") : null,
    // A canonical on a noindex page sends search engines two opposite signals.
    meta.url && !meta.noindex ? `<link rel="canonical" href="${escapeHtml(meta.url)}" />` : null,
    tag("property", "og:site_name", SITE_NAME),
    tag("property", "og:type", meta.type),
    tag("property", "og:title", meta.title),
    tag("property", "og:description", meta.description),
    meta.url ? tag("property", "og:url", meta.url) : null,
    tag("property", "og:image", meta.image),
    meta.imageSize ? tag("property", "og:image:width", meta.imageSize.width) : null,
    meta.imageSize ? tag("property", "og:image:height", meta.imageSize.height) : null,
    tag("property", "og:image:alt", meta.imageAlt),
    tag("name", "twitter:card", "summary_large_image"),
    tag("name", "twitter:title", meta.title),
    tag("name", "twitter:description", meta.description),
    tag("name", "twitter:image", meta.image),
    tag("name", "twitter:image:alt", meta.imageAlt),
  ];
  return lines.filter(Boolean).join("\n    ");
}

/** Swaps the block between the SEO markers. HTML without the markers is returned as it came. */
export function injectMeta(html, meta) {
  const start = html.indexOf(SEO_START);
  const end = html.indexOf(SEO_END, start);
  if (start === -1 || end === -1) return html;
  return `${html.slice(0, start + SEO_START.length)}\n    ${renderMetaTags(meta)}\n    ${html.slice(end)}`;
}
