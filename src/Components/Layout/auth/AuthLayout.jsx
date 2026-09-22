import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useOutlet } from "react-router";
import { EASE } from "../../../lib/animations/animations";
import { useMediaQuery } from "../../Editor/hooks/useMediaQuery";
import { AuthArtContent, AuthArtLogo } from "./AuthArt";

/* Login keeps the picture on the left; Sign Up puts it on the right. Moving
   between them slides the two halves past each other so they read as two
   sides of one page. Everything else (forgot password, and every page below
   lg, where there is no picture) keeps the plain fade. */
const SPLIT_PAGES = { "/auth/login": "login", "/auth/register": "register" };
const SWAP = { duration: 0.55, ease: [0.77, 0, 0.175, 1] };

export default function AuthLayout() {
  const location = useLocation();
  // useOutlet, not <Outlet />: an exiting page keeps rendering its own route
  // instead of the one being navigated to.
  const outlet = useOutlet();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useReducedMotion();
  const page = SPLIT_PAGES[location.pathname];
  const split = desktop && !!page;
  const artRight = page === "register";

  return (
    <div className="site-shell min-h-dvh">
      {split ? (
        <div className="relative h-dvh overflow-hidden">
          {/* Only transform moves. initial={false}: a direct visit to a page
              lands already in place; only a switch between the two slides. */}
          <motion.section className="absolute inset-y-0 left-0 z-10 w-1/2 overflow-hidden"
            initial={false} animate={{ x: artRight ? "100%" : "0%" }}
            transition={reduceMotion ? { duration: 0 } : SWAP}>
            <AnimatePresence initial={false}>
              {/* The new picture fades in on top while the old one stays fully
                  opaque underneath; fading both would dip through the dark
                  background halfway. */}
              <motion.div key={page} className="absolute inset-0"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 1, transition: { duration: reduceMotion ? 0.2 : SWAP.duration } }}
                transition={{ duration: reduceMotion ? 0.2 : SWAP.duration, ease: EASE }}>
                <AuthArtContent page={page} />
              </motion.div>
            </AnimatePresence>
            <AuthArtLogo />
          </motion.section>

          <motion.div className="absolute inset-y-0 left-0 w-1/2"
            initial={false} animate={{ x: artRight ? "0%" : "100%" }}
            transition={reduceMotion ? { duration: 0 } : SWAP}>
            {/* The old form fades out in the first half of the slide, the new
                one fades in over the second, so they never overlap. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={location.pathname} className="h-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.15 : SWAP.duration / 2, ease: EASE }}>
                {outlet}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
