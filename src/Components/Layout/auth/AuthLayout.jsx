import { AnimatePresence, motion } from "motion/react";
import { Outlet, useLocation } from "react-router";
import { EASE } from "../../../lib/animations/animations";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
