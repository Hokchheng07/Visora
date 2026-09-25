import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useResendVerificationMutation, useVerifyEmailMutation } from "../API/authApi";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from "../../theme/ThemeImage";

function apiMessage(error, fallback) {
  const detail = error?.data?.detail || error?.data?.message || error?.message;
  return typeof detail === "string" && detail.trim() ? detail : fallback;
}

function EmailIllustration() {
  return (
    <svg className="auth-verify-envelope" viewBox="0 0 176 142" fill="none" aria-hidden="true">
      <path d="M31 37h114a8 8 0 0 1 8 8v73a8 8 0 0 1-8 8H31a8 8 0 0 1-8-8V45a8 8 0 0 1 8-8Z" fill="#EAE1FF" stroke="#BFAAFF" strokeWidth="2" />
      <path d="m24 120 55-44a14 14 0 0 1 18 0l55 44" fill="#DFD2FF" stroke="#AA8EF4" strokeWidth="2" />
      <path d="m24 42 57 47a11 11 0 0 0 14 0l57-47" fill="#F6F0FF" stroke="#7956E3" strokeWidth="2" strokeLinejoin="round" />
      <path d="M88 8v14M57 17l8 11m54-11-8 11" stroke="#7250E7" strokeWidth="3" strokeLinecap="round" />
      <path d="m6 72 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Zm164 0 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#C9B8FA" />
    </svg>
  );
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const emailFromUrl = searchParams.get("email")?.trim() || "";
  const [email, setEmail] = useState(emailFromUrl);
  const [status, setStatus] = useState(token ? "verifying" : "pending");
  const [feedback, setFeedback] = useState("");
  const [resendEmail, { isLoading: isResending }] = useResendVerificationMutation();
  const [verifyEmail] = useVerifyEmailMutation();
  const attemptedToken = useRef("");

  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  useEffect(() => {
    if (!token) {
      attemptedToken.current = "";
      setStatus("pending");
      return;
    }
    // Avoid submitting the same one-time token twice in React Strict Mode.
    if (attemptedToken.current === token) return;
    attemptedToken.current = token;
    setStatus("verifying");
    setFeedback("");

    verifyEmail({ token })
      .unwrap()
      .then((response) => {
        if (attemptedToken.current !== token) return;
        if (response?.success === false) throw new Error(response.message);
        setStatus("verified");
      })
      .catch((error) => {
        if (attemptedToken.current !== token) return;
        setStatus("failed");
        setFeedback(apiMessage(error, "This verification link is invalid or has expired."));
      });
  }, [token, verifyEmail]);

  const handleResend = async (event) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    setFeedback("");

    try {
      const response = await resendEmail({ email: address }).unwrap();
      if (response?.success === false) throw new Error(response.message);
      setEmail(address);
      setFeedback("New link sent. Check your inbox.");
      setStatus("pending");
    } catch (error) {
      setFeedback(apiMessage(error, "Couldn't resend the link. Please try again."));
    }
  };

  const isVerified = status === "verified";
  const isVerifying = status === "verifying";
  const needsEmail = !emailFromUrl;

  return (
    <main className="auth-login auth-verify">
      <section className="auth-login-panel auth-verify-panel">
        <Link to="/" className="auth-mobile-logo lg:hidden">
          <ThemeImage src={visoraLogo} alt="Visora home" />
        </Link>

        <article className="auth-card auth-verify-card" aria-busy={isVerifying}>
          <EmailIllustration />
          <h1>{isVerified ? "Email verified" : status === "failed" ? "Link expired" : "Check your inbox"}</h1>

          <div className="auth-verify-message" aria-live="polite">
            {isVerified ? (
              <p>Your email is verified. You can log in now.</p>
            ) : isVerifying ? (
              <p>Verifying your email…</p>
            ) : status === "failed" ? (
              <p>{feedback || "This verification link is invalid or has expired."}</p>
            ) : email.trim() ? (
              <p>We sent a verification link to <strong>{email.trim()}</strong></p>
            ) : (
              <p>Enter your email to resend the verification link.</p>
            )}
          </div>

          {isVerified ? (
            <Link className="auth-submit auth-verify-primary" to="/auth/login">Login</Link>
          ) : isVerifying ? (
            <button className="auth-submit auth-verify-primary" type="button" disabled>Verifying…</button>
          ) : (
            <form className="auth-verify-form" onSubmit={handleResend}>
              {needsEmail && (
                <label className="auth-verify-email-field">
                  <span className="sr-only">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setFeedback(""); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
              )}
              <button className="auth-submit auth-verify-primary" type="submit" disabled={isResending}>
                {isResending ? "Sending…" : "Resend link"}
              </button>
            </form>
          )}

          {!isVerifying && !isVerified && feedback && status !== "failed" && (
            <p className="auth-verify-feedback" role="status">{feedback}</p>
          )}
          {!isVerified && <Link className="auth-verify-back" to="/auth/login">Back to login</Link>}
        </article>
      </section>
    </main>
  );
}
