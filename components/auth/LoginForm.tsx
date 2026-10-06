"use client";

import {
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import PrimaryButton from "@/components/common/PrimaryButton";
import { Input } from "@/components/ui/input";
import type { LoginFormValues } from "@/types/auth";

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });
      router.replace("/businesses");
    } catch {
      // The mutation error is rendered below.
    }
  };

  const loginError = loginMutation.error
    ? getApiErrorMessage(loginMutation.error)
    : "";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 -top-40 size-[28rem] rounded-full bg-brand-cyan/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-40 size-[32rem] rounded-full bg-brand-growth/10 blur-3xl" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_32px_90px_-36px_rgba(8,62,105,0.28)] lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#f0f8ff] via-white to-[#f2fbf4] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border-[40px] border-brand-cyan/10" />
          <div className="pointer-events-none absolute -bottom-36 -left-28 size-96 rounded-full border-[52px] border-brand-growth/10" />
          <div className="relative">
            <div className="inline-flex rounded-2xl border border-slate-100 bg-white px-5 py-3">
              <Image
                src="/logo.png"
                alt="Hasvik"
                width={224}
                height={67}
                priority
                style={{ height: "auto" }}
                className="w-52"
              />
            </div>
            <div className="mt-20 max-w-lg">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-blue/10 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <span className="size-2 rounded-full bg-brand-growth" />
                Business, moving forward
              </p>
              <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-slate-900 xl:text-5xl">
                Turn every{" "}
                <span className="text-primary">connection</span> into
                meaningful growth.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-600">
                Keep your business relationships, conversations, and next steps
                moving in one clear workspace.
              </p>
            </div>
          </div>
          <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green-strong">
                <ArrowUpRight className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Built for better follow-through
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your leads and follow-ups, together
                </p>
              </div>
            </div>
            <div className="hidden size-2.5 rounded-full bg-brand-growth sm:block" />
          </div>
        </section>

        <section className="flex min-h-[620px] items-center justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-16">
          <div className="w-full max-w-sm">
            <div className="mb-12 lg:hidden">
              <div className="inline-flex rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Hasvik"
                  width={176}
                  height={53}
                  priority
                  style={{ height: "auto" }}
                  className="w-40"
                />
              </div>
            </div>
            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold text-brand-green-strong">Welcome back</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Sign in to Hasvik
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your details to access your workspace.
              </p>
            </div>
            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              suppressHydrationWarning
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                    className="h-12 rounded-xl border-slate-200 pl-11 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)}
                    className="h-12 rounded-xl border-slate-200 pl-11 pr-12 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20"
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[18px]" />
                    ) : (
                      <Eye className="size-[18px]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
              {/* <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    suppressHydrationWarning
                    className="size-4 accent-primary"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  suppressHydrationWarning
                  className="font-medium text-primary transition-colors hover:text-brand-cyan"
                >
                  Forgot password?
                </button>
              </div> */}
              {loginError && (
                <p className="text-sm text-red-600" role="alert">
                  {loginError}
                </p>
              )}
              <PrimaryButton
                type="submit"
                disabled={loginMutation.isPending}
                className="mt-3 h-12 w-full rounded-xl text-base font-semibold shadow-[0_8px_18px_-8px_rgba(8,118,209,0.65)]"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </PrimaryButton>
            </form>
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck className="size-4 text-brand-green-strong" />
              Your information is protected with secure authentication.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}