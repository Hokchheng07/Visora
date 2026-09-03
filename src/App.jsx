import { MotionConfig } from "motion/react";
import Navbar from "./Components/Nav/Navbar";
import "./App.css";
import Footer from "./Components/Footer/Footer";
import Home from "./Components/Pages/Home";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <>
        <Navbar />
        <Home/>
        <Footer className="relative shrink-0 overflow-hidden bg-white" />
      </>
    </MotionConfig>
  );
}

export default App;
