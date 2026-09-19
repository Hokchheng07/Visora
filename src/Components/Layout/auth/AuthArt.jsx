import { Link } from "react-router";
import loginPic from "../../../assets/pages/auth/login/LoginLogo-pic.png";
import signupPicture from "../../../assets/pages/auth/register/SignUp-pic.png";
import visoraLogo from "../../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from "../../../theme/ThemeImage";

/* The picture half of Login and Sign Up. AuthLayout owns it so it survives
   the route change and can slide across instead of being rebuilt. */
const AUTH_ART = {
  login: {
    image: loginPic,
    title: "Unleash your creativity.",
    text: "Join thousands of creators in bulding the next generation digital experiences",
  },
  register: {
    image: signupPicture,
    title: "Begin Your Journey",
    text: "Create an account to start building, sharing, and discovering incredible digital experiences today.",
  },
};

export function AuthArtLogo() {
  return (
    <Link to="/" className="absolute left-12 top-10 z-10">
      <ThemeImage src={visoraLogo} alt="Visora" className="h-auto w-48" />
    </Link>
  );
}

export function AuthArtContent({ page }) {
  const art = AUTH_ART[page];
  return (
    <>
      <img src={art.image} alt="Khmer-inspired woman surrounded by decorative motifs" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/75" />
      <div className="absolute bottom-16 left-16 z-10 max-w-[680px] text-white">
        <h2 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{art.title}</h2>
        <p className="mt-6 max-w-[620px] text-lg leading-8 sm:text-xl">{art.text}</p>
      </div>
    </>
  );
}
