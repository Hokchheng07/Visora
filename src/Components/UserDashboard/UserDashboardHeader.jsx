import { useEffect,useRef,useState } from "react";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useLocation,useNavigate } from "react-router";

export default function UserDashboardHeader({onMenuOpen,profile}){
  const location=useLocation();
  const navigate=useNavigate();

  const profileRef=useRef(null);
  const lastScrollY=useRef(0);

  const [profileOpen,setProfileOpen]=useState(false);
  const [headerVisible,setHeaderVisible]=useState(true);

  const [dark,setDark]=useState(
    ()=>document.documentElement.classList.contains("dark")
  );

  const isProfilePage=
    location.pathname==="/user-dashboard/profile";

  /* PROFILE DROPDOWN */
  useEffect(()=>{
    function handleOutsideClick(event){
      if(
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ){
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown",handleOutsideClick);

    return()=>{
      document.removeEventListener("mousedown",handleOutsideClick);
    };
  },[]);

  /* SMART HEADER */
  useEffect(()=>{
    function handleScroll(){
      const currentScrollY=window.scrollY;
      const difference=currentScrollY-lastScrollY.current;

      /* Always show near top */
      if(currentScrollY<40){
        setHeaderVisible(true);
      }
      /* Scroll down */
      else if(difference>6){
        setHeaderVisible(false);
        setProfileOpen(false);
      }
      /* Scroll up just a little */
      else if(difference<-4){
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

  function toggleTheme(){
    const nextDark=!dark;

    setDark(nextDark);

    document.documentElement.classList.toggle(
      "dark",
      nextDark
    );

    localStorage.setItem(
      "theme",
      nextDark?"dark":"light"
    );
  }

  async function handleLogout(){
    // Put your actual logout function here first.
    // await logout();

    setProfileOpen(false);
    navigate("/");
  }

  return(
    <header
      className={`sticky top-0 z-30 flex h-[74px] w-full items-center bg-transparent px-4 transition-transform duration-300 ease-out sm:px-5 md:px-6 lg:px-8 xl:px-10 ${
        headerVisible
          ?"translate-y-0"
          :"-translate-y-full"
      }`}
    >
      {/* MOBILE MENU */}
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Open sidebar"
        className="mr-3 grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[var(--text-heading)] transition hover:bg-primary/10 hover:text-primary md:hidden"
      >
        <Menu size={23}/>
      </button>

      {/* SEARCH */}
      <div className="min-w-0 flex-1">
        {!isProfilePage&&(
          <div className="relative w-full max-w-[500px] lg:max-w-[580px] xl:max-w-[650px] 2xl:max-w-[720px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />

            <input
              type="text"
              placeholder="Search templates, designs, or anything..."
              className="h-11 w-full rounded-full bg-[var(--surface-card)]/90 pl-11 pr-4 text-sm text-[var(--text-heading)] shadow-[0_3px_12px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-primary/15"
            />
          </div>
        )}
      </div>

      {/* RIGHT ICONS */}
      <div className="ml-auto flex shrink-0 items-center gap-5">
        {/* THEME */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            dark
              ?"Switch to light mode"
              :"Switch to dark mode"
          }
          className="text-[var(--text-heading)] transition hover:scale-110 hover:text-primary"
        >
          {dark?(
            <Sun className="h-6 w-6"/>
          ):(
            <Moon className="h-6 w-6"/>
          )}
        </button>

        {/* NOTIFICATION */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-[var(--text-heading)] transition hover:scale-110 hover:text-primary"
        >
          <Bell className="h-6 w-6"/>

          <span className="absolute -right-0.5 -top-0.5 h-[7px] w-[7px] rounded-full bg-secondary"/>
        </button>

        {/* PROFILE */}
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            aria-label="User menu"
            aria-expanded={profileOpen}
            onClick={()=>setProfileOpen((current)=>!current)}
            className={`text-[var(--text-heading)] transition hover:scale-110 hover:text-primary ${
              profileOpen?"text-primary":""
            }`}
          >
            <img
              src={profile.avatarUrl}
              alt={`${profile.name} avatar`}
              className="h-7 w-7 rounded-full object-cover"
            />
          </button>

          {profileOpen&&(
            <div className="absolute right-0 top-[calc(100%+16px)] z-50 w-[220px] overflow-hidden rounded-2xl bg-[var(--surface-card)] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3 px-3 py-3">
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} avatar`}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-heading)]">
                    {profile.name}
                  </p>

                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    @{profile.handle}
                  </p>
                </div>
              </div>

              <div className="mx-2 h-px bg-[var(--border-default)]"/>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--text-body)] transition hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut size={17}/>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
