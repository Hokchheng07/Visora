import { useRef,useState } from "react";
import { NavLink } from "react-router";
import { Bars3Icon,XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence,motion,useMotionValueEvent,useScroll } from "motion/react";
import { ThemeImage } from "../../theme/ThemeImage";
import ThemeToggle from "../../theme/ThemeToggle";
import UserProfile from "../Account/UserProfile";
import { useCurrentUser } from "../Account/useCurrentUser";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import mobileLogo from "../../assets/shared/branding/visora-logo-mobile.png";
import navbarBg from "../../assets/sections/navbar/NavbarBg.svg";
import { EASE } from "../../lib/animations/animations";

const NAV_LINKS=[
  {label:"Home",to:"/"},
  {label:"Templates",to:"/templates"},
  {label:"About Us",to:"/about"},
];

function NavLinkRow({to,label,onClick,className=""}){
  return(
    <NavLink
      to={to}
      end={to==="/"}
      onClick={onClick}
      className={`group relative inline-block font-sans font-semibold text-[var(--text-heading)] transition-colors duration-200 hover:text-primary lg:text-sm xl:text-base 2xl:text-lg ${className}`}
    >
      {label}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary transition-transform duration-200 ease-out group-hover:scale-x-100"
      />
    </NavLink>
  );
}

export default function Navbar(){
  const {isSignedIn}=useCurrentUser();
  const mobileLinks=isSignedIn
    ?[...NAV_LINKS,{label:"Profile",to:"/user-dashboard/profile"}]
    :NAV_LINKS;
  const [mobileOpen,setMobileOpen]=useState(false);
  const [hidden,setHidden]=useState(false);
  const lastScrollY=useRef(0);
  const {scrollY}=useScroll();

  useMotionValueEvent(scrollY,"change",(currentScrollY)=>{
    if(currentScrollY<80||mobileOpen){
      setHidden(false);
      lastScrollY.current=currentScrollY;
      return;
    }

    const delta=currentScrollY-lastScrollY.current;

    if(Math.abs(delta)<8)return;

    setHidden(delta>0);
    lastScrollY.current=currentScrollY;
  });

  return(
    <motion.header
      className="sticky top-0 z-50 w-full will-change-transform"
      animate={{y:hidden?"-100%":"0%"}}
      transition={{type:"spring",stiffness:320,damping:34,mass:0.8}}
    >
      <ThemeImage
        src={navbarBg}
        alt=""
        aria-hidden="true"
        className="navbar-background"
      />

      <div className="navbar-shell relative z-10 h-[88px] w-full overflow-hidden sm:h-[98px] md:h-[108px] lg:h-[124px] xl:h-[155px] 2xl:h-[195px]">
        <nav className="navbar-nav relative z-10 flex h-[68px] w-full items-center justify-between px-5 sm:h-[76px] sm:px-8 md:h-[84px] md:px-10 lg:h-[98px] lg:px-[6vw] xl:h-[124px] xl:px-[8vw] 2xl:h-[150px] 2xl:px-[6vw]">
          <NavLink
            to="/"
            onClick={()=>setMobileOpen(false)}
            className="shrink-0"
          >
            <ThemeImage
              src={visoraLogo}
              alt="Visora"
              width={152}
              height={86}
              className="hidden w-auto lg:block lg:h-[68px] xl:h-[88px] 2xl:h-[110px]"
            />

            <ThemeImage
              src={visoraLogo}
              alt="Visora"
              width={152}
              height={86}
              className="hidden w-auto sm:block sm:h-[58px] md:h-[64px] lg:hidden"
            />

            <ThemeImage
              src={mobileLogo}
              alt="Visora"
              width={1672}
              height={941}
              className="h-[46px] w-auto object-contain sm:hidden"
            />
          </NavLink>

          <ul className="navbar-links hidden items-center lg:flex lg:gap-7 xl:gap-10 2xl:gap-14">
            {NAV_LINKS.map((link)=>(
              <li key={link.to}>
                <NavLinkRow to={link.to} label={link.label}/>
              </li>
            ))}
          </ul>

          <div className="hidden items-center lg:flex lg:gap-4 xl:gap-6 2xl:gap-7">
            <div className="2xl:scale-110">
              <ThemeToggle/>
            </div>

            {/* Signed in: the account menu. Signed out: both auth actions. */}
            <UserProfile
              size={60}
              signedOut={
                <div className="navbar-auth-actions">
                  <NavLink to="/auth/login" className="navbar-auth-link navbar-auth-link-login">
                    Login
                  </NavLink>
                  <NavLink to="/auth/register" className="navbar-auth-link navbar-auth-link-register">
                    Register
                  </NavLink>
                </div>
              }
            />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle/>

            <button
              type="button"
              aria-label={mobileOpen?"Close menu":"Open menu"}
              aria-expanded={mobileOpen}
              onClick={()=>setMobileOpen((open)=>!open)}
              className="grid h-10 w-10 place-items-center rounded-xl text-[var(--text-heading)] transition hover:bg-primary/10 hover:text-primary sm:h-11 sm:w-11"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen?"close":"open"}
                  className="block"
                  initial={{opacity:0,rotate:-90,scale:0.8}}
                  animate={{opacity:1,rotate:0,scale:1}}
                  exit={{opacity:0,rotate:90,scale:0.8}}
                  transition={{duration:0.16,ease:"easeOut"}}
                >
                  {mobileOpen?(
                    <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7"/>
                  ):(
                    <Bars3Icon className="h-6 w-6 sm:h-7 sm:w-7"/>
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen&&(
          <motion.div
            key="mobile-menu"
            className="absolute left-0 right-0 top-[72px] z-40 px-3 sm:top-[82px] sm:px-6 md:top-[90px] md:px-8 lg:hidden"
            initial={{opacity:0,y:-14,scale:0.98}}
            animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:-12,scale:0.98}}
            transition={{duration:0.2,ease:EASE}}
          >
            <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-[22px] border border-[var(--border-default)] bg-[var(--surface-card)] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)] sm:rounded-[26px] sm:p-4">
              <nav className="space-y-1">
                {mobileLinks.map((link)=>(
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to==="/"}
                    onClick={()=>setMobileOpen(false)}
                    className={({isActive})=>
                      `flex h-12 items-center rounded-xl px-4 font-sans text-sm font-semibold transition sm:h-13 sm:text-base ${
                        isActive
                          ?"bg-primary text-[var(--text-on-brand)] shadow-sm"
                          :"text-[var(--text-heading)] hover:bg-primary/10 hover:text-primary"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {!isSignedIn&&(
                <>
                  <div className="my-3 h-px bg-[var(--border-default)]"/>
                  <div className="navbar-auth-actions navbar-auth-actions-mobile">
                    <NavLink
                      to="/auth/login"
                      onClick={()=>setMobileOpen(false)}
                      className="navbar-auth-link navbar-auth-link-login"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/auth/register"
                      onClick={()=>setMobileOpen(false)}
                      className="navbar-auth-link navbar-auth-link-register"
                    >
                      Register
                    </NavLink>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
