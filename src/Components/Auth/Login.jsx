import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUserLoginMutation } from "../API/authApi";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setAccessToken, setRefreshToken } from "../redux/authslice";
import { toast, ToastContainer } from "react-toastify";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from '../../theme/ThemeImage';
import googleIcon from "../../assets/shared/social/google.svg";
import githubIcon from "../../assets/shared/social/github_light.svg";
import { EASE } from "../../lib/animations/animations";


const fields = [
  { name: "email", label: "Email", placeholder: "you@example.com", icon: EnvelopeIcon, type: "email", autoComplete: "email" },
  { name: "password", label: "Password", placeholder: "Enter your password", icon: LockClosedIcon, type: "password", autoComplete: "current-password" },
];

const validationRules = {
  email: {
    required: "Please input email",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
    },
  },
  password: {
    required: "Please input password",
  },
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginRequest] = useUserLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (data) => {
    clearErrors("root.credentials");

    try {
      const result = await loginRequest({
        userLoginRequest: data,
      }).unwrap();

      const tokens = result?.data;

      if (tokens?.accessToken) {
        dispatch(setAccessToken(tokens.accessToken));
        dispatch(setRefreshToken(tokens.refreshToken));
        sessionStorage.setItem("refreshToken", tokens.refreshToken);

        toast.success("You have logged in successfully!");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      } else {
        setError("root.credentials", {
          type: "server",
          message: "Incorrect email or password.",
        });
      }
    } catch (error) {
      const status = Number(error?.status);
      const isCredentialError = [400, 401, 403, 404].includes(status);
      const serverMessage =
        error?.data?.message || error?.data?.detail || error?.data?.error;

      setError("root.credentials", {
        type: "server",
        message: isCredentialError
          ? "Incorrect email or password."
          : serverMessage || "Unable to log in. Please try again.",
      });
    }
  };

  return (
    <>
      <ToastContainer />
      {/* AuthLayout owns the illustration panel on desktop. */}
      <main className="auth-login">
        <section className="auth-login-panel">
          <Link to="/" className="auth-mobile-logo lg:hidden">
            <ThemeImage src={visoraLogo} alt="Visora home" />
          </Link>

          <article className="auth-card">
            <header className="auth-card-header">
              <p className="auth-eyebrow">Welcome to Visora</p>
              <h1>Welcome back</h1>
              <p>Log in to continue creating with Visora.</p>
            </header>

            <form onSubmit={handleSubmit(handleLoginSubmit)} noValidate>
              <div className="auth-fields">
                {fields.map(({ name, label, placeholder, icon: Icon, type = "text", autoComplete }) => (
                  <label key={name} className="auth-field">
                    <span className="auth-field-label">{label}</span>
                    <span className={`auth-input-shell ${errors[name] ? "has-error" : ""}`}>
                      <Icon aria-hidden="true" />
                    <input
                      type={type === "password" && showPassword ? "text" : type}
                      placeholder={placeholder}
                      autoComplete={autoComplete}
                      aria-invalid={errors[name] ? "true" : "false"}
                      aria-describedby={errors[name] ? `${name}-error` : undefined}
                      {...register(name, {
                        ...validationRules[name],
                        onChange: () => clearErrors("root.credentials"),
                      })}
                    />
                    {type === "password" && (
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((visible) => !visible)}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={showPassword ? "hide" : "show"}
                            className="block"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    )}
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
              </div>

              <AnimatePresence initial={false}>
                {errors.root?.credentials && (
                  <motion.p
                    role="alert"
                    className="auth-credentials-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    {errors.root.credentials.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="auth-form-meta">
                <Link to="/auth/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-submit">
                <span>Login</span>
                <ArrowRight aria-hidden="true" />
              </button>

              <div className="auth-divider"><span>or continue with</span></div>

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

              <p className="auth-signup-link">
                New to Visora? <Link to="/auth/register">Create account</Link>
              </p>
            </form>
          </article>
        </section>
      </main>
    </>
  );
}
