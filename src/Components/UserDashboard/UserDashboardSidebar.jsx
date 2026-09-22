import { useEffect, useRef } from "react";
import {
  Clock3,
  FolderHeart,
  LayoutGrid,
  Share2,
  Trash2,
  UserRound,
} from "lucide-react";
import { Link,NavLink } from "react-router";

import logoLight from "../../assets/shared/branding/VisoraLogo.png";
import logoDark from "../../assets/shared/branding/VisoraLogo(DarkMode).png";

const navigation=[
  ["Profile","/user-dashboard/profile",UserRound],
  ["Recent","/user-dashboard/recent",Clock3],
  ["Favorites","/user-dashboard/favorites",FolderHeart],
  ["My Designs","/user-dashboard/my-designs",LayoutGrid],
  ["Shared with Me","/user-dashboard/shared",Share2],
  ["Trash","/user-dashboard/trash",Trash2],
];

export default function UserDashboardSidebar({open,onClose}){
  const sidebarRef = useRef(null);

  useEffect(() => {
    const screen = window.matchMedia("(max-width: 768px)");
    let release = () => {};
    const sync = () => {
      release();
      release = () => {};
      if (!screen.matches) {
        if (open) onClose();
        return;
      }
      if (!open) return;
      const sidebar = sidebarRef.current;
      const previousFocus = document.activeElement;
      const content = sidebar.parentElement.querySelector(".user-dashboard-content");
      const wasInert = content?.inert;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (content) content.inert = true;
      (sidebar.querySelector('nav a[aria-current="page"]') || sidebar.querySelector('nav a'))?.focus();
      const handleKey = (event) => {
        if (event.key === "Escape") { event.preventDefault(); onClose(); }
        if (event.key !== "Tab") return;
        const controls = [...sidebar.querySelectorAll('a[href], button:not([disabled])')];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      };
      document.addEventListener("keydown", handleKey);
      release = () => {
        document.body.style.overflow = previousOverflow;
        if (content) content.inert = wasInert;
        document.removeEventListener("keydown", handleKey);
        if (previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
      };
    };
    sync();
    screen.addEventListener("change", sync);
    return () => { screen.removeEventListener("change", sync); release(); };
  }, [open, onClose]);

  return(
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={`user-dashboard-sidebar-overlay fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          open
            ?"pointer-events-auto opacity-100"
            :"pointer-events-none opacity-0"
        }`}
      />

      <aside ref={sidebarRef} id="user-dashboard-sidebar" aria-label="Workspace navigation" data-open={open}
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--surface-card) 82%, var(--surface-warm))",
        }}
        className={`user-dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[var(--border-default)] px-4 py-5 shadow-[6px_0_24px_rgba(0,0,0,0.03)] transition-transform duration-300 dark:shadow-[6px_0_24px_rgba(0,0,0,0.12)] md:sticky md:top-0 md:h-screen md:w-[210px] md:translate-x-0 lg:w-[225px] xl:w-[240px] 2xl:w-[250px] ${
          open?"translate-x-0":"-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="user-dashboard-sidebar-brand flex h-[90px] items-center justify-between px-1">
          <Link
            to="/"
            onClick={onClose}
            className="inline-flex items-center"
          >
            <img
              src={logoLight}
              alt="Visora"
              className="h-[70px] w-auto select-none dark:hidden lg:h-[76px]"
            />

            <img
              src={logoDark}
              alt="Visora"
              className="hidden h-[70px] w-auto select-none dark:block lg:h-[76px]"
            />
          </Link>

        </div>

        {/* NAVIGATION */}
        <p className="user-dashboard-sidebar-label">Workspace</p>
        <nav className="mt-6 space-y-2">
          {navigation.map(([label,to,Icon])=>(
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({isActive})=>
                `flex h-12 items-center gap-3 rounded-xl px-4 text-[13px] font-medium transition-all lg:text-sm ${
                  isActive
                    ?"bg-primary text-white shadow-[0_6px_18px_rgba(112,90,224,0.18)] dark:text-[var(--text-on-brand)]"
                    :"text-[var(--text-body)] hover:bg-primary/10 hover:text-primary"
                }`
              }
            >
              <Icon className="h-[19px] w-[19px] shrink-0"/>

              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
