import { MotionConfig } from "motion/react";
import Navbar from "./Components/Nav/Navbar";
import "./App.css";
import Home from "./Components/Pages/Home";
import Footer from "./Components/Footer/Footer";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
          <Home />
          <Footer />
        </main>
      </div>
    </MotionConfig>
  );
}

export default App;
