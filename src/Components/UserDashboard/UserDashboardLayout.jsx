import { useCallback, useState } from "react";
import { Outlet } from "react-router";

import "./dashboard-mobile.css";

import UserDashboardHeader from "./UserDashboardHeader";
import UserDashboardSidebar from "./UserDashboardSidebar";
import { DEFAULT_PROFILE } from "./Profile/profileData";

export default function UserDashboardLayout(){
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [profile,setProfile]=useState(DEFAULT_PROFILE);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return(
    <div className="site-shell flex min-h-screen bg-[var(--surface-warm)] text-[var(--text-body)]">
      <UserDashboardSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="user-dashboard-content bg-sparkle min-w-0 flex-1 bg-[var(--surface-warm)]">
        <UserDashboardHeader
          onMenuOpen={()=>setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          profile={profile}
        />

        <main className="min-h-screen">
          <Outlet context={{profile,setProfile}}/>
        </main>
      </div>
    </div>
  );
}
