import { useEffect, useState } from "react";

// Homepage data is a static file in public/, so Vite serves it in development
// and Vercel serves it from dist/ after a build. No separate server is needed.
export const HOMEPAGE_DATA_URL = "/db/Homepage/homepage.json";

function normalizeHomepageData(payload, requestUrl, key) {
  const items = key ? payload?.[key] : payload;
  if (!Array.isArray(items)) {
    throw new Error(`Homepage data has no "${key}" list`);
  }

  // Image paths in the JSON are relative to the JSON file itself, so resolve
  // them against its full URL: ./iamges/a.png -> /db/Homepage/iamges/a.png.
  const fileUrl = new URL(requestUrl, window.location.href);

  return items.map((item) => ({
    ...item,
    image: item.image ? new URL(item.image, fileUrl).href : item.image,
  }));
}

export default function useFetchHomepage(key, url = HOMEPAGE_DATA_URL) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const getData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload = await response.json();
        setData(normalizeHomepageData(payload, url, key));
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getData();

    return () => controller.abort();
  }, [key, url]);

  return { data, loading, error };
}
