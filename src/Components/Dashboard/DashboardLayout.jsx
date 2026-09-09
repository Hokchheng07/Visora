import { NavLink, Outlet, useLocation } from "react-router";
import { BarChart3, ChevronDown, Clock3, FileText, FolderKanban, LayoutDashboard, Menu, Users, X, Bell } from "lucide-react";
import { useState } from "react";
import visoraLogo from "../../assets/Website/VisoraLogo.png";
import logoPf from "../../assets/Website/dashboard/pf.jpg";
import "./dashboard.css";

const navigation = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["User", "/dashboard/users", Users],
  ["Templates", "/dashboard/templates", FileText],
  ["Categories", "/dashboard/categories", FolderKanban],
  ["Pending", "/dashboard/pending", Clock3],
  ["Report", "/dashboard/report", BarChart3],
];

export default function DashboardLayout() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const pageInfo = {
    "/dashboard": ["Admin Dashboard", "Welcome back, Admin!"],
    "/dashboard/users": ["User Management", "Track and analyze platform performance and activities"],
    "/dashboard/templates": ["Template Management", "Organize and maintain your template library."],
    "/dashboard/categories": ["Categories", "Organize templates with category management."],
    "/dashboard/pending": ["Pending Review", "Review templates submitted by users."],
    "/dashboard/report": ["Reports & Analytics", "Track workspace performance and activity."],
  }[pathname] || ["Dashboard", "Manage your Visora workspace."];
  return (
    <div className="dashboard-shell">
      <button className="dashboard-menu-toggle" onClick={() => setMenuOpen(!isMenuOpen)} aria-label="Toggle dashboard menu">
        {isMenuOpen ? <X /> : <Menu />}
      </button>
      <aside className={`dashboard-sidebar ${isMenuOpen ? "is-open" : ""}`}>
        <NavLink to="/dashboard" className="dashboard-brand" onClick={() => setMenuOpen(false)}>
          <img src={visoraLogo} alt="Visora Logo" className="w-35 -mt-5 mx-2"/>
        </NavLink>
        <nav aria-label="Dashboard navigation">
          {navigation.map(([label, to, Icon]) => (
            <NavLink key={to} to={to} end={to === "/dashboard"} onClick={() => setMenuOpen(false)} className={({ isActive }) => `dashboard-nav-item ${isActive ? "active" : ""}`}>
              <Icon size={20} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-help"><div className="help-icon">?</div><div><strong>Need help?</strong><small>Contact support</small></div></div>
      </aside>
      <main className="dashboard-main"><header className="dashboard-header"><div><h1>{pageInfo[0]}</h1><p>{pageInfo[1]}</p></div>
      <div className="header-account"><button className="notification -mr-2" aria-label="Notifications"><Bell size={22}/><b>5</b></button>
      <div className="admin-avatar" style={{ width: 64, height: 64, flex: "0 0 64px", overflow: "hidden" }}>
  <img
    style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
    src={logoPf}
    alt="Admin User"
  />
</div><div className="admin-meta -ml-2 ">
      <strong className="text-[16px] ">Admin User</strong><span className="!text-[13px]">Super Admin</span></div><ChevronDown size={24} className="account-chevron -ml-1" /></div></header><Outlet /></main>
    </div>
  );
}
