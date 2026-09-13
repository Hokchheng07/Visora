import { NavLink, Outlet, useLocation } from "react-router";
import { Bell, ChevronDown, CircleUserRound, Clock3, Flag, Folder, House, Layers, Menu, UsersRound, X } from "lucide-react";
import { useState } from "react";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import ThemeToggle from "../../theme/ThemeToggle";
import "./dashboard.css";

const navigation = [
  ["Dashboard", "/dashboard", House],
  ["User", "/dashboard/users", UsersRound],
  ["Templates", "/dashboard/templates", Layers],
  ["Categories", "/dashboard/categories", Folder],
  ["Pending", "/dashboard/pending", Clock3],
  ["Report", "/dashboard/report", Flag],
];

export default function DashboardLayout() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const pageInfo = {
    "/dashboard": ["Admin Dashboard", "Welcome back, Admin!"],
    "/dashboard/users": ["User Management", "Track and analyze platform performance and activities"],
    "/dashboard/templates": ["Templates", "Manage all templates in the platform."],
    "/dashboard/categories": ["Categories", "Organize templates with category management."],
    "/dashboard/pending": ["Pending Review", "Review templates submitted by users."],
    "/dashboard/report": ["Reports", "Track and analyze platform performance and activities"],
  }[pathname] || ["Dashboard", "Manage your Visora workspace."];
  return (
    <div className="dashboard-shell">
      <button className="dashboard-menu-toggle" onClick={() => setMenuOpen(!isMenuOpen)} aria-label="Toggle dashboard menu" aria-expanded={isMenuOpen}>
        {isMenuOpen ? <X /> : <Menu />}
      </button>
      {isMenuOpen && <div className="dashboard-scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside className={`dashboard-sidebar ${isMenuOpen ? "is-open" : ""}`}>
        <NavLink to="/dashboard" className="dashboard-brand" onClick={() => setMenuOpen(false)}>
          <img src={visoraLogo} alt="Visora" />
        </NavLink>
        <nav aria-label="Dashboard navigation">
          {navigation.map(([label, to, Icon]) => (
            <NavLink key={to} to={to} end={to === "/dashboard"} onClick={() => setMenuOpen(false)} className={({ isActive }) => `dashboard-nav-item ${isActive ? "active" : ""}`}>
              <Icon size={22} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>{pageInfo[0]}</h1>
            <p>{pageInfo[1]}</p>
          </div>
          <div className="header-account">
            <ThemeToggle />
            <button className="notification" aria-label="Notifications, 5 unread">
              <Bell size={24} fill="currentColor" /><b>5</b>
            </button>
            <button className="account-button" aria-label="Account menu">
              <CircleUserRound className="admin-avatar" size={48} strokeWidth={1.6} />
              <span className="admin-meta"><strong>Admin User</strong><span>Super Admin</span></span>
              <ChevronDown size={22} strokeWidth={2.5} className="account-chevron" />
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
