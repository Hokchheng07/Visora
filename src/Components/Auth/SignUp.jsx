import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router";
import signupPicture from "../../assets/Website/SignUp/SignUp-pic.png";
import signupCrown from "../../assets/Website/SignUp/SignUpCrown.png";
import visoraLogo from "../../assets/Website/VisoraLogo.png";
import googleIcon from "../../assets/Website/google.svg";
import githubIcon from "../../assets/Website/github_light.svg";

const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    phone: z.string().trim().regex(/^\+?[0-9\s()-]{8,}$/, "Enter a valid phone number"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z.literal(true, { error: "Please accept the Terms & Conditions" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const fields = [
  { name: "firstName", label: "First name", placeholder: "Enter your first name", icon: UserIcon },
  { name: "lastName", label: "Last name", placeholder: "Enter your last name", icon: UserIcon },
  { name: "phone", label: "Phone number", placeholder: "+85512345678", icon: PhoneIcon, full: true },
  { name: "email", label: "Email Address", placeholder: "example@gmail.com", icon: EnvelopeIcon, full: true, type: "email" },
  { name: "password", label: "Password", placeholder: "Enter your password", icon: LockClosedIcon, type: "password" },
  { name: "confirmPassword", label: "Confirm Password", placeholder: "Confirm Password", icon: LockClosedIcon, type: "password" },
];

export default function SignUp() {
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  const onSubmit = () => setSubmitted(true);

  return (
    <main className="h-dvh min-h-0 overflow-hidden bg-white font-sans lg:grid lg:grid-cols-2">
      <section className="relative hidden h-full min-h-0 overflow-hidden lg:block">
        <img src={signupPicture} alt="Khmer-inspired woman surrounded by decorative motifs" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/75" />
        <Link to="/" className="absolute left-8 top-8 z-10 sm:left-12 sm:top-10">
          <img src={visoraLogo} alt="Visora" className="h-auto w-40 sm:w-48" />
        </Link>
        <div className="absolute bottom-10 left-8 z-10 max-w-[680px] text-white sm:bottom-14 sm:left-12 lg:left-16 lg:bottom-16">
          <h2 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Begin Your Journey</h2>
          <p className="mt-6 max-w-[620px] text-lg leading-8 sm:text-xl">
            Create an account to start building, sharing, and discovering incredible digital experiences today.
          </p>
        </div>
      </section>

      <section className="min-h-0 overflow-y-auto overflow-x-hidden px-5 py-8 sm:px-10 sm:py-12 lg:flex lg:h-full lg:justify-center lg:px-16 lg:py-16 xl:px-24 xl:py-20">
        <div className="mx-auto w-full max-w-[480px] lg:max-w-[650px]">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <img src={visoraLogo} alt="Visora" className="h-auto w-36" />
          </Link>
          <header className="relative mb-8 max-w-[560px] lg:mb-10">
            <img src={signupCrown} alt="" aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 hidden w-24 rotate-[45deg] lg:block" />
            <h1 className="text-3xl font-normal tracking-tight text-black sm:text-4xl lg:text-5xl">Create an Account</h1>
            <p className="mt-4 max-w-[500px] text-base leading-6 text-gray-500 sm:text-lg lg:mt-8 lg:text-xl lg:leading-7">Join Visora and start designing stunning event backdrops in minutes</p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
              {fields.map(({ name, label, placeholder, icon: Icon, full, type = "text" }) => (
                <label key={name} className={`block ${full ? "lg:col-span-2" : ""}`}>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700 sm:text-base lg:mb-2 lg:text-lg">{label} <span className="text-red-600">*</span></span>
                  <span className="relative block">
                    {(full || type === "password") && <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 lg:left-5 lg:h-6 lg:w-6" />}
                    <input
                      type={type === "password" && ((name === "password" && showPassword) || (name === "confirmPassword" && showConfirmPassword)) ? "text" : type}
                      placeholder={placeholder}
                      className={`h-12 w-full rounded-lg border bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base lg:h-14 ${full || type === "password" ? "pl-12 lg:pl-16" : ""} ${type === "password" ? "pr-12" : ""} ${errors[name] ? "border-red-500" : "border-gray-300"}`}
                      {...register(name)}
                    />
                    {type === "password" && (
                      <button
                        type="button"
                        aria-label={name === "password" ? (showPassword ? "Hide password" : "Show password") : (showConfirmPassword ? "Hide confirm password" : "Show confirm password")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-primary"
                        onClick={() => name === "password" ? setShowPassword((visible) => !visible) : setShowConfirmPassword((visible) => !visible)}
                      >
                        {(name === "password" ? showPassword : showConfirmPassword) ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    )}
                  </span>
                  {errors[name] && <span className="mt-1 block text-xs text-red-600 sm:text-sm">{errors[name].message}</span>}
                </label>
              ))}
            </div>

            <label className="mt-5 flex items-start gap-2 text-sm leading-5 text-gray-600 lg:mt-6">
              <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-primary" {...register("termsAccepted")} />
              <span>I accept the <a href="#terms" className="text-primary hover:underline">Terms &amp; Conditions</a>.</span>
            </label>
            {errors.termsAccepted && <p className="mt-1 text-xs text-red-600 sm:text-sm">{errors.termsAccepted.message}</p>}

            <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-secondary via-[#e9b56b] to-primary text-base font-semibold text-white transition hover:brightness-105 lg:mt-6 lg:h-14 lg:text-xl">
              Sign Up <span aria-hidden="true" className="text-2xl">⟶</span>
            </button>
            {submitted && <p className="mt-3 text-center text-sm text-green-700">Your details are valid and ready to submit.</p>}

            <div className="my-5 flex items-center gap-3 text-base text-gray-400 lg:my-6 lg:gap-4 lg:text-xl"><span className="h-px flex-1 bg-gray-300" />or Sign up with<span className="h-px flex-1 bg-gray-300" /></div>
            <div className="grid gap-3">
              <button type="button" className="flex h-12 items-center justify-center gap-3 rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 lg:h-14 lg:text-lg"><img src={googleIcon} alt="" className="h-5 w-5 lg:h-6 lg:w-6" />Continue with Google</button>
              <button type="button" className="flex h-12 items-center justify-center gap-3 rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 lg:h-14 lg:text-lg"><img src={githubIcon} alt="" className="h-5 w-5 lg:h-6 lg:w-6" />Continue with Github</button>
            </div>
            <p className="mt-6 text-center text-gray-400">Already have an account? <Link to="/auth/login" className="font-medium text-primary hover:underline">Log in</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
}
