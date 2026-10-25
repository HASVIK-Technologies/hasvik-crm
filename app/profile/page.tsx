"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  BadgeCheck,
  Building2,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authQueryKeys } from "@/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { updateUser } from "@/lib/users/api";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/auth";

function roleLabel(role: string) {
  return role.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.userId) throw new Error("Could not identify your user account.");
      return updateUser(user.userId, {
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        ...(password ? { password } : {}),
      });
    },
    onSuccess: (updated) => {
      if (!user) return;
      const name = updated.fullName || fullName.trim();
      const [firstName = "", ...lastNameParts] = name.split(/\s+/);
      const nextUser: AuthUser = {
        ...user,
        fullName: name,
        firstName,
        lastName: lastNameParts.join(" "),
        email: updated.email || email.trim(),
        phoneNumber: updated.phoneNumber ?? phoneNumber.trim(),
      };
      setUser(nextUser);
      queryClient.setQueryData(authQueryKeys.user, nextUser);
      queryClient.setQueryData(authQueryKeys.session, (session: unknown) => {
        if (!session || typeof session !== "object") return session;
        return { ...session, user: nextUser };
      });
      setPassword("");
      setMessage("Your profile has been updated.");
    },
  });

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await updateMutation.mutateAsync();
    } catch {
      // The API interceptor displays the request error.
    }
  }

  const displayName = user?.fullName || user?.email || "Your profile";
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-center gap-4 border-b border-[#e4ecf2] pb-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {displayName}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <BadgeCheck className="size-3.5" />
              {user?.role ? roleLabel(user.role) : "Workspace member"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
              Manage your personal account details and sign-in credentials.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_16px_rgba(20,40,60,0.03)] sm:p-7">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900">Profile details</h3>
            <p className="mt-1 text-xs text-slate-500">
              Keep your contact information current for your team.
            </p>
          </div>

          <form onSubmit={(event) => void submitProfile(event)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="profile-full-name" className="text-xs font-semibold text-slate-700">Full name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="profile-full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" className="h-11 rounded-xl pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="text-xs font-semibold text-slate-700">Email address</label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="h-11 rounded-xl pl-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="text-xs font-semibold text-slate-700">Contact number</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="profile-phone" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} autoComplete="tel" placeholder="Add a contact number" className="h-11 rounded-xl pl-10" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <LockKeyhole className="size-4 text-slate-400" />
                  Change password
                </h4>
                <p className="mt-1 text-xs text-slate-500">Leave blank if you don’t want to change it.</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="profile-password" className="text-xs font-semibold text-slate-700">New password</label>
                <Input id="profile-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" className="h-11 rounded-xl" />
              </div>
            </div>

            {updateMutation.error && (
              <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">
                {getApiErrorMessage(updateMutation.error)}
              </p>
            )}
            {message && (
              <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="size-4" />{message}
              </p>
            )}
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" disabled={updateMutation.isPending} className="h-10 rounded-xl px-4">
                {updateMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save changes
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-[0_4px_16px_rgba(20,40,60,0.03)]">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary"><Building2 className="size-4" /></span>
            <h3 className="mt-4 text-sm font-bold text-slate-900">Workspace access</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your role controls which workspace tools you can access.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="text-xs font-medium text-slate-600">Current role</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-primary">
                {user?.role ? roleLabel(user.role) : "User"}
              </span>
            </div>
          </section>
          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-xs font-bold text-slate-800">Keep your account secure</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Use a unique password and never share your sign-in details with teammates.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
