import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUserRegisterMutation } from "../API/authApi";
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
import signupCrown from "../../assets/pages/auth/register/SignUpCrown.png";
import visoraLogo from "../../assets/shared/branding/VisoraLogo.png";
import { ThemeImage } from '../../theme/ThemeImage';
import googleIcon from "../../assets/shared/social/google.svg";
import facebookIcon from "../../assets/shared/social/facebook-icon.svg";
import { EASE } from "../../lib/animations/animations";

const fields = [
  { name: "firstName", label: "First name", placeholder: "Enter your first name", icon: UserIcon },
  { name: "lastName", label: "Last name", placeholder: "Enter your last name", icon: UserIcon },
  { name: "username", label: "Username", placeholder: "Enter your username", icon: AtSymbolIcon, full: true },
  { name: "phoneNumber", label: "Phone number", placeholder: "+85512345678", icon: PhoneIcon, full: true },
  { name: "email", label: "Email Address", placeholder: "example@gmail.com", icon: EnvelopeIcon, full: true, type: "email" },
  { name: "password", label: "Password", placeholder: "Enter your password", icon: LockClosedIcon, type: "password" },
  { name: "confirmPassword", label: "Confirm Password", placeholder: "Confirm Password", icon: LockClosedIcon, type: "password" },
];

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
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
  const { register, handleSubmit, formState: { errors } } = useForm({
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

  // custom register logic
  const handleRegisterSubmit = async (data) => {
    // termsAccepted is only for the form, the server doesn't need it
    const { termsAccepted, ...userRegisterRequest } = data;

    try {
      const result = await registerRequest({
        userRegisterRequest,
      });

      if (result?.data) {
        toast.success("Your account has been created! Please log in.");
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 2000);
      } else {
        toast.error(result?.error?.data?.message || "Could not create your account!");
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
          <header className="relative mb-8 max-w-[560px] lg:mb-10">
            <img src={signupCrown} alt="" aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 hidden w-24 rotate-[45deg] lg:block" />
            <h1 className="text-3xl font-normal tracking-tight text-black sm:text-4xl lg:text-5xl dark:text-white">Create an Account</h1>
            <p className="mt-4 max-w-[500px] text-base leading-6 text-gray-500 sm:text-lg lg:mt-8 lg:text-xl lg:leading-7 dark:text-[#bcbccd]">Join Visora and start designing stunning event backdrops in minutes</p>
          </header>

          <form onSubmit={handleSubmit(handleRegisterSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
              {fields.map(({ name, label, placeholder, icon: Icon, full, type = "text" }) => (
                <label key={name} className={`block ${full ? "lg:col-span-2" : ""}`}>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700 sm:text-base lg:mb-2 lg:text-lg dark:text-gray-200">{label} <span className="text-red-600">*</span></span>
                  <span className="relative block">
                    {(full || type === "password") && <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 lg:left-5 lg:h-6 lg:w-6" />}
                    <input
                      type={type === "password" && ((name === "password" && showPassword) || (name === "confirmPassword" && showConfirmPassword)) ? "text" : type}
                      placeholder={placeholder}
                      className={`h-12 w-full rounded-lg border bg-white dark:bg-[#1a1a28] px-4 text-sm text-gray-700 outline-none dark:text-gray-100 transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base lg:h-14 ${full || type === "password" ? "pl-12 lg:pl-16" : ""} ${type === "password" ? "pr-12" : ""} ${errors[name] ? "border-red-500" : "border-gray-300 dark:border-white/15"}`}
                      {...register(name)}
                    />
                    {type === "password" && (
                      <button
                        type="button"
                        aria-label={name === "password" ? (showPassword ? "Hide password" : "Show password") : (showConfirmPassword ? "Hide confirm password" : "Show confirm password")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-primary"
                        onClick={() => name === "password" ? setShowPassword((visible) => !visible) : setShowConfirmPassword((visible) => !visible)}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={(name === "password" ? showPassword : showConfirmPassword) ? "hide" : "show"}
                            className="block"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                          >
                            {(name === "password" ? showPassword : showConfirmPassword) ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
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

            <label className="mt-5 flex items-start gap-2 text-sm leading-5 text-gray-600 lg:mt-6 dark:text-[#bcbccd]">
              <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-primary" {...register("termsAccepted")} />
              <span>I accept the <a href="#terms" className="text-primary hover:underline">Terms &amp; Conditions</a>.</span>
            </label>
            <AnimatePresence initial={false}>
              {errors.termsAccepted && (
                <motion.p
                  key="terms-error"
                  className="mt-1 text-xs text-red-600 sm:text-sm"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  {errors.termsAccepted.message}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="hero-cta hero-cta-primary mt-5 h-12 w-full max-w-none gap-3 text-base lg:mt-6 lg:h-14 lg:text-xl">
              <span>Sign Up</span><ArrowRight className="size-5 shrink-0 lg:size-6" strokeWidth={2.25} aria-hidden="true" />
            </button>

            <div className="my-5 flex items-center gap-3 text-base text-gray-400 lg:my-6 lg:gap-4 lg:text-xl"><span className="h-px flex-1 bg-gray-300 dark:bg-white/15" />or Sign up with<span className="h-px flex-1 bg-gray-300 dark:bg-white/15" /></div>
            <div className="grid gap-3">
              <button type="button" className="flex h-12 items-center justify-center rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 lg:h-14 lg:text-lg dark:text-gray-100 dark:border-white/15 dark:hover:bg-white/5"><span className="grid w-[19rem] max-w-[calc(100%-2rem)] grid-cols-[1.5rem_1fr] items-center gap-3 text-left"><img src={googleIcon} alt="" className="h-5 w-5 justify-self-center lg:h-6 lg:w-6" /><span>Continue with Google</span></span></button>
              <button type="button" className="flex h-12 items-center justify-center rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 lg:h-14 lg:text-lg dark:text-gray-100 dark:border-white/15 dark:hover:bg-white/5"><span className="grid w-[19rem] max-w-[calc(100%-2rem)] grid-cols-[1.5rem_1fr] items-center gap-3 text-left"><img src={facebookIcon} alt="" className="h-5 w-5 justify-self-center lg:h-6 lg:w-6" /><span>Continue with Facebook</span></span></button>
            </div>
            <p className="mt-6 text-center text-gray-400">Already have an account? <Link to="/auth/login" className="font-medium text-primary hover:underline">Log in</Link></p>
          </form>
        </div>
      </section>
    </main>
    </>
  );
}
