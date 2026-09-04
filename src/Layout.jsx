import { AnimatePresence, motion } from "motion/react";
import { Outlet, useLocation } from "react-router";
import Navbar from "./Components/Nav/Navbar";
import Footer from "./Components/Footer/Footer";
import { EASE } from "./lib/animations/animations";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
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
      </main>
      <Footer />
    </div>
  );
}
