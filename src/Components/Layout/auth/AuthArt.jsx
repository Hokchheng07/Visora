import { Link } from "react-router";
import loginPic from "../../../assets/pages/auth/login/LoginHero-v3.png";
import signupPicture from "../../../assets/pages/auth/register/SignUp-pic.png";
import verifyEmailPicture from "../../../assets/pages/auth/verify-email/verify-email-art.png";
import visoraLogo from "../../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from "../../../theme/ThemeImage";

/* The picture half of Login and Sign Up. AuthLayout owns it so it survives
   the route change and can slide across instead of being rebuilt. */
const AUTH_ART = {
  login: {
    image: loginPic,
    title: "Create without limits.",
    text: null,
  },
  register: {
    image: signupPicture,
    title: "Begin your journey.",
    text: null,
  },
  verify: {
    image: verifyEmailPicture,
    alt: "Khmer woman releasing an origami letter beside a lotus-lit Cambodian lake",
    title: null,
    text: null,
  },
};

export function AuthArtLogo({ page }) {
  return (
    <Link to="/" className="auth-art-logo">
      {page === "verify" ? <img src={visoraLogo} alt="Visora home" /> : <ThemeImage src={visoraLogo} alt="Visora home" />}
    </Link>
  );
}

export function AuthArtContent({ page }) {
  const art = AUTH_ART[page];
  return (
    <div className={`auth-art auth-art-${page}`}>
      <img src={art.image} alt={art.alt || "Khmer-inspired women holding lotus flowers"} />
      <div className="auth-art-wash" aria-hidden="true" />
      {page !== "verify" && (
        <div className="auth-art-kicker" aria-hidden="true">
          <span>Ideas</span><span>People</span><span>Culture</span>
        </div>
      )}
      {(art.title || art.text) && (
        <div className="auth-art-copy">
          {art.title && <h2>{art.title}</h2>}
          {art.text && <p>{art.text}</p>}
        </div>
      )}
    </div>
  );
}
