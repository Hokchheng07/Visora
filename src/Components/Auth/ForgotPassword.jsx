import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import PasswordField from "./forgot-password/PasswordField.jsx";
import usePasswordReset from "./forgot-password/usePasswordReset.js";
import { rules } from "./forgot-password/passwordResetValidation.js";
import artwork from "../../assets/pages/auth/forgot-password/reset-password-art.png";
import logo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from "../../theme/ThemeImage";
import { EASE } from "../../lib/animations/animations";
import "./forgot-password.css";

const steps = ["Enter Email", "Create New Password"];

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const {
    step, email, password, confirm, busy, error, emailSent, complete, heading,
    setEmail, setPassword, setConfirm, setError, sendCode, resetPassword,
  } = usePasswordReset(resetToken);
  const reduceMotion = useReducedMotion();
  // The first step arrives with the route fade, so only later steps animate in.
  const firstStep = useRef(true);
  useEffect(() => { firstStep.current = false; }, []);

  return <main className="reset-page font-sans">
    <aside className="reset-art-panel" aria-label="Welcome to Visora">
      <img className="reset-art" src={artwork} alt="Khmer woman in traditional golden attire holding a lotus" />
      <div className="reset-art-shade" />
      <Link to="/" className="reset-logo" aria-label="Visora home"><img src={logo} alt="Visora" /></Link>
      <div className="reset-welcome">
        <h2>Welcome Back To<br />Your Creativity.</h2>
        <p>Reset your password and continue designing beautiful experiences with Visora.</p>
      </div>
    </aside>
    <section className="reset-form-panel">
      <div className="reset-content">
        <Link to="/" className="reset-mobile-logo"><ThemeImage src={logo} alt="Visora home" /></Link>
        <header className="reset-heading">
          <h1 ref={heading} tabIndex={-1}>{complete ? "Password Reset!" : emailSent ? "Check Your Email" : "Reset Your Password"}</h1>
          <p>{complete ? "Your password has been updated. You can now log in."
            : emailSent ? `We sent a password reset link to ${email}. Open it to create a new password.`
            : step === 1 ? "Create a new password for your account."
            : "Enter your email and we’ll send you a secure link to reset your password."}</p>
        </header>
        {!emailSent && !complete && <ol className="reset-steps" aria-label="Password reset progress">
          {steps.map((label, index) => <li key={label} className={`${index <= step ? "is-active" : ""} ${index < step || complete ? "is-complete" : ""}`} aria-current={!complete && step === index ? "step" : undefined}>
            <span className="reset-step-dot">{index < step || complete ? <Check size={20} aria-label="Completed" /> : index + 1}</span>
            <span>{label}</span>
          </li>)}
        </ol>}
        {!complete && !emailSent && <form onSubmit={step === 0 ? sendCode : resetPassword} noValidate aria-busy={busy}>
          <fieldset disabled={busy} className="reset-fields">
            {/* The email link opens this page at the password step. */}
            <motion.div key={step}
              initial={firstStep.current ? false : { opacity: 0, y: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: EASE }}>
            {step === 0 && <label className="reset-field" htmlFor="reset-email">
              <span>Email Address <b>*</b></span>
              <span className="reset-input-wrap"><Mail size={20} aria-hidden="true" />
                <input id="reset-email" type="email" autoComplete="email" required placeholder="example@gmail.com" value={email}
                  onChange={(event) => { setEmail(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "reset-error" : undefined} />
              </span>
            </label>}
            {step === 1 && <>
              <PasswordField label="New Password" id="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} invalid={!!error} />
              <ul className="reset-password-rules" aria-label="Password requirements">
                {rules.map((rule) => <li className={rule.test(password) ? "is-met" : ""} key={rule.label}>
                  <span aria-hidden="true">{rule.test(password) && <Check size={12} />}</span><span className="sr-only">{rule.test(password) ? "Met: " : "Not met: "}</span>{rule.label}
                </li>)}
              </ul>
              <PasswordField label="Confirm New Password" id="confirm-password" value={confirm} onChange={(event) => { setConfirm(event.target.value); setError(""); }} invalid={!!error} />
            </>}
            <button className="reset-primary" type="submit">{busy ? (step === 0 ? "Sending…" : "Resetting…") : (step === 0 ? "Send Reset Link" : "Reset Password")}<ArrowRight size={20} aria-hidden="true" /></button>
            </motion.div>
          </fieldset>
          {error && <p id="reset-error" className="reset-error" role="alert">{error}</p>}
        </form>}
        {step === 0 && !emailSent && !complete && <div className="reset-divider"><span />or<span /></div>}
        <Link to="/auth/login" className="reset-back"><span><ArrowLeft size={19} aria-hidden="true" />Back to Login</span></Link>
        {!complete && <p className="reset-footer">{step === 1 ? "Make sure it’s something you’ll remember!" : "Didn’t receive the email? Check your spam folder."}</p>}
      </div>
    </section>
  </main>;
}
