"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, CircleHelp, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTenant } from "@/hooks/use-tenants";
import { getApiErrorMessage } from "@/lib/api/api-error";

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
      setMessage("Your workspace has been created. You can now sign in.");
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-surface-2 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link href="/explore-crm" aria-label="Back to Hasvik CRM">
            <Image
              src="/logo.png"
              alt="Hasvik"
              width={140}
              height={42}
              priority
              className="w-32"
            />
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-brand-strong hover:text-brand-strong"
          >
            Already have an account? Sign in
          </Link>
        </header>

        <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-10">
          <Link
            href="/explore-crm"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-brand-strong"
          >
            <ArrowLeft className="size-3.5" />
            Back to explore
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
              <Building2 className="size-5" />
            </span>
            <div>
              <span className="inline-flex rounded-tag bg-ok-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-ok">
                Secure registration
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Create your workspace
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">
                Enter your organization and admin details to get started.
              </p>
            </div>
          </div>

          <div
            className="mt-7 flex items-start gap-3 rounded-xl border border-brand-soft bg-brand-soft p-4"
          >
            <CircleHelp className="mt-0.5 size-4 shrink-0 text-brand-strong" />
            <p className="text-xs leading-5 text-brand-strong">
              Create a workspace and its administrator account. Your password
              is sent securely to Hasvik to create the account.
            </p>
          </div>

          <form
            onSubmit={(event) => void submitSignup(event)}
            onChange={() => {
              setMessage("");
              setSignupComplete(false);
            }}
            className="mt-7 space-y-5"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="organization-name"
                className="text-xs font-semibold text-ink-soft"
              >
                Organization Name <span className="text-bad">*</span>
              </label>
              <Input
                id="organization-name"
                name="organizationName"
                autoComplete="organization"
                required
                placeholder="e.g. Acme Industries"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="full-name"
                className="text-xs font-semibold text-ink-soft"
              >
                Full Name <span className="text-bad">*</span>
              </label>
              <Input
                id="full-name"
                name="fullName"
                autoComplete="name"
                required
                placeholder="Your full name"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-number"
                className="text-xs font-semibold text-ink-soft"
              >
                Contact Number <span className="text-bad">*</span>
              </label>
              <Input
                id="contact-number"
                name="contactNumber"
                type="tel"
                autoComplete="tel"
                required
                placeholder="+91 98765 43210"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email-id"
                className="text-xs font-semibold text-ink-soft"
              >
                Email ID <span className="text-bad">*</span>
              </label>
              <Input
                id="email-id"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-ink-soft"
              >
                Password <span className="text-bad">*</span>
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
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-strong"
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
                className="text-xs font-semibold text-ink-soft"
              >
                Confirm Password <span className="text-bad">*</span>
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
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand-strong"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-bad" role="alert">
                  Passwords do not match.
                </p>
              )}
            </div>

            {message && (
              <p
                className={`rounded-xl border p-3 text-xs leading-5 ${
                  signupComplete
                    ? "border-ok/30 bg-ok-soft text-ok"
                    : "border-bad/30 bg-bad-soft text-bad"
                }`}
                role={signupComplete ? "status" : "alert"}
              >
                {message}
              </p>
            )}
            {signupComplete && (
              <Link
                href="/?welcome=subscription"
                className="block rounded-xl border border-brand/40 bg-brand-soft px-4 py-3 text-center text-xs font-semibold text-brand-strong transition hover:bg-brand-soft"
              >
                Sign in and choose a subscription plan
              </Link>
            )}

            <Button
              type="submit"
              disabled={createTenantMutation.isPending}
              className="h-12 w-full rounded-xl text-sm font-semibold"
            >
              {createTenantMutation.isPending
                ? "Creating workspace…"
                : "Create workspace"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted">
            Already registered?{" "}
            <Link href="/" className="font-semibold text-brand-strong hover:underline">
              Sign in to your workspace
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
