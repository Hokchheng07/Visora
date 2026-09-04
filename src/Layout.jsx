import { Outlet } from "react-router";
import Navbar from "./Components/Nav/Navbar";
import Footer from "./Components/Footer/Footer";

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
