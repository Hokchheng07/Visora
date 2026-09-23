import { MotionConfig } from "motion/react";
import { Outlet, ScrollRestoration } from "react-router";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Reset scroll to top on every navigation (restore on back/forward). Without
          this, navigating into a page while scrolled down leaves its whileInView
          entrance animations off-screen and stuck at opacity 0 until a refresh. */}
      <ScrollRestoration />
      <Outlet />
    </MotionConfig>
  );
}

export default App;
