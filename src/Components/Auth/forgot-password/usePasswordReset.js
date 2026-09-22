import { useEffect, useRef, useState } from "react";
import { useResetPasswordMutation, useUserForgotPasswordMutation } from "../../API/authApi.js";
import { emailSchema, rules } from "./passwordResetValidation.js";

function resetErrorMessage(error) {
  if (error?.status === "FETCH_ERROR") return "Couldn’t reach the server. Please try again.";
  if (typeof error?.data === "string" && error.data.trim()) return error.data.trim();
  return error?.data?.message || error?.data?.detail || error?.message || "Something went wrong. Please try again.";
}

// Owns the email-link recovery flow and keeps its network state out of the page.
export default function usePasswordReset(resetToken) {
  const [sendForgotPassword] = useUserForgotPasswordMutation();
  const [submitResetPassword] = useResetPasswordMutation();
  const [step, setStep] = useState(() => resetToken ? 1 : 0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [complete, setComplete] = useState(false);
  const pending = useRef(false);
  const heading = useRef(null);

  useEffect(() => {
    if (resetToken) {
      setStep(1);
      setEmailSent(false);
    }
  }, [resetToken]);

  useEffect(() => {
    if (step === 1 || emailSent || complete) heading.current?.focus({ preventScroll: true });
  }, [step, emailSent, complete]);

  async function request(action) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try { await action(); }
    catch (failure) { setError(resetErrorMessage(failure)); }
    finally { pending.current = false; setBusy(false); }
  }

  function sendCode(event) {
    event?.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) return setError("Enter a valid email address.");
    return request(async () => {
      await sendForgotPassword({ email: result.data }).unwrap();
      setEmail(result.data);
      setEmailSent(true);
    });
  }

  function resetPassword(event) {
    event.preventDefault();
    if (!resetToken) return setError("This password reset link is missing or invalid. Request a new link.");
    if (!rules.every((rule) => rule.test(password))) return setError("Your new password must meet all three requirements.");
    if (password !== confirm) return setError("Your passwords do not match.");
    return request(async () => {
      await submitResetPassword({
        token: resetToken,
        newPassword: password,
        confirmPassword: confirm,
      }).unwrap();
      setPassword("");
      setConfirm("");
      setComplete(true);
    });
  }

  return {
    step, email, password, confirm, busy, error, emailSent, complete, heading,
    setEmail, setPassword, setConfirm, setError, sendCode, resetPassword,
  };
}
