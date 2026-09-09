import { MotionConfig } from "motion/react";
import { Outlet } from "react-router";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Outlet />
    </MotionConfig>
  );
}

export default App;
