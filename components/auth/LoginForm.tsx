"use client";

import { Loader2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import BrandLogo from "@/components/auth/BrandLogo";
import LoginField from "@/components/auth/LoginField";
import { StripesBottomRight } from "@/components/auth/LoginArt";
import LoginBrandPanel from "@/components/auth/LoginBrandPanel";
import PasswordField from "@/components/auth/PasswordField";
import { EMAIL_PATTERN, PRODUCT } from "@/components/auth/login-content";
import { useLogin } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { getPostLoginPath } from "@/lib/auth/post-login-route";
import type { LoginFormValues } from "@/types/auth";

const LINK_CLASS = "font-semibold whitespace-nowrap text-brand-blue hover:underline";

// The sign-in page: a blue brand panel beside an open white form. The `login-look` class is the exemption in
// globals.css that keeps this page out of the app-wide square-corner and blue-submit rules.
export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: "onSubmit", defaultValues: { email: "", password: "" } });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    if (loginMutation.isPending) return;
    try {
      const session = await loginMutation.mutateAsync({ email: values.email.trim(), password: values.password });
      router.replace(getPostLoginPath(session.user.role, window.location.search));
    } catch {
      // The failure is shown below the fields.
    }
  };

  const loginError = loginMutation.error ? getApiErrorMessage(loginMutation.error) : "";

  return (
    <div className="login-look flex min-h-dvh flex-col bg-card text-foreground lg:grid lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />

      <main className="relative isolate flex flex-1 flex-col items-center justify-start overflow-hidden bg-card px-6 pt-7 pb-10 short:pt-4 short:pb-6 lg:justify-center lg:px-14 lg:py-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <StripesBottomRight className="absolute right-0 bottom-0 aspect-[296/244] w-[42%] max-w-[26rem] lg:w-[40%]" />
        </div>

        <div className="animate-in relative w-full max-w-[32rem] duration-500 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none">
          <div className="mb-6 flex justify-center short:mb-4 sm:mb-8 lg:mb-10">
            {/* About 47% of the form width on desktop, as in the design. */}
            <BrandLogo className="[--lw:10rem] short:[--lw:8rem] lg:[--lw:clamp(13.75rem,17vw,20rem)]" />
          </div>

          {/* <h1 id="login-title" className="text-2xl font-semibold tracking-tight  short:text-xl lg:text-4xl mb-3">
            Welcome Back
          </h1> */}
          <p className="mt-1.5 text-center text-sm leading-relaxed text-muted-foreground lg:mt-2 lg:text-lg">
            {/* <span className="lg:hidden">Sign in to your workspace to continue.</span> */}
            <span>Sign in to your <span className="text-brand-blue font-semibold">HASVIK</span> <span className="text-brand-green font-semibold">{PRODUCT.name}</span> workspace.</span>
          </p>

          <form
            aria-labelledby="login-title"
            className="mt-7 space-y-5 short:mt-4 short:space-y-3 lg:mt-9"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            // Password-manager extensions add attributes to the form before React hydrates.
            suppressHydrationWarning
          >
            <LoginField
              label="Email address"
              icon={UserRound}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Enter your email address"
              error={errors.email?.message}
              {...register("email", {
                required: "Enter your email address.",
                pattern: { value: EMAIL_PATTERN, message: "That doesn’t look like an email address. Check it and try again." },
              })}
            />

            <PasswordField
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password", { required: "Enter your password." })}
            />

            {loginError && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3.5 py-2.5 text-sm font-medium text-destructive">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              aria-busy={loginMutation.isPending || undefined}
              className="mt-4 short:mt-2 inline-flex h-14 w-full touch-manipulation items-center justify-center gap-2 bg-brand-green-strong px-5 text-base font-semibold whitespace-nowrap text-white shadow-xs transition-all outline-none select-none hover:bg-brand-green-strong/90 focus-visible:ring-4 focus-visible:ring-brand-blue/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loginMutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-7 short:mt-4 text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link href="/explore-crm" className={LINK_CLASS}>
              Take a tour
            </Link>
            {" · "}
            <Link href="/tenant" className={LINK_CLASS}>
              Create a workspace
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
