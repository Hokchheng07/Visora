/*
 * Fills index.html's SEO block with the site's default tags, and writes
 * robots.txt and sitemap.xml next to the build.
 *
 * Link previews need absolute addresses, so the site's address is read at
 * build time (see resolveSiteUrl). Without one the tags fall back to relative
 * paths, which most crawlers cannot follow, and the build says so.
 */
import { defaultMeta, injectMeta, joinUrl, resolveSiteUrl } from "../src/lib/seo/shareMeta.js";

// Public pages worth listing for search engines. Everything else needs sign-in.
const SITEMAP_PATHS = ["/", "/templates", "/about", "/cv"];
// Private areas. /editor stays crawlable: link-preview bots obey robots.txt, and
// template links must keep their preview. Its pages say noindex instead.
const DISALLOWED_PATHS = ["/user-dashboard", "/dashboard", "/auth", "/api/"];

export function robotsTxt(siteUrl) {
  const lines = ["User-agent: *", ...DISALLOWED_PATHS.map((path) => `Disallow: ${path}`)];
  if (siteUrl) lines.push("", `Sitemap: ${joinUrl(siteUrl, "/sitemap.xml")}`);
  return `${lines.join("\n")}\n`;
}

export function sitemapXml(siteUrl) {
  const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${joinUrl(siteUrl, path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function seo({ env = process.env } = {}) {
  const siteUrl = resolveSiteUrl(env);
  return {
    name: "visora-seo",
    transformIndexHtml(html) {
      return injectMeta(html, defaultMeta(siteUrl));
    },
    generateBundle() {
      if (!siteUrl) {
        this.warn("VITE_SITE_URL is not set, so link-preview tags use relative addresses and no sitemap is written. Set it to the site's public address (e.g. https://visora.app).");
      }
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt(siteUrl) });
      if (siteUrl) this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml(siteUrl) });
    },
  };
}
