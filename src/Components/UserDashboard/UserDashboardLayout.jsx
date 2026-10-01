import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { useDashboardProfile } from "../Account/useDashboardProfile";
import CosmicDust from "../Effects/CosmicDust.jsx";

import "./dashboard-mobile.css";

import UserDashboardHeader from "./UserDashboardHeader";
import UserDashboardSidebar from "./UserDashboardSidebar";
import { DEFAULT_PROFILE } from "./Profile/profileData";
import { usePageMeta } from "../../hooks/usePageMeta.js";

export default function UserDashboardLayout(){
  usePageMeta({ title: "My dashboard", noindex: true });
  const [sidebarOpen,setSidebarOpen]=useState(false);
  // The signed-in account (GET /users/me); DEFAULT_PROFILE is only the
  // stand-in shown while nobody is logged in.
  const {profile,saveProfile,isSaving,isLoading:profileLoading,error}=useDashboardProfile(DEFAULT_PROFILE);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return(
    <div className="site-shell user-dashboard-shell flex min-h-screen bg-[var(--surface-warm)] text-[var(--text-body)]">
      <UserDashboardSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="user-dashboard-content relative isolate min-w-0 flex-1 bg-[var(--surface-warm)]">
        <CosmicDust particleCount={120} />
        <UserDashboardHeader
          onMenuOpen={()=>setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
          profile={profile}
          profileLoading={profileLoading}
        />

        {/* A size container: the pages lay out by the width they actually get
            (the window minus the sidebar), using @-prefixed breakpoints. */}
        <div className="@container relative z-[1] min-h-screen">
          <Outlet context={{profile,profileLoading,saveProfile,isSaving,saveError:error}}/>
        </div>
      </div>
    </div>
  );
}
