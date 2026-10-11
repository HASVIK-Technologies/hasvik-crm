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
    <main className="min-h-screen bg-[#f8fbff] px-4 py-8 sm:px-6 sm:py-12">
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
            className="text-sm font-semibold text-primary hover:text-blue-800"
          >
            Already have an account? Sign in
          </Link>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-35px_rgba(15,69,115,0.25)] sm:p-10">
          <Link
            href="/explore-crm"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Back to explore
          </Link>

          <div className="mt-7 flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                Secure registration
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Create your workspace
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your organization and admin details to get started.
              </p>
            </div>
          </div>

          <div
            className="mt-7 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4"
          >
            <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-5 text-blue-950">
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
                className="text-xs font-semibold text-slate-700"
              >
                Organization Name <span className="text-red-600">*</span>
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
                className="text-xs font-semibold text-slate-700"
              >
                Full Name <span className="text-red-600">*</span>
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
                className="text-xs font-semibold text-slate-700"
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
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email-id"
                className="text-xs font-semibold text-slate-700"
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
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700"
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
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((show) => !show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
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
                className="text-xs font-semibold text-slate-700"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
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
                className={`rounded-xl border p-3 text-xs leading-5 ${
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
              <Link
                href="/?welcome=subscription"
                className="block rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-xs font-semibold text-primary transition hover:bg-blue-100"
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

          <p className="mt-5 text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link href="/" className="font-semibold text-primary hover:underline">
              Sign in to your workspace
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
