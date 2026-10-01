import { useEffect } from "react";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME } from "../lib/seo/shareMeta.js";

/*
 * The browser tab's title and the page's description, for each page.
 *
 * Search engines that run JavaScript (Google, Bing) read these; link-preview
 * crawlers do not, which is what index.html's SEO block and api/share.js are
 * for. The tags index.html already has are updated in place rather than added
 * again, because a second <title> is ignored in favour of the first.
 *
 * `noindex` asks search engines to leave the page out — for pages behind
 * sign-in, which would otherwise be listed as the login screen.
 */
export function usePageMeta({ title, description = DEFAULT_DESCRIPTION, noindex = false } = {}) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previousTitle = document.title;
    const descriptionTag = document.head.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content");
    let robotsTag = document.head.querySelector('meta[name="robots"]');
    const addedRobots = noindex && !robotsTag;

    document.title = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
    descriptionTag?.setAttribute("content", description);
    if (addedRobots) {
      robotsTag = document.createElement("meta");
      robotsTag.setAttribute("name", "robots");
      robotsTag.setAttribute("content", "noindex");
      document.head.appendChild(robotsTag);
    }

    return () => {
      document.title = previousTitle;
      if (previousDescription != null) descriptionTag?.setAttribute("content", previousDescription);
      if (addedRobots) robotsTag.remove();
    };
  }, [title, description, noindex]);
}
