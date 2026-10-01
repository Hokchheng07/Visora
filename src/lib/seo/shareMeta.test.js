import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  SEO_END, SEO_START, clip, defaultMeta, escapeHtml, injectMeta, renderMetaTags, resolveSiteUrl, templateMeta,
} from "./shareMeta.js";
import { robotsTxt, sitemapXml } from "../../../scripts/vite-plugin-seo.js";

const UUID = "a65d6544-860d-468d-978e-80c49bfa78ac";
const approved = {
  uuid: UUID, name: "Pchum Ben — Khmer Candlelight Backdrop", description: "A warm backdrop.",
  thumbnail: "80a3f2e33ba54ebfa7ae901cbc41ac78.jpeg", status: "ACTIVE", templateStatus: "APPROVED",
};
const site = { siteUrl: "https://visora.app", storageUrl: "https://visora-api.gital.me/storage/" };
const page = `<head>\n    ${SEO_START}\n    <title>Visora</title>\n    ${SEO_END}\n</head><body><div id="root"></div></body>`;

test("the site address comes from VITE_SITE_URL, then Vercel's production domain", () => {
  assert.equal(resolveSiteUrl({ VITE_SITE_URL: "https://visora.app/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }), "https://visora.app");
  assert.equal(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "visora.vercel.app" }), "https://visora.vercel.app");
  assert.equal(resolveSiteUrl({}), "");
});

test("an approved template's card uses its own title, description and thumbnail", () => {
  const meta = templateMeta(approved, site);
  assert.equal(meta.title, "Pchum Ben — Khmer Candlelight Backdrop · Visora");
  assert.equal(meta.description, "A warm backdrop.");
  assert.equal(meta.image, "https://visora-api.gital.me/storage/80a3f2e33ba54ebfa7ae901cbc41ac78.jpeg");
  assert.equal(meta.url, `https://visora.app/editor?template=${UUID}`);
  assert.equal(meta.noindex, true);
});

test("a template without a description or thumbnail still gets a full card", () => {
  const meta = templateMeta({ ...approved, description: "  ", thumbnail: null }, site);
  assert.match(meta.description, /Pchum Ben/);
  assert.equal(meta.image, "https://visora.app/og-image.jpg");
  assert.deepEqual(meta.imageSize, { width: 1200, height: 630 });
});

test("pending, rejected and archived templates keep the generic card", () => {
  assert.equal(templateMeta({ ...approved, templateStatus: "PENDING" }, site), null);
  assert.equal(templateMeta({ ...approved, templateStatus: "REJECTED" }, site), null);
  assert.equal(templateMeta({ ...approved, status: "ARCHIVED" }, site), null);
  assert.equal(templateMeta(null, site), null);
});

test("text from a template cannot break out of the tags", () => {
  const html = renderMetaTags(templateMeta({ ...approved, name: '"><script>alert(1)</script>' }, site));
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&quot;&gt;&lt;script&gt;/);
  assert.equal(escapeHtml(`a&b'`), "a&amp;b&#39;");
});

test("long descriptions are cut at a word", () => {
  const cut = clip("word ".repeat(80), 50);
  assert.ok(cut.length <= 50);
  assert.match(cut, /word…$/);
});

test("the SEO block is replaced and the rest of the page is kept", () => {
  const html = injectMeta(page, templateMeta(approved, site));
  assert.match(html, /<meta property="og:image" content="https:\/\/visora-api\.gital\.me\/storage\/80a3f2e3/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
  assert.equal(html.match(/<title>/g).length, 1);
  assert.ok(html.endsWith(`<body><div id="root"></div></body>`));
  assert.equal(injectMeta("<head></head>", defaultMeta("")), "<head></head>");
});

test("the default card names no page address, since every route shares it", () => {
  const html = renderMetaTags(defaultMeta("https://visora.app"));
  assert.doesNotMatch(html, /canonical|og:url/);
  assert.match(html, /og:image" content="https:\/\/visora\.app\/og-image\.jpg"/);
});

test("robots.txt keeps the editor open to link-preview bots", () => {
  const robots = robotsTxt("https://visora.app");
  assert.doesNotMatch(robots, /Disallow: \/editor/);
  assert.match(robots, /Disallow: \/user-dashboard/);
  assert.match(robots, /Sitemap: https:\/\/visora\.app\/sitemap\.xml/);
  assert.match(sitemapXml("https://visora.app"), /<loc>https:\/\/visora\.app\/templates<\/loc>/);
});

test("the share function writes a template's card into the editor page", async (t) => {
  const realFetch = globalThis.fetch;
  const cwd = process.cwd();
  // No dist/ here, so the function falls back to fetching index.html.
  process.chdir(mkdtempSync(path.join(tmpdir(), "visora-share-")));
  Object.assign(process.env, { VITE_BASE_VISORA_URL: "https://api.test/api/v1", VITE_STORAGE_URL: "https://api.test/storage", VITE_SITE_URL: "https://visora.app" });
  globalThis.fetch = async (url) => {
    if (url === "https://visora.app/index.html") return new Response(page);
    if (url === `https://api.test/api/v1/templates/${UUID}`) return Response.json({ data: approved });
    return new Response("not found", { status: 404 });
  };
  t.after(() => { globalThis.fetch = realFetch; process.chdir(cwd); });

  const { GET } = await import("../../../api/share.js");
  const hit = await GET(new Request(`https://visora.app/editor?template=${UUID}`));
  const html = await hit.text();
  assert.equal(hit.status, 200);
  assert.match(hit.headers.get("cache-control"), /s-maxage=600/);
  assert.match(html, /<title>Pchum Ben — Khmer Candlelight Backdrop · Visora<\/title>/);
  assert.match(html, /og:image" content="https:\/\/api\.test\/storage\/80a3f2e3/);

  const missing = await GET(new Request("https://visora.app/editor?template=b0000000-0000-4000-8000-000000000000"));
  const fallback = await missing.text();
  assert.match(fallback, /og:image" content="https:\/\/visora\.app\/og-image\.jpg"/);
  assert.match(fallback, /name="robots" content="noindex"/);
  assert.match(missing.headers.get("cache-control"), /s-maxage=60$/);

  const junk = await GET(new Request("https://visora.app/editor?template=../../etc"));
  assert.match(await junk.text(), /<title>Visora — Design stunning backdrops<\/title>/);
});
