import {useEffect,useRef,useState} from "react";
import {Bell,Menu,Moon,Sun} from "lucide-react";
import {useLocation,useNavigate} from "react-router";
import UserProfile from "../Account/UserProfile";
import {useTheme} from "../../theme/useTheme";

export default function UserDashboardHeader({
  onMenuOpen,
  profile,
  sidebarOpen=false,
}){
  const location=useLocation();
  const navigate=useNavigate();
  const lastScrollY=useRef(0);

  const [profileOpen,setProfileOpen]=useState(false);
  const [headerVisible,setHeaderVisible]=useState(true);
  const {resolvedTheme,toggleTheme,busy}=useTheme();
  const dark=resolvedTheme==="dark";

  const isProfilePage=location.pathname==="/user-dashboard/profile";

  useEffect(()=>{
    function handleScroll(){
      const currentScrollY=window.scrollY;
      const difference=currentScrollY-lastScrollY.current;

      if(currentScrollY<40){
        setHeaderVisible(true);
      }else if(difference>6){
        setHeaderVisible(false);
        setProfileOpen(false);
      }else if(difference<-4){
        setHeaderVisible(true);
      }

      lastScrollY.current=currentScrollY;
    }

    window.addEventListener("scroll",handleScroll,{
      passive:true,
    });

    return()=>{
      window.removeEventListener("scroll",handleScroll);
    };
  },[]);

  async function handleLogout(){
    setProfileOpen(false);
    navigate("/");
  }

  return(
    <header
      data-profile={isProfilePage}
      className={`user-dashboard-header sticky top-0 z-30 flex h-[74px] w-full items-center bg-transparent px-4 transition-transform duration-300 ease-out sm:px-5 md:px-6 lg:px-8 xl:px-10 ${
        headerVisible
          ?"translate-y-0"
          :"-translate-y-full"
      }`}
    >
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Open sidebar"
        aria-expanded={sidebarOpen}
        aria-controls="user-dashboard-sidebar"
        className="user-dashboard-menu-button mr-3 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--text-heading)] transition hover:bg-primary/10 hover:text-primary md:hidden"
      >
        <Menu size={23}/>
      </button>

      <div className="min-w-0 flex-1">
        {isProfilePage&&(
          <p className="user-dashboard-header-title text-sm font-semibold text-[var(--text-heading)] sm:text-base">
            My Profile
          </p>
        )}
      </div>

      <div className="user-dashboard-header-actions ml-auto flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-disabled={busy}
          aria-label={
            dark
              ?"Switch to light mode"
              :"Switch to dark mode"
          }
          className="text-[var(--text-heading)] transition hover:scale-110 hover:text-primary"
        >
          {dark?(
            <Sun className="h-5 w-5 sm:h-6 sm:w-6"/>
          ):(
            <Moon className="h-5 w-5 sm:h-6 sm:w-6"/>
          )}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative text-[var(--text-heading)] transition hover:scale-110 hover:text-primary"
        >
          <Bell className="h-5 w-5 sm:h-6 sm:w-6"/>

          <span className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-secondary"/>
        </button>

        <UserProfile
          profile={profile}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}