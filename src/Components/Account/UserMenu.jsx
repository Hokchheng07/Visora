import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useAppDispatch } from "../redux/hook.js";
import { setLogout } from "../redux/authslice";
import { baseApi } from "../API/baseApi";
import { useCurrentUser } from "./useCurrentUser";
import UserAvatar from "./UserAvatar";
import "./user-menu.css";

// The signed-in user's avatar with a small account menu. Used by the site
// navbar, the editor top bar and the admin dashboard header.
//   showMeta  – also show the name and role beside the avatar (dashboard)
//   align     – which edge of the trigger the menu lines up with
//
// The menu is portaled to <body> with fixed positioning: the navbar clips its
// overflow (for the wave background), so a menu inside it would be cut off.
// The shell's --um-* colors are copied across so it still matches its theme.
const MENU_WIDTH = 260;
const COLOR_VARS = ["--um-bg", "--um-ink", "--um-muted", "--um-border", "--um-hover", "--um-ring"];
export default function UserMenu({ size = 44, showMeta = false, align = "end", signedOut = null, className = "" }) {
  const account = useCurrentUser();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);
  const menuId = useId();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Place the menu under the avatar, and keep it there while the page moves.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const place = () => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const computed = getComputedStyle(root);
      const colors = Object.fromEntries(COLOR_VARS.map((name) => [name, computed.getPropertyValue(name)]));
      const wanted = align === "start" ? rect.left : rect.right - MENU_WIDTH;
      const left = Math.min(Math.max(8, wanted), window.innerWidth - MENU_WIDTH - 8);
      setPanelStyle({ ...colors, top: rect.bottom + 10, left, width: MENU_WIDTH });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align]);

  if (!account.isSignedIn) return signedOut;

  const logOut = () => {
    setOpen(false);
    dispatch(setLogout());
    // forget cached data (the profile) so the next person starts clean
    dispatch(baseApi.util.resetApiState());
    navigate("/", { replace: true });
  };

  const roleLabel = account.role ? account.role.toLowerCase().replace(/_/g, " ") : "";

  return (
    <div ref={rootRef} className={`user-menu ${className}`}>
      <button
        type="button"
        className={`user-menu-trigger ${showMeta ? "has-meta" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu${account.displayName ? ` for ${account.displayName}` : ""}`}
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar size={size} loading={account.isLoading} pictureUrl={account.pictureUrl} initials={account.initials} name={account.displayName} />
        {showMeta && (
          <>
            <span className="user-menu-meta">
              <strong>{account.isLoading ? "Loading…" : account.displayName || "Account"}</strong>
              {roleLabel && <span>{roleLabel}</span>}
            </span>
            <ChevronDown size={18} strokeWidth={2.4} className="user-menu-chevron" aria-hidden="true" />
          </>
        )}
      </button>

      {createPortal(
      <div ref={panelRef} id={menuId} role="menu" className={`user-menu-panel align-${align}`} style={panelStyle || undefined} data-open={open && !!panelStyle} inert={!open}>
        <div className="user-menu-header">
          <UserAvatar size={44} loading={account.isLoading} pictureUrl={account.pictureUrl} initials={account.initials} />
          <div className="user-menu-identity">
            <strong>{account.displayName || "Signed in"}</strong>
            {account.user?.email && <span>{account.user.email}</span>}
          </div>
        </div>
        <Link role="menuitem" to="/profile" className="user-menu-item" onClick={() => setOpen(false)}>
          <UserRound size={17} aria-hidden="true" />My profile
        </Link>
        {account.isAdmin && (
          <Link role="menuitem" to="/dashboard" className="user-menu-item" onClick={() => setOpen(false)}>
            <LayoutDashboard size={17} aria-hidden="true" />Admin dashboard
          </Link>
        )}
        <div className="user-menu-divider" />
        <button role="menuitem" type="button" className="user-menu-item is-danger" onClick={logOut}>
          <LogOut size={17} aria-hidden="true" />Log out
        </button>
      </div>,
      document.body,
      )}
    </div>
  );
}
