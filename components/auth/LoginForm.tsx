"use client";

import {
  BarChart3,
  CalendarCheck2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useLogin } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { LoginFormValues } from "@/types/auth";

const POINTS = [
  { icon: CalendarCheck2, title: "Never miss a follow-up", text: "Calls, meetings and reminders land in one calm daily list." },
  { icon: BarChart3, title: "See your pipeline at a glance", text: "Drag leads between stages and watch your numbers update." },
  { icon: ShieldCheck, title: "Private and secure", text: "Everyone sees only what they should, and every change is recorded." },
];

// The product this sign-in page belongs to. Other HASVIK apps (e.g. an HR portal) reuse this layout with their own
// name, so people can tell at a glance, even on a phone, which app they are signing in to.
const PRODUCT = { name: "LEADS", tagline: "Your sales pipeline and follow-ups, in one place." };

/** Brand lockup on the blue: the H icon on a white tile, then HASVIK over the product name. Same on phone and desktop. */
function ProductLockup() {
  return (
    <div className="inline-flex items-center gap-3.5 text-white">
      <span className="grid size-14 shrink-0 place-items-center rounded-[1.05rem] bg-white shadow-[0_10px_24px_rgba(4,40,74,0.35)]">
        <Image src="/hasvik-icon.png" alt="" width={512} height={512} priority className="size-11" />
      </span>
      <span className="text-left leading-none">
        <span className="block text-sm font-semibold tracking-[0.28em] text-white/90">HASVIK</span>
        <span className="mt-1.5 block text-[2rem] font-extrabold tracking-[0.06em]">{PRODUCT.name}</span>
      </span>
    </div>
  );
}

// The sign-in page's own look: rounded card, blue gradient panel, light canvas. The `login-look` class is the
// exemption in globals.css that lets its inputs and buttons stay rounded while the rest of the app stays square.
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
    if (loginMutation.isPending) return;
    try {
      const session = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      });
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

  const fieldClass =
    "h-11 rounded-[1.05rem] border-[#e1e9f2] bg-white text-base text-[#0a1f33] shadow-[0_1px_2px_rgba(10,31,51,0.05)] placeholder:text-[#5a6d83] hover:border-[#5a6d83] focus-visible:border-[#0669b9] focus-visible:ring-4 focus-visible:ring-[rgba(8,169,230,0.4)] sm:h-10 sm:text-sm";

  return (
    <div className="login-look relative isolate grid min-h-dvh overflow-hidden bg-[linear-gradient(165deg,#043a6b_0%,#0767b9_55%,#0876d1_100%)] text-[#0a1f33] lg:grid-cols-[1.05fr_1fr] lg:bg-[#f0f5fa] lg:bg-[radial-gradient(900px_420px_at_88%_-140px,rgb(8_169_230/0.12),transparent_70%),radial-gradient(620px_340px_at_-8%_0,rgb(32_184_63/0.06),transparent_70%)] lg:bg-fixed">
      {/* Phone-only glows: cyan at the top, the logo's green swoosh at the bottom. */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-[#08a9e6]/30 blur-3xl lg:hidden" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 h-80 w-[36rem] -rotate-6 rounded-full bg-[#63d329]/25 blur-3xl lg:hidden" />
      <aside className="relative isolate hidden overflow-hidden bg-[linear-gradient(125deg,#054a86_0%,#0876d1_55%,#08a9e6_118%)] p-12 text-white after:pointer-events-none after:absolute after:right-[-10%] after:bottom-[-45%] after:left-[30%] after:-z-10 after:h-[70%] after:-rotate-6 after:bg-[radial-gradient(60%_100%_at_70%_100%,rgb(99_211_41/0.38),transparent_70%)] after:content-[''] lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-[28rem] rounded-full bg-[#08a9e6]/20 blur-3xl" />

        <div className="relative">
          <ProductLockup />
        </div>

        <div className="relative max-w-lg">
          <h2 className="text-4xl leading-tight font-bold tracking-tight xl:text-5xl">Turn every connection into growth.</h2>
          <ul className="mt-10 space-y-5">
            {POINTS.map((point) => (
              <li key={point.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-[1.05rem] bg-white/[0.12] ring-1 ring-white/20 backdrop-blur ring-inset">
                  <point.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{point.title}</span>
                  <span className="block text-sm leading-relaxed text-white/85">{point.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-sm text-white/80">
          <Smartphone className="size-4" aria-hidden /> Works on your phone, tablet and computer.
        </p>
      </aside>

      <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-[27.5rem]">
          <div className="mb-7 text-center text-white lg:hidden">
            <ProductLockup />
            <p className="mt-4 text-sm text-white">{PRODUCT.tagline}</p>
          </div>
          <div className="animate-in rounded-[1.65rem] border border-transparent bg-white p-7 shadow-[0_24px_60px_rgba(4,40,74,0.4)] duration-500 lg:border-[#e1e9f2] lg:shadow-[0_20px_56px_rgba(10,31,51,0.14)] fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5a6d83]">Sign in to your workspace to continue.</p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate suppressHydrationWarning>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium">Email address</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#5a6d83]" aria-hidden />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`${fieldClass} pl-11`}
                    {...register("email", {
                      required: "Enter your email address.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "That doesn’t look like an email address. Check it and try again.",
                      },
                    })}
                  />
                </div>
                {errors.email && <p id="email-error" role="alert" className="text-xs font-medium text-[#b91c1c]">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#5a6d83]" aria-hidden />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`${fieldClass} pr-12 pl-11`}
                    {...register("password", { required: "Enter your password." })}
                  />
                  <button
                    type="button"
                    suppressHydrationWarning
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-[1.05rem] text-[#5a6d83] transition-colors hover:text-[#0669b9] sm:size-10"
                  >
                    {showPassword ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
                  </button>
                </div>
                {errors.password && <p id="password-error" role="alert" className="text-xs font-medium text-[#b91c1c]">{errors.password.message}</p>}
              </div>

              {loginError && (
                <p role="alert" className="rounded-[1.05rem] bg-[#fee2e2] px-3.5 py-2.5 text-sm font-medium text-[#b91c1c]">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                aria-busy={loginMutation.isPending || undefined}
                className="inline-flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-[1.05rem] bg-[#0876d1] px-5 text-base font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(10,31,51,0.05)] transition-all outline-none select-none hover:bg-[#0665b5] focus-visible:ring-4 focus-visible:ring-[rgba(8,169,230,0.4)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
              >
                {loginMutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {loginMutation.isPending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white lg:text-[#5a6d83]">
            New here?{" "}
            <Link href="/explore-crm" className="font-semibold whitespace-nowrap text-white underline underline-offset-2 lg:text-[#0669b9] lg:no-underline lg:hover:underline">Take a tour</Link>
            {" · "}
            <Link href="/tenant" className="font-semibold whitespace-nowrap text-white underline underline-offset-2 lg:text-[#0669b9] lg:no-underline lg:hover:underline">Create a workspace</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
