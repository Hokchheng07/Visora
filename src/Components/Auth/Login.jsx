import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router";
import loginStyle from "../../assets/Website/Login/3 Strips 1.png";
import visoraLogo from "../../assets/Website/VisoraLogo.png";
import googleIcon from "../../assets/Website/google.svg";
import githubIcon from "../../assets/Website/github_light.svg";

import loginPic from "../../assets/Website/Login/LoginLogo-pic.png";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const fields = [
  { name: "email", label: "Email Address", placeholder: "example@gmail.com", icon: EnvelopeIcon, type: "email" },
  { name: "password", label: "Password", placeholder: "Enter your password", icon: LockClosedIcon, type: "password" },
];

export default function Login() {
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = () => setSubmitted(true);

  return (
    <main className="h-dvh min-h-0 overflow-hidden bg-white font-sans lg:grid lg:grid-cols-2">
      <section className="relative hidden h-full min-h-0 overflow-hidden lg:block">
        <img src={loginPic} alt="Khmer-inspired woman surrounded by decorative motifs" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/75" />
        <Link to="/" className="absolute left-8 top-8 z-10 sm:left-12 sm:top-10">
          <img src={visoraLogo} alt="Visora" className="h-auto w-40 sm:w-48" />
        </Link>
        <div className="absolute bottom-10 left-8 z-10 max-w-[680px] text-white sm:bottom-14 sm:left-12 lg:left-16 lg:bottom-16">
          <h2 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Unleash your creativity.</h2>
          <p className="mt-6 max-w-[620px] text-lg leading-8 sm:text-xl">
            Join thousands of creators in bulding the next generation digital experiences
          </p>
        </div>
      </section>

      <section className="min-h-0 overflow-y-auto overflow-x-hidden px-5 py-8 sm:px-10 sm:py-12 lg:flex lg:h-full lg:items-center lg:justify-center lg:px-16 lg:py-16 xl:px-24 xl:py-20">
        <div className="mx-auto w-full max-w-[480px]">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <img src={visoraLogo} alt="Visora" className="h-auto w-36" />
          </Link>
          <header className="relative mb-8 max-w-[560px] lg:mb-10">
            <img src={loginStyle} alt="" aria-hidden="true" className="pointer-events-none absolute right-2 -top-10 hidden w-16 rotate-[45deg] lg:block" />
            <h1 className="text-3xl font-normal tracking-tight text-black sm:text-4xl lg:text-5xl">Welcome Back</h1>
            <p className="mt-4 max-w-[500px] text-base leading-6 text-gray-500 sm:text-lg lg:mt-6 lg:text-xl lg:leading-7">Login to continue designing with Visora</p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-4">
              {fields.map(({ name, label, placeholder, icon: Icon, type = "text" }) => (
                <label key={name} className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700 sm:text-base lg:mb-2 lg:text-lg">{label} <span className="text-red-600">*</span></span>
                  <span className="relative block">
                    <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type={type === "password" && showPassword ? "text" : type}
                      placeholder={placeholder}
                      className={`h-12 w-full rounded-lg border bg-white pl-12 pr-12 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-base lg:h-14 ${errors[name] ? "border-red-500" : "border-gray-300"}`}
                      {...register(name)}
                    />
                    {type === "password" && (
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-primary"
                        onClick={() => setShowPassword((visible) => !visible)}
                      >
                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    )}
                  </span>
                  {errors[name] && <span className="mt-1 block text-xs text-red-600 sm:text-sm">{errors[name].message}</span>}
                </label>
              ))}
            </div>

            <div className="mt-3 text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline sm:text-base">Forgot password ?</Link>
            </div>

            <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-secondary via-[#e9b56b] to-primary text-base font-semibold text-white transition hover:brightness-105 lg:mt-6 lg:h-14 lg:text-xl">
              Login <span aria-hidden="true" className="text-2xl">⟶</span>
            </button>
            {submitted && <p className="mt-3 text-center text-sm text-green-700">Your details are valid and ready to submit.</p>}

            <div className="my-5 flex items-center gap-3 text-base text-gray-400 lg:my-6 lg:gap-4 lg:text-xl"><span className="h-px flex-1 bg-gray-300" />or<span className="h-px flex-1 bg-gray-300" /></div>
            <div className="grid gap-3">
              <button type="button" className="flex h-12 items-center justify-center gap-3 rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 lg:h-14 lg:text-lg"><img src={googleIcon} alt="" className="h-5 w-5 lg:h-6 lg:w-6" />Continue with Google</button>
              <button type="button" className="flex h-12 items-center justify-center gap-3 rounded-lg border border-gray-300 text-base text-gray-800 transition hover:bg-gray-50 lg:h-14 lg:text-lg"><img src={githubIcon} alt="" className="h-5 w-5 lg:h-6 lg:w-6" />Continue with Github</button>
            </div>
            <p className="mt-6 text-center text-gray-400">Don't have an account? <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
}
