import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setAccessToken, setLogout, setRefreshToken } from "../redux/authslice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_VISORA_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Only one refresh may run at a time. The server hands out a NEW refresh token
// each time and the old one stops working, so if two requests failed together
// and both refreshed, the second would use a dead token and log the user out.
// Every request that fails while a refresh is running waits for that same one.
let refreshing = null;

const refreshAccessToken = async (api) => {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  const res = await fetch(`${import.meta.env.VITE_BASE_VISORA_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;

  // same envelope as login: { data: { accessToken, refreshToken, ... }, status, success, message }
  const result = await res.json();
  const tokens = result?.data;
  if (!tokens?.accessToken) return false;

  api.dispatch(setAccessToken(tokens.accessToken));
  api.dispatch(setRefreshToken(tokens.refreshToken));
  sessionStorage.setItem("refreshToken", tokens.refreshToken);
  return true;
};

const baseQueryWithReAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // This server answers 403 (not 401) when the token is missing or expired,
  // e.g. after a page reload wipes the access token from memory.
  const status = result?.error?.status;
  const url = typeof args === "string" ? args : args.url;
  const isAuthRequest = url.startsWith("/auth/");

  if ((status === 401 || status === 403) && !isAuthRequest) {
    refreshing ??= refreshAccessToken(api).finally(() => {
      refreshing = null;
    });

    if (await refreshing) {
      result = await baseQuery(args, api, extraOptions);
    } else if (sessionStorage.getItem("refreshToken")) {
      // the refresh token itself was rejected: the session is over
      api.dispatch(setLogout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReAuth,
  tagTypes: ["Profile", "Users", "Categories", "Templates", "Backdrops", "Storage"],
  endpoints: () => ({}),
});
