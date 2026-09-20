import { NavLink, Outlet, useLocation } from "react-router";

const tabs = [
  ["All Designs", "/user-dashboard/my-designs", true],
  ["Drafts", "/user-dashboard/my-designs/drafts", false],
  ["Posted Templates", "/user-dashboard/my-designs/posted-templates", false],
];

export default function MyDesigns() {
  const { pathname } = useLocation();

  return (
    <section className="p-6 lg:p-10">
      <h1 className="text-3xl font-bold">My Designs</h1>
      <nav aria-label="My designs filters" className="mt-6 flex flex-wrap gap-2 border-b border-black/10 dark:border-white/10">
        {tabs.map(([label, to, end]) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `border-b-2 px-4 py-3 text-sm font-semibold ${isActive ? "border-violet-600 text-violet-700 dark:text-violet-300" : "border-transparent"}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6">
        {pathname === "/user-dashboard/my-designs" ? <p>All of your designs will appear here.</p> : <Outlet />}
      </div>
    </section>
  );
}
