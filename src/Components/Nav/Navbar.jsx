import { useState } from "react";
import { NavLink } from "react-router";
import { Bars3Icon, MoonIcon, XMarkIcon } from "@heroicons/react/24/outline";
import visoraLogo from "../../assets/Website/VisoraLogo.png";
import navbarBg from "../../assets/Website/Nav/navbar-bg-opaque.png";
import mobileLogo from "../../assets/Website/visora-logo-mobile.png";

// Recreated from the Visora Figma file, "Landing Page" > navbar instance
// (master component 69:171). Logo + background are the actual exported
// assets (Figma nodes 69:165 and the flattened 69:171 background/wave —
// Figma has no separate hover-state variants for this component, so the
// hover treatments below are original, not traced from the file).
//
// Logo asset names updated 2026-08-27: the old visora-logo.png /
// MobilephoneLogo.png were replaced with VisoraLogo.png (desktop) and
// visora-logo-mobile.png (mobile) — the new full-color "Visora" wordmark
// in the brand purple. The `mix-blend-screen` treatment that worked on
// the old light-on-dark mobile mark is no longer needed (the new mark
// sits on the navbar background cleanly) and has been removed below.

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Templates", to: "/templates" },
  { label: "About Us", to: "/about" },
];

function NavLinkRow({ to, label, onClick, className = "" }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative inline-block font-sans text-base font-semibold transition-colors duration-200 ${
          isActive ? "text-primary" : "text-gray-900 hover:text-primary"
        } ${className}`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute -bottom-1.5 left-0 h-[2px] w-full origin-left bg-primary transition-transform duration-200 ease-out ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div
        className="navbar-shell relative h-[126px] w-full overflow-hidden md:h-[146px]"
      >
        <img
          src={navbarBg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-sparkle opacity-70"
        />
        <nav className="navbar-nav relative z-10 mx-auto flex h-[96px] max-w-[1440px] items-center justify-between px-6 sm:px-10 md:h-[116px]">
          {/* Logo */}
          <NavLink to="/" className="shrink-0">
            <img
              src={visoraLogo}
              alt="Visora"
              className="hidden h-[86px] w-auto md:block"
              width={152}
              height={86}
            />
            <img
              src={mobileLogo}
              alt="Visora"
              className="h-[57px] w-[102px] object-contain md:hidden"
              width={1672}
              height={941}
            />
          </NavLink>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.to} className="pb-1.5">
                <NavLinkRow to={link.to} label={link.label} />
              </li>
            ))}
          </ul>

          {/* Right-side actions */}
          <div className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="group -m-2 rounded-full p-2 text-gray-900 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <MoonIcon
                className="h-6 w-6 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110"
                strokeWidth={1.75}
              />
            </button>
            <button
              type="button"
              className="rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 font-sans text-base font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 active:translate-y-0"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="text-gray-900 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-black/5 bg-white px-6 py-5 md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLinkRow
                  to={link.to}
                  label={link.label}
                  onClick={() => setMobileOpen(false)}
                  className="block"
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-5 w-full rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 font-sans text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
          >
            Sign In
          </button>
        </div>
      )}
    </header>
  );
}
