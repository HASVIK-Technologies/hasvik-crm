"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Field } from "@/components/settings/Field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authQueryKeys } from "@/hooks/use-auth";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/api-error";
import { changedFields } from "@/lib/forms/changed-fields";
import { updateUser } from "@/lib/users/api";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: async () => {
      if (!user?.userId) throw new Error("We couldn't tell which account is yours. Sign in again and retry.");
      const payload = changedFields(
        { fullName: fullName.trim(), email: email.trim(), phoneNumber: phone.trim() },
        { fullName: (user.fullName ?? "").trim(), email: (user.email ?? "").trim(), phoneNumber: (user.phoneNumber ?? "").trim() },
      );
      if (!Object.keys(payload).length) return null;
      return updateUser(user.userId, payload);
    },
    onSuccess: (updated) => {
      if (!user || !updated) { toast.message("Nothing to save: no details were changed."); return; }
      const name = updated.fullName || fullName.trim();
      const [firstName = "", ...rest] = name.split(/\s+/);
      const next: AuthUser = { ...user, fullName: name, firstName, lastName: rest.join(" "), email: updated.email || email.trim(), phoneNumber: updated.phoneNumber ?? phone.trim() };
      setUser(next);
      queryClient.setQueryData(authQueryKeys.user, next);
      queryClient.setQueryData(authQueryKeys.session, (session: unknown) => (session && typeof session === "object" ? { ...session, user: next } : session));
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Your profile was saved.");
    },
    onError: (error) => {
      const fields = getApiFieldErrors(error, ["fullName", "email", "phoneNumber"]);
      setErrors(Object.keys(fields).length ? fields : { _form: getApiErrorMessage(error) });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Enter your name.";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address, like name@company.com.";
    setErrors(next);
    if (Object.keys(next).length || save.isPending) return;
    save.mutate();
  }

  const initials = (user?.fullName || user?.email || "?").split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="size-16 bg-btn"><AvatarFallback className="bg-btn text-xl font-bold text-white">{initials}</AvatarFallback></Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink">{user?.fullName || user?.email}</p>
          <p className="text-sm text-muted capitalize">{(user?.role ?? "").toLowerCase().replaceAll("_", " ")}</p>
        </div>
      </div>
      <Field label="Full name" error={errors.fullName} required>{(id) => <Input id={id} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" aria-invalid={!!errors.fullName} />}</Field>
      <Field label="Email address" error={errors.email} required>{(id) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />}</Field>
      <Field label="Contact number" error={errors.phoneNumber} hint="Optional. Your team can see it on your profile.">{(id) => <Input id={id} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" aria-invalid={!!errors.phoneNumber} />}</Field>
      {errors._form && <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm font-medium text-bad">{errors._form}</p>}
      <div className="flex justify-end"><Button type="submit" loading={save.isPending}>Save changes</Button></div>
    </form>
  );
}
