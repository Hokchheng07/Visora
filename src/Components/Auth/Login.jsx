import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUserLoginMutation } from "../API/authApi";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setAccessToken, setRefreshToken } from "../redux/authslice";
import z from "zod";
// add zodResolver
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import loginStyle from "../../assets/pages/auth/login/3 Strips 1.png";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from '../../theme/ThemeImage';
import googleIcon from "../../assets/shared/social/google.svg";
import facebookIcon from "../../assets/shared/social/facebook-icon.svg";
import { EASE } from "../../lib/animations/animations";


const fields = [
  { name: "email", label: "Email Address", placeholder: "example@gmail.com", icon: EnvelopeIcon, type: "email" },
  { name: "password", label: "Password", placeholder: "Enter your password", icon: LockClosedIcon, type: "password" },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginRequest] = useUserLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formSchema = z.object({
    email: z
      .string("Please input email")
      .trim()
      .email("Enter a valid email address"),
    password: z
      .string("Please input password")
      .min(8, "Password must be at least 8 characters"),
  });

  // define useForm
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // custom login logic
  const handleLoginSubmit = async (data) => {
    try {
      const result = await loginRequest({
        userLoginRequest: data,
      });

      // the server wraps the tokens inside another "data": { data: { accessToken, refreshToken } }
      const tokens = result?.data?.data;

      if (tokens?.accessToken) {
        dispatch(setAccessToken(tokens.accessToken));
        dispatch(setRefreshToken(tokens.refreshToken));
        sessionStorage.setItem("refreshToken", tokens.refreshToken);

        toast.success("You have logged in successfully!");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      } else {
        toast.error("Incorrect email or password!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
    <ToastContainer />
    {/* Form half only: AuthLayout draws the picture half and slides the two between Login and Sign Up. */}
    <main className="min-h-dvh bg-white font-sans dark:bg-black lg:h-dvh">
      <section className="min-h-0 overflow-y-auto overflow-x-hidden px-5 py-8 sm:px-10 sm:py-12 lg:flex lg:h-full lg:items-start lg:justify-center lg:px-16 lg:py-16 xl:px-24 xl:py-20">
        <div className="mx-auto w-full max-w-[480px] lg:my-auto lg:max-w-[650px]">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <ThemeImage src={visoraLogo} alt="Visora" className="h-auto w-36" />
          </Link>
          <header className="relative mb-6 max-w-[560px] lg:pt-[73px]">
            <img src={loginStyle} alt="" aria-hidden="true" className="pointer-events-none absolute right-0 top-0 hidden h-[109px] w-[146px] object-contain lg:block dark:invert" />
            <h1 className="text-3xl font-normal tracking-tight text-black sm:text-4xl lg:text-5xl dark:text-white">Welcome Back</h1>
          </header>

          <form onSubmit={handleSubmit(handleLoginSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-4">
              {fields.map(({ name, label, placeholder, icon: Icon, type = "text" }) => (
                <label key={name} className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-200">{label} <span className="text-red-600">*</span></span>
                  <span className="relative block">
                    <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={type === "password" && showPassword ? "text" : type}
                      placeholder={placeholder}
                      className={`h-11 w-full rounded-lg border bg-white dark:bg-[#1a1a28] pl-12 pr-12 text-sm text-gray-700 outline-none dark:text-gray-100 transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base ${errors[name] ? "border-red-500" : "border-gray-300 dark:border-white/15"}`}
                      {...register(name)}
                    />
                    {type === "password" && (
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-primary"
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
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    )}
                  </span>
                  <AnimatePresence initial={false}>
                    {errors[name] && (
                      <motion.span
                        key="error"
                        className="mt-1 block text-xs text-red-600 sm:text-sm"
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

            <div className="mt-3 text-right">
              <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline sm:text-base">Forgot password ?</Link>
            </div>

            <button type="submit" className="hero-cta hero-cta-primary mt-5 h-11 w-full max-w-none gap-3 text-base lg:text-lg">
              <span>Login</span><ArrowRight className="size-5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            </button>

            <div className="my-5 flex items-center gap-3 text-base text-gray-400 lg:gap-4"><span className="h-px flex-1 bg-gray-300 dark:bg-white/15" />or<span className="h-px flex-1 bg-gray-300 dark:bg-white/15" /></div>
            <div className="grid gap-3">
              <button type="button" className="flex h-11 items-center justify-center rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 dark:text-gray-100 dark:border-white/15 dark:hover:bg-white/5"><span className="grid w-[19rem] max-w-[calc(100%-2rem)] grid-cols-[1.5rem_1fr] items-center gap-3 text-left"><img src={googleIcon} alt="" className="h-5 w-5 justify-self-center" /><span>Continue with Google</span></span></button>
              <button type="button" className="flex h-11 items-center justify-center rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 dark:text-gray-100 dark:border-white/15 dark:hover:bg-white/5"><span className="grid w-[19rem] max-w-[calc(100%-2rem)] grid-cols-[1.5rem_1fr] items-center gap-3 text-left"><img src={facebookIcon} alt="" className="h-5 w-5 justify-self-center" /><span>Continue with Facebook</span></span></button>
            </div>
            <p className="mt-6 text-center text-gray-400">Don't have an account? <Link to="/auth/register" className="font-medium text-primary hover:underline">Sign up</Link></p>
          </form>
        </div>
      </section>
    </main>
    </>
  );
}
