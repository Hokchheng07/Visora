import { Link } from "react-router";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { PASSWORD_RESET_DEMO } from "../API/passwordResetApi.js";
import PasswordField from "./forgot-password/PasswordField.jsx";
import usePasswordReset from "./forgot-password/usePasswordReset.js";
import { rules } from "./forgot-password/passwordResetValidation.js";
import artwork from "../../assets/pages/auth/forgot-password/reset-password-art.png";
import logo from "../../assets/shared/branding/VisoraLogo.png";
import "./forgot-password.css";

const steps = ["Enter Email", "Verify Code", "Create New Password"];

export default function ForgotPassword() {
  const {
    step, email, digits, password, confirm, remaining, busy, error, notice,
    complete, inputs, heading, setEmail, setPassword, setConfirm, setError,
    sendCode, updateCode, fillCode, resetPassword,
  } = usePasswordReset();

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
        <Link to="/" className="reset-mobile-logo"><img src={logo} alt="Visora home" /></Link>
        <header className="reset-heading">
          <h1 ref={heading} tabIndex={-1}>{complete ? (PASSWORD_RESET_DEMO ? "Demo Complete" : "Password Reset!") : "Reset Your Password"}</h1>
          <p>{complete ? (PASSWORD_RESET_DEMO ? "You’ve completed the preview. Your real password has not changed." : "Your password has been updated. You can now log in.")
            : step === 2 ? "Create a new password for your account."
            : step === 1 ? "Enter the verification code to reset your password."
            : "Enter your email and we’ll send you a verification code to reset your password"}</p>
        </header>
        <ol className="reset-steps" aria-label="Password reset progress">
          {steps.map((label, index) => <li key={label} className={`${index <= step ? "is-active" : ""} ${index < step || complete ? "is-complete" : ""}`} aria-current={!complete && step === index ? "step" : undefined}>
            <span className="reset-step-dot">{index < step || complete ? <Check size={20} aria-label="Completed" /> : index + 1}</span>
            <span>{label}</span>
          </li>)}
        </ol>
        {!complete && <form onSubmit={step === 0 ? sendCode : step === 2 ? resetPassword : (event) => event.preventDefault()} noValidate aria-busy={busy}>
          <fieldset disabled={busy} className="reset-fields">
            {step === 0 && <label className="reset-field" htmlFor="reset-email">
              <span>Email Address <b>*</b></span>
              <span className="reset-input-wrap"><Mail size={20} aria-hidden="true" />
                <input id="reset-email" type="email" autoComplete="email" required placeholder="example@gmail.com" value={email}
                  onChange={(event) => { setEmail(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "reset-error" : undefined} />
              </span>
            </label>}
            {step === 1 && <div className="reset-code-section">
              <span id="reset-code-label" className="reset-field-label">Enter Verification Code <b>*</b></span>
              <div className="reset-code-inputs" role="group" aria-labelledby="reset-code-label" aria-describedby="reset-code-help">
                {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element; }} aria-label={`Digit ${index + 1}`}
                  type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} value={digit}
                  aria-invalid={!!error} aria-describedby={error ? "reset-error" : undefined}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) => fillCode(index, event.target.value)}
                  onPaste={(event) => { event.preventDefault(); fillCode(index, event.clipboardData.getData("text")); }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !digits[index] && index > 0) {
                      event.preventDefault(); const next = [...digits]; next[index - 1] = ""; updateCode(next); inputs.current[index - 1]?.focus();
                    }
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault(); inputs.current[Math.max(0, Math.min(5, index + (event.key === "ArrowLeft" ? -1 : 1)))]?.focus();
                    }
                  }} />)}
              </div>
              <p id="reset-code-help">{PASSWORD_RESET_DEMO ? "Previewing verification for" : "We sent a 6-digit code to"} <strong>{email}</strong></p>
              <button className="reset-resend" type="button" disabled={remaining > 0} onClick={sendCode}>
                {remaining > 0 ? <>Resend code in <span>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</span></> : "Resend code"}
              </button>
            </div>}
            {step === 2 && <>
              <PasswordField label="New Password" id="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} invalid={!!error} />
              <ul className="reset-password-rules" aria-label="Password requirements">
                {rules.map((rule) => <li className={rule.test(password) ? "is-met" : ""} key={rule.label}>
                  <span aria-hidden="true">{rule.test(password) && <Check size={12} />}</span><span className="sr-only">{rule.test(password) ? "Met: " : "Not met: "}</span>{rule.label}
                </li>)}
              </ul>
              <PasswordField label="Confirm New Password" id="confirm-password" value={confirm} onChange={(event) => { setConfirm(event.target.value); setError(""); }} invalid={!!error} />
            </>}
            {step !== 1 && <button className="reset-primary" type="submit">{busy ? (step === 0 ? "Sending…" : "Resetting…") : (step === 0 ? "Send Verification Code" : "Reset Password")}<ArrowRight size={20} aria-hidden="true" /></button>}
          </fieldset>
          {error && <p id="reset-error" className="reset-error" role="alert">{error}</p>}
          <p className="reset-status" role="status">{busy && step === 1 ? "Checking your code…" : notice}</p>
        </form>}
        {step !== 2 && !complete && <div className="reset-divider"><span />or<span /></div>}
        <Link to="/auth/login" className="reset-back"><span><ArrowLeft size={19} aria-hidden="true" />Back to Login</span></Link>
        {!complete && <p className="reset-footer">{step === 2 ? "Make sure it’s something you’ll remember!" : <>Didn’t receive the code? Check your spam folder{step === 1 ? " or resend when the countdown ends." : "."}</>}</p>}
      </div>
    </section>
  </main>;
}
