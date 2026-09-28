import { Navigate, useLocation } from "react-router";
import { useAppSelector } from "../redux/hook.js";

/*
 * A page only a signed-in person may open.
 *
 * A signed-out visitor is sent to the login page instead, carrying where they
 * were going (the whole address, so "/editor?template=…" opens that template
 * after they sign in) and `reason`, which the login page uses to say why it
 * appeared. Guarding the route rather than every button means a typed or
 * bookmarked address is covered too.
 *
 * Signed in means holding a token, the same test useCurrentUser makes.
 */
export default function RequireSignIn({ reason, children }) {
  const signedIn = useAppSelector((state) => Boolean(state.auth.accessToken || state.auth.refreshToken));
  const location = useLocation();
  if (signedIn) return children;
  return <Navigate to="/auth/login" replace state={{ from: `${location.pathname}${location.search}`, reason }} />;
}
