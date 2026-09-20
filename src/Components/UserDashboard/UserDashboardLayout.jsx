import { useState } from "react";
import { Outlet } from "react-router";

import UserDashboardHeader from "./UserDashboardHeader";
import UserDashboardSidebar from "./UserDashboardSidebar";
import { DEFAULT_PROFILE } from "./Profile/profileData";

export default function UserDashboardLayout(){
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [profile,setProfile]=useState(DEFAULT_PROFILE);

  return(
    <div className="site-shell flex min-h-screen bg-[var(--surface-warm)] text-[var(--text-body)]">
      <UserDashboardSidebar
        open={sidebarOpen}
        onClose={()=>setSidebarOpen(false)}
      />

      <div className="bg-sparkle min-w-0 flex-1 bg-[var(--surface-warm)]">
        <UserDashboardHeader
          onMenuOpen={()=>setSidebarOpen(true)}
          profile={profile}
        />

        <main className="min-h-screen">
          <Outlet context={{profile,setProfile}}/>
        </main>
      </div>
    </div>
  );
}
