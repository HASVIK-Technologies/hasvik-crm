"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTenant } from "@/hooks/use-tenants";
import { getApiErrorMessage } from "@/lib/api/api-error";
import BrandLogo from "@/components/auth/BrandLogo";
import LoginBrandPanel from "@/components/auth/LoginBrandPanel";
import { StripesBottomRight } from "@/components/auth/LoginArt";

export default function TenantSignupPage() {
  const createTenantMutation = useCreateTenant();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [signupComplete, setSignupComplete] = useState(false);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  async function submitSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSignupComplete(false);
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await createTenantMutation.mutateAsync({
        name: String(formData.get("organizationName") ?? "").trim(),
        fullName: String(formData.get("fullName") ?? "").trim(),
        contactPhone: String(formData.get("contactNumber") ?? "").trim(),
        contactEmail: String(formData.get("email") ?? "").trim(),
        password,
      });
      form.reset();
      setPassword("");
      setConfirmPassword("");
      setSignupComplete(true);
      setMessage("Your workspace has been created. Sign in to activate your Free plan.");
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <div className="login-look flex min-h-dvh flex-col bg-card text-foreground lg:grid lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />

      <main className="relative isolate flex flex-1 flex-col items-center justify-start overflow-hidden bg-card px-5 pt-6 pb-9 sm:px-7 lg:justify-center lg:px-10 lg:py-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <StripesBottomRight className="absolute right-0 bottom-0 aspect-[296/244] w-[38%] max-w-[22rem] lg:w-[40%]" />
        </div>

        <div className="animate-in relative w-full max-w-[38rem] duration-500 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none">
          <div className="mb-5 flex justify-center sm:mb-6 lg:mb-7">
            <BrandLogo className="[--lw:8.5rem] sm:[--lw:9rem] lg:[--lw:10rem]" />
          </div>

          <div className="mb-5 text-center lg:mb-6">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create your workspace</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Enter your organization and admin details to get started.</p>
          </div>

          <form
            onSubmit={(event) => void submitSignup(event)}
            onChange={() => {
              setMessage("");
              setSignupComplete(false);
            }}
            className="grid gap-x-4 gap-y-4 sm:grid-cols-2"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="organization-name"
              className="text-xs font-semibold text-foreground/80"
              >
                Organization Name <span className="text-red-600">*</span>
              </label>
              <Input
                id="organization-name"
                name="organizationName"
                autoComplete="organization"
                required
                placeholder="e.g. Acme Industries"
                className="h-10 rounded-none border-input bg-card text-base shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:h-12"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="full-name"
              className="text-xs font-semibold text-foreground/80"
              >
                Full Name <span className="text-red-600">*</span>
              </label>
              <Input
                id="full-name"
                name="fullName"
                autoComplete="name"
                required
                placeholder="Your full name"
                className="h-10 rounded-none border-input bg-card text-base shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:h-12"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-number"
              className="text-xs font-semibold text-foreground/80"
              >
                Contact Number <span className="text-red-600">*</span>
              </label>
              <Input
                id="contact-number"
                name="contactNumber"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+91 98765 43210"
                className="h-10 rounded-none border-input bg-card text-base shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:h-12"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email-id"
              className="text-xs font-semibold text-foreground/80"
              >
                Email ID <span className="text-red-600">*</span>
              </label>
              <Input
                id="email-id"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="h-10 rounded-none border-input bg-card text-base shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:h-12"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
              className="text-xs font-semibold text-foreground/80"
              >
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage("");
                  }}
                  placeholder="At least 8 characters"
                  className="h-10 rounded-none border-input bg-card pr-12 text-base shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:h-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center text-muted-foreground hover:text-brand-blue sm:size-14"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
              className="text-xs font-semibold text-foreground/80"
              >
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setMessage("");
                  }}
                  aria-invalid={!passwordsMatch}
                  placeholder="Re-enter your password"
                  className="h-10 rounded-none border-input bg-card pr-12 text-base shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:h-12"
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  className="absolute right-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center text-muted-foreground hover:text-brand-blue sm:size-14"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-red-600" role="alert">
                  Passwords do not match.
                </p>
              )}
            </div>

            {message && (
              <p
                className={`rounded-lg border p-3 text-xs leading-5 sm:col-span-2 ${
                  signupComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
                role={signupComplete ? "status" : "alert"}
              >
                {message}
              </p>
            )}
            {signupComplete && (
              <div className="space-y-2 sm:col-span-2">
                <p className="text-center text-xs text-muted-foreground">
                  Your workspace is ready. Sign in to activate your Free plan.
                </p>
                <Button asChild className="h-12 w-full bg-brand-green-strong text-sm font-semibold text-white hover:bg-brand-green-strong/90 sm:col-span-2">
                  <Link href="/?welcome=free">Continue to sign in</Link>
                </Button>
              </div>
            )}

            {!signupComplete && <Button
              type="submit"
              disabled={createTenantMutation.isPending}
              className="h-14 w-full bg-brand-green-strong text-base font-semibold text-white hover:bg-brand-green-strong/90 focus-visible:ring-4 focus-visible:ring-brand-blue/25 sm:col-span-2"
            >
              {createTenantMutation.isPending
                ? "Creating workspace…"
                : "Create workspace"}
            </Button>}
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link href="/" className="font-semibold text-brand-blue hover:underline">
              Sign in to your workspace
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
