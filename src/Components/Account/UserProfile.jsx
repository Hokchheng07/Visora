import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useTheme } from "../../theme/useTheme";
import lightFrame from "../../assets/pages/userdashboard/header/pf-frame-light.png";
import darkFrame from "../../assets/pages/userdashboard/header/pf-frame-dark.png";
import { useAppDispatch } from "../redux/hook.js";
import { setLogout } from "../redux/authslice";
import { baseApi } from "../API/baseApi";
import { useCurrentUser } from "./useCurrentUser";
import UserAvatar from "./UserAvatar";
import "./user-menu.css";

const MENU_WIDTH = 260;
const COLOR_VARS = ["--um-bg", "--um-ink", "--um-muted", "--um-border", "--um-hover", "--um-ring"];

// Supplied dashboard profiles retain their own data and sign-out callback.
// Other callers keep the existing account hook, permissions and logout logic.
export default function UserProfile({ profile, framed = true, avatarFrame, ...props }) {
  const { resolvedTheme } = useTheme();
  const frameSrc = avatarFrame ?? (framed ? (resolvedTheme === "dark" ? darkFrame : lightFrame) : undefined);

  if (profile !== undefined) {
    return (
      <ProfileMenu
        {...props}
        frameSrc={frameSrc}
        inline
        identity={{ pictureUrl: profile?.avatarUrl, name: profile?.name || "User", detail: `@${profile?.handle || "user"}` }}
        actions={[{ label: "Sign out", icon: LogOut, onClick: props.onLogout, danger: true }]}
      />
    );
  }

  return <AccountProfile {...props} frameSrc={frameSrc} />;
}

function AccountProfile({ signedOut = null, ...props }) {
  const account = useCurrentUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!account.isSignedIn) return signedOut;

  const logOut = () => {
    dispatch(setLogout());
    // Forget cached profile data so the next person starts clean.
    dispatch(baseApi.util.resetApiState());
    navigate("/", { replace: true });
  };
  const actions = [{ label: "My profile", icon: UserRound, to: "/profile" }];
  if (account.isAdmin) actions.push({ label: "Admin dashboard", icon: LayoutDashboard, to: "/dashboard" });
  actions.push({ label: "Log out", icon: LogOut, onClick: logOut, danger: true, divider: true });

  return (
    <ProfileMenu
      {...props}
      identity={{
        pictureUrl: account.pictureUrl,
        initials: account.initials,
        name: account.displayName,
        detail: account.user?.email,
        loading: account.isLoading,
        role: account.role ? account.role.toLowerCase().replace(/_/g, " ") : "",
      }}
      actions={actions}
    />
  );
}

// One trigger, avatar, identity block and action list for both menu layouts.
// The inline layout preserves the dashboard's compact responsive styling.
function ProfileMenu({ identity, actions, frameSrc, size = 44, showMeta = false, align = "end", className = "", inline = false, open: controlledOpen, onOpenChange }) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [panelStyle, setPanelStyle] = useState(null);
  const menuId = useId();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
    const pointerEvent = inline ? "mousedown" : "pointerdown";
    document.addEventListener(pointerEvent, onPointerDown);
    if (!inline) document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener(pointerEvent, onPointerDown);
      if (!inline) document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, inline, setOpen]);

  // Keep the existing portal positioning: the navbar clips its wave background.
  useLayoutEffect(() => {
    if (inline || !open || !rootRef.current) return;
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
  }, [open, align, inline, resolvedTheme]);

  const avatarProps = { frameSrc, loading: identity.loading, pictureUrl: identity.pictureUrl, initials: identity.initials };
  const panel = (
    <div ref={panelRef} id={menuId} role="menu" className={`user-menu-panel align-${align}${inline ? " user-menu-panel-inline" : ""}`} style={inline ? undefined : panelStyle || undefined} data-open={open && (inline || !!panelStyle)} inert={!open}>
      <div className="user-menu-header">
        <UserAvatar {...avatarProps} size={inline ? 54 : 44} avatarScale={inline ? 35 / 54 : undefined} />
        <div className="user-menu-identity">
          <strong>{identity.name || "Signed in"}</strong>
          {identity.detail && <span>{identity.detail}</span>}
        </div>
      </div>
      {actions.map(({ label, icon: Icon, to, onClick, danger, divider }) => {
        const itemProps = {
          role: "menuitem",
          className: `user-menu-item${danger ? " is-danger" : ""}`,
          onClick: () => { setOpen(false); onClick?.(); },
          children: <><Icon size={17} aria-hidden="true" />{label}</>,
        };
        return (
          <div key={label}>
            {divider && <div className="user-menu-divider" />}
            {to ? <Link {...itemProps} to={to} /> : <button {...itemProps} type="button" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className={`user-menu${inline ? " user-menu-compact" : ""} ${className}`}>
      <button
        type="button"
        className={`user-menu-trigger ${showMeta ? "has-meta" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={inline ? "User menu" : `Account menu${identity.name ? ` for ${identity.name}` : ""}`}
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar {...avatarProps} size={inline ? "var(--profile-size)" : size} avatarScale={inline ? 0.635 : undefined} name={identity.name} />
        {showMeta && (
          <>
            <span className="user-menu-meta">
              <strong>{identity.loading ? "Loading…" : identity.name || "Account"}</strong>
              {identity.role && <span>{identity.role}</span>}
            </span>
            <ChevronDown size={18} strokeWidth={2.4} className="user-menu-chevron" aria-hidden="true" />
          </>
        )}
      </button>
      {inline ? (open && panel) : createPortal(panel, document.body)}
    </div>
  );
}
