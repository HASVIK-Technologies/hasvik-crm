"use client";

import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isUsernameValid = username.trim().length > 0;
    const isPasswordValid = password.length > 0;

    setUsernameError(isUsernameValid ? "" : "Username is required");
    setPasswordError(isPasswordValid ? "" : "Password is required");

    if (isUsernameValid && isPasswordValid) {
      window.location.href = "/dashboard";
    }
  }


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8fb] p-3 md:p-4 lg:p-5">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#dff3ee] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full border-[54px] border-[#dceafa] blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-lg border border-[#d8e5ed] bg-white shadow-[0_24px_70px_rgba(20,74,112,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden min-h-[600px] overflow-hidden bg-[#0b4774] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[42px] border-[#2aa781]/30" />
          <div className="absolute -bottom-36 -left-28 h-96 w-96 rounded-full border-[54px] border-[#1d8aca]/25" />

          <div className="relative">
            <Image src="/logo.png" alt="Hasvik" width={224} height={67} priority className="h-auto w-56" />
            <div className="mt-16 max-w-xs">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#8ed9bd]">Business management</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">Keep your business moving forward.</h1>
              <p className="mt-5 text-sm leading-7 text-blue-100/80">One connected workspace for the people, processes, and progress behind your business.</p>
            </div>
          </div>
          <p className="relative text-xs text-blue-100/60">Secure access to your Hasvik workspace</p>
        </section>

        <section className="flex min-h-[600px] items-center justify-center p-7 sm:p-14">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden"><Image src="/logo.png" alt="Hasvik" width={176} height={53} priority className="h-auto w-44" /></div>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#168d6e]">Welcome back</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#123b59]">Sign in to Hasvik</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Enter your details to access your workspace.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-[#23445d]">Username</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                  <Input id="username" name="username" autoComplete="username" placeholder="Enter your username" value={username} onChange={(event) => { setUsername(event.target.value); setUsernameError(""); }} aria-invalid={Boolean(usernameError)} className="h-12 border-slate-200 pl-11 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-[#168d6e] focus-visible:ring-[#168d6e]/20" />
                </div>
                {usernameError && <p className="text-xs text-red-600">{usernameError}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#23445d]">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError(""); }} aria-invalid={Boolean(passwordError)} className="h-12 border-slate-200 pl-11 pr-12 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-[#168d6e] focus-visible:ring-[#168d6e]/20" />
                  <button type="button" title={showPassword ? "Hide password" : "Show password"} aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#168d6e]">
                    {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
              </div>

              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex items-center gap-2 text-slate-500"><input type="checkbox" className="size-4 accent-[#168d6e]" />Remember me</label>
                <button type="button" className="font-medium text-[#0b6e8d] hover:text-[#168d6e]">Forgot password?</button>
              </div>

              <Button type="submit" className="mt-3 h-12 w-full bg-[#0b6e8d] text-base text-white shadow-[0_8px_18px_rgba(11,110,141,0.2)] hover:bg-[#095b74]">Sign in</Button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">Your information is protected with secure authentication.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
