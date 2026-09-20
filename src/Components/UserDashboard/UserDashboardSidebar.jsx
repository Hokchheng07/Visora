import {
  Clock3,
  FolderHeart,
  LayoutGrid,
  Share2,
  Trash2,
  UserRound,
  X,
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
  return(
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          open
            ?"pointer-events-auto opacity-100"
            :"pointer-events-none opacity-0"
        }`}
      />

      <aside
        style={{
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--color-primary) 12%, var(--surface-card)), color-mix(in srgb, var(--color-secondary) 8%, var(--surface-card)))",
        }}
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[var(--border-card)] px-4 py-5 shadow-[6px_0_24px_rgba(0,0,0,0.05)] transition-transform duration-300 dark:shadow-[6px_0_24px_rgba(0,0,0,0.25)] md:sticky md:top-0 md:h-screen md:w-[210px] md:translate-x-0 lg:w-[225px] xl:w-[240px] 2xl:w-[250px] ${
          open?"translate-x-0":"-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex h-[90px] items-center justify-between px-1">
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

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-primary/10 hover:text-primary md:hidden"
          >
            <X size={20}/>
          </button>
        </div>

        {/* NAVIGATION */}
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