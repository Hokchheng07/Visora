import { useEffect, useRef, useState } from "react";
import { passwordResetApi, PASSWORD_RESET_DEMO } from "../../API/passwordResetApi.js";
import { emailSchema, rules } from "./passwordResetValidation.js";

// Owns the recovery flow, transient token, resend timer and focus behavior.
// Keep network details in the API adapter and presentation in the page.
export default function usePasswordReset() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [challengeId, setChallengeId] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [complete, setComplete] = useState(false);
  const pending = useRef(false);
  const inputs = useRef([]);
  const heading = useRef(null);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (step === 1) inputs.current[0]?.focus({ preventScroll: true });
    if (step === 2 || complete) heading.current?.focus({ preventScroll: true });
  }, [step, complete]);

  async function request(action) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try { await action(); }
    catch (failure) { setError(failure.message || "Something went wrong. Please try again."); }
    finally { pending.current = false; setBusy(false); }
  }

  function sendCode(event) {
    event?.preventDefault();
    if (step === 1 && Date.now() < deadline) return;
    const result = emailSchema.safeParse(email);
    if (!result.success) return setError("Enter a valid email address.");
    return request(async () => {
      const response = await passwordResetApi.sendCode({ email: result.data });
      setEmail(result.data);
      setChallengeId(response.challengeId);
      setDeadline(Date.now() + response.retryAfterSeconds * 1000);
      setRemaining(response.retryAfterSeconds);
      setDigits(Array(6).fill(""));
      setStep(1);
      setNotice(PASSWORD_RESET_DEMO ? "Demo code is ready. No email was sent." : "A verification code has been sent. Check your email.");
      // Resending stays on the same step, so restore focus after inputs enable.
      window.requestAnimationFrame(() => inputs.current[0]?.focus({ preventScroll: true }));
    });
  }

  function updateCode(next) {
    if (pending.current) return;
    setDigits(next);
    setError("");
    if (next.every((digit) => /^\d$/.test(digit))) {
      void request(async () => {
        const response = await passwordResetApi.verifyCode({ challengeId, code: next.join("") });
        setResetToken(response.resetToken);
        setStep(2);
      });
    }
  }

  function fillCode(index, raw) {
    const value = raw.replace(/\D/g, "");
    const next = [...digits];
    if (!value) next[index] = "";
    else {
      const start = value.length >= 6 ? 0 : index;
      value.slice(0, 6 - start).split("").forEach((digit, offset) => { next[start + offset] = digit; });
      inputs.current[Math.min(5, start + value.length)]?.focus();
    }
    updateCode(next);
  }

  function resetPassword(event) {
    event.preventDefault();
    if (!rules.every((rule) => rule.test(password))) return setError("Your new password must meet all three requirements.");
    if (password !== confirm) return setError("Your passwords do not match.");
    return request(async () => {
      await passwordResetApi.resetPassword({ resetToken, password });
      setPassword("");
      setConfirm("");
      setResetToken(null);
      setComplete(true);
    });
  }

  return {
    step, email, digits, password, confirm, remaining, busy, error, notice,
    complete, inputs, heading, setEmail, setPassword, setConfirm, setError,
    sendCode, updateCode, fillCode, resetPassword,
  };
}
