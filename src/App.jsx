import { MotionConfig } from "motion/react";
import { Outlet } from "react-router";
import "./App.css";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Outlet />
    </MotionConfig>
  );
}

export default App;
