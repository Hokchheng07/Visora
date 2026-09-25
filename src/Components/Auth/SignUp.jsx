import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUserRegisterMutation } from "../API/authApi";
import { registrationErrorMessage } from "../API/apiError.js";
import { useNavigate } from "react-router";
import z from "zod";
// add zodResolver
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import {
  AtSymbolIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from '../../theme/ThemeImage';
import googleIcon from "../../assets/shared/social/google.svg";
import githubIcon from "../../assets/shared/social/github_light.svg";
import { EASE } from "../../lib/animations/animations";
import { PasswordStrengthIndicator } from "@/Components/lightswind/password-strength-indicator";

const fields = [
  { name: "firstName", label: "First name", placeholder: "First name", icon: UserIcon, autoComplete: "given-name" },
  { name: "lastName", label: "Last name", placeholder: "Last name", icon: UserIcon, autoComplete: "family-name" },
  { name: "username", label: "Username", placeholder: "Choose a username", icon: AtSymbolIcon, autoComplete: "username", full: true },
  { name: "phoneNumber", label: "Phone number", placeholder: "+855 12 345 678", icon: PhoneIcon, autoComplete: "tel", full: true },
  { name: "email", label: "Email", placeholder: "you@example.com", icon: EnvelopeIcon, full: true, type: "email", autoComplete: "email" },
];

export default function SignUp() {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerRequest] = useUserRegisterMutation();
  const navigate = useNavigate();

  const formSchema = z
    .object({
      firstName: z.string("Please input first name").trim().min(1, "First name is required"),
      lastName: z.string("Please input last name").trim().min(1, "Last name is required"),
      username: z
        .string("Please input username")
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[A-Za-z0-9_.]+$/, "Username can only use letters, numbers, _ and ."),
      phoneNumber: z
        .string("Please input phone number")
        .trim()
        .regex(/^\+?[0-9\s()-]{8,}$/, "Enter a valid phone number"),
      email: z
        .string("Please input email")
        .trim()
        .email("Enter a valid email address"),
      password: z
        .string("Please input password")
        .min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
      termsAccepted: z.literal(true, { error: "Please accept the Terms & Conditions" }),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  // define useForm
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });
  const password = watch("password");
  const showConfirmation = password.length > 0;
  const passwordRegistration = register("password");

  // custom register logic
  const handleRegisterSubmit = async (data) => {
    // termsAccepted is only for the form, the server doesn't need it
    const { termsAccepted: _termsAccepted, ...userRegisterRequest } = data;

    try {
      const result = await registerRequest({
        userRegisterRequest,
      });

      if (result?.data) {
        navigate(`/auth/verify-email?email=${encodeURIComponent(userRegisterRequest.email)}`, { replace: true });
      } else {
        toast.error(registrationErrorMessage(result?.error));
      }
    } catch (error) {
      toast.error(registrationErrorMessage(error));
    }
  };

  return (
    <>
      <ToastContainer />
      {/* AuthLayout owns the illustration panel on desktop. */}
      <main className="auth-login auth-register">
        <section className="auth-login-panel auth-register-panel">
          <Link to="/" className="auth-mobile-logo lg:hidden">
            <ThemeImage src={visoraLogo} alt="Visora home" />
          </Link>

          <article className="auth-card auth-register-card">
            <header className="auth-card-header auth-register-header">
              <p className="auth-eyebrow">Join Visora</p>
              <h1>Create your account</h1>
              <p>A few details, then you’re ready to create.</p>
            </header>

            <form className="auth-register-form" onSubmit={handleSubmit(handleRegisterSubmit)} noValidate>
              <div className="auth-register-fields">
                {fields.map(({ name, label, placeholder, icon: Icon, full, type = "text", autoComplete }) => (
                  <label key={name} className={`auth-field auth-register-field ${full ? "auth-register-field-full" : ""}`}>
                    <span className="auth-field-label">{label}</span>
                    <span className={`auth-input-shell ${errors[name] ? "has-error" : ""}`}>
                      <Icon aria-hidden="true" />
                    <input
                      type={type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      aria-invalid={errors[name] ? "true" : "false"}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                      {...register(name)}
                    />
                    </span>
                    <AnimatePresence initial={false}>
                      {errors[name] && (
                        <motion.span
                          id={`${name}-error`}
                          key="error"
                          className="auth-field-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2, ease: EASE }}
                        >
                          {errors[name].message}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </label>
                ))}

                <PasswordStrengthIndicator
                  className="auth-password-strength auth-register-field auth-register-field-full"
                  value={password}
                  label="Password"
                  placeholder="Create a password"
                  error={errors.password?.message}
                  inputProps={{
                    ...passwordRegistration,
                    onChange: undefined,
                  }}
                  onChange={(value) => {
                    setValue("password", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                    if (!value) {
                      setValue("confirmPassword", "", { shouldDirty: true, shouldValidate: false });
                      setShowConfirmPassword(false);
                    }
                  }}
                />

                <AnimatePresence initial={false}>
                  {showConfirmation && (
                    <motion.label
                      key="confirm-password"
                      className="auth-field auth-register-field auth-register-field-full"
                      initial={{ opacity: 0, height: 0, transform: "translateY(-6px)" }}
                      animate={{ opacity: 1, height: "auto", transform: "translateY(0)" }}
                      exit={{ opacity: 0, height: 0, transform: "translateY(-6px)" }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <span className="auth-field-label">Confirm password</span>
                      <span className={`auth-input-shell ${errors.confirmPassword ? "has-error" : ""}`}>
                        <LockClosedIcon aria-hidden="true" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repeat password"
                          autoComplete="new-password"
                          aria-invalid={errors.confirmPassword ? "true" : "false"}
                          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          aria-pressed={showConfirmPassword}
                          className="auth-password-toggle"
                          onClick={() => setShowConfirmPassword((visible) => !visible)}
                        >
                          {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                        </button>
                      </span>
                      <AnimatePresence initial={false}>
                        {errors.confirmPassword && (
                          <motion.span
                            id="confirm-password-error"
                            key="confirm-error"
                            className="auth-field-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2, ease: EASE }}
                          >
                            {errors.confirmPassword.message}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.label>
                  )}
                </AnimatePresence>
              </div>

              <label className="auth-terms">
                <input type="checkbox" {...register("termsAccepted")} />
                <span>I agree to the <a href="#terms">Terms &amp; Conditions</a>.</span>
              </label>
              <AnimatePresence initial={false}>
                {errors.termsAccepted && (
                  <motion.p
                    key="terms-error"
                    className="auth-field-error auth-terms-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    {errors.termsAccepted.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className="auth-submit auth-register-submit">
                <span>Create account</span>
                <ArrowRight aria-hidden="true" />
              </button>

              <div className="auth-divider auth-register-divider"><span>or continue with</span></div>
              <div className="auth-providers">
                <button type="button" className="auth-provider-button">
                  <img src={googleIcon} alt="" aria-hidden="true" />
                  <span>Google</span>
                </button>
                <button type="button" className="auth-provider-button auth-provider-github">
                  <ThemeImage src={githubIcon} alt="" aria-hidden="true" />
                  <span>GitHub</span>
                </button>
              </div>

              <p className="auth-signup-link auth-login-link">
                Already have an account? <Link to="/auth/login">Login</Link>
              </p>
            </form>
          </article>
        </section>
      </main>
    </>
  );
}
