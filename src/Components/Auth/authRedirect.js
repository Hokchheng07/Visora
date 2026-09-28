/** Where to go after signing in: the page that sent the visitor to log in (see RequireSignIn), if it is one of ours. */
export function returnPath(state) {
  const from = state?.from;
  // Only a path on this site: "//evil.example" would leave it, and /auth would loop.
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && !from.startsWith("/auth") ? from : null;
}
