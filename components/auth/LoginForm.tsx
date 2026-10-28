"use client";

import { BarChart3, CalendarCheck2, Eye, EyeOff, LockKeyhole, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/common/ThemeToggle";
import type { LoginFormValues } from "@/types/auth";
import { clearSessionEnded, sessionEndedStore } from "@/lib/auth/sign-out-reason";

const POINTS = [
  { icon: CalendarCheck2, title: "Never miss a follow-up", text: "Calls, meetings and reminders land in one calm daily list." },
  { icon: BarChart3, title: "See your pipeline at a glance", text: "Drag leads between stages and watch your numbers update." },
  { icon: ShieldCheck, title: "Private and secure", text: "Everyone sees only what they should, and every change is recorded." },
];

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const sessionEnded = useSyncExternalStore(sessionEndedStore.subscribe, sessionEndedStore.get, sessionEndedStore.server);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    if (loginMutation.isPending) return;
    try {
      const session = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });
      clearSessionEnded();
      const role = session.user.role.toUpperCase();
      const returningFromSignup =
        new URLSearchParams(window.location.search).get("welcome") ===
        "subscription";
      router.replace(
        returningFromSignup && role === "ADMIN"
          ? "/subscriptions"
          : "/dashboard",
      );
    } catch {
      // The mutation error is rendered below.
    }
  };

  const loginError = loginMutation.error
    ? getApiErrorMessage(loginMutation.error)
    : "";

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="hero-surface relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-112 rounded-full bg-brand/20 blur-3xl" />

        <div className="relative">
          <span className="inline-block rounded-2xl bg-white px-5 py-3 shadow-lg">
            <Image src="/hasvik-logo.png" alt="HASVIK" width={512} height={171} priority className="h-12 w-auto" />
          </span>
        </div>

        <div className="relative max-w-lg">
          <p className="text-sm font-semibold tracking-[0.18em] text-white/80 uppercase">HASVIK CRM</p>
          <h2 className="mt-3 text-4xl leading-tight font-bold tracking-tight xl:text-5xl">Turn every connection into growth.</h2>
          <ul className="mt-10 space-y-5">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20 backdrop-blur ring-inset"><point.icon className="size-5" aria-hidden /></span>
                <span>
                  <span className="block font-semibold">{point.title}</span>
                  <span className="block text-sm leading-relaxed text-white/85">{point.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-sm text-white/80"><Smartphone className="size-4" aria-hidden /> Works on your phone, tablet and computer.</p>
      </aside>

      <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-110">
          <div className="mb-8 flex justify-center lg:hidden">
            <span className="rounded-2xl bg-white px-5 py-3 shadow-pop ring-1 ring-line">
              <Image src="/hasvik-logo.png" alt="HASVIK" width={512} height={171} priority className="h-12 w-auto" />
            </span>
          </div>
          <div className="fade-up rounded-3xl border border-line bg-surface p-7 shadow-float sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">Sign in to your HASVIK CRM workspace.</p>

            {sessionEnded && !loginError && (
              <p role="status" className="mt-5 rounded-xl bg-info-soft px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">You were signed out.</span> This happens when a session runs out or your account signs in on another device. Sign in again to carry on.
              </p>
            )}

            <form className="mt-7 space-y-5" method="post" onSubmit={handleSubmit(onSubmit)} noValidate suppressHydrationWarning>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-ink">Email address</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" aria-hidden />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="pl-11"
                    {...register("email", {
                      required: "Enter your email address.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "That doesn’t look like an email address. Check it and try again.",
                      },
                    })}
                  />
                </div>
                {errors.email && <p id="email-error" role="alert" className="text-xs font-medium text-bad">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted" aria-hidden />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="pr-12 pl-11"
                    {...register("password", { required: "Enter your password." })}
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-muted transition-colors hover:text-brand-strong sm:size-10"
                  >
                    {showPassword ? <EyeOff className="size-4.5" aria-hidden /> : <Eye className="size-4.5" aria-hidden />}
                  </button>
                </div>
                {errors.password && <p id="password-error" role="alert" className="text-xs font-medium text-bad">{errors.password.message}</p>}
              </div>

              {loginError && (
                <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm font-medium text-bad">{loginError}</p>
              )}

              <Button type="submit" size="lg" loading={loginMutation.isPending} className="w-full">
                {loginMutation.isPending ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            New to HASVIK?{" "}
            <Link href="/explore-crm" className="font-semibold text-brand-strong hover:underline">Explore the CRM</Link>
            {" · "}
            <Link href="/tenant" className="font-semibold text-brand-strong hover:underline">Create a workspace</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
