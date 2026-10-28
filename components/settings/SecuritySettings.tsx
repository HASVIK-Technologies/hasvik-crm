"use client";

import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Field } from "@/components/settings/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/use-auth";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/api-error";
import { updateUser } from "@/lib/users/api";
import { useAuthStore } from "@/store/auth-store";

export default function SecuritySettings() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const change = useMutation({
    mutationFn: () => {
      if (!user?.userId) throw new Error("We couldn't tell which account is yours. Sign in again and retry.");
      return updateUser(user.userId, { password });
    },
    onSuccess: () => { setPassword(""); setConfirm(""); setErrors({}); toast.success("Your password was changed."); },
    onError: (error) => {
      const fields = getApiFieldErrors(error, ["password"]);
      setErrors(Object.keys(fields).length ? fields : { _form: getApiErrorMessage(error) });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "The two passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length || change.isPending) return;
    change.mutate();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submit} noValidate className="space-y-5">
        <div>
          <h3 className="text-base font-bold text-ink">Change password</h3>
          <p className="mt-1 text-sm text-muted">Choose something you don&apos;t use anywhere else, and never share it with teammates.</p>
        </div>
        <Field label="New password" error={errors.password} required>{(id) => <Input id={id} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-invalid={!!errors.password} />}</Field>
        <Field label="Confirm new password" error={errors.confirm} required>{(id) => <Input id={id} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" aria-invalid={!!errors.confirm} />}</Field>
        {errors._form && <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm font-medium text-bad">{errors._form}</p>}
        <div className="flex justify-end"><Button type="submit" loading={change.isPending}>Change password</Button></div>
      </form>

      <div className="space-y-3 border-t border-line pt-6">
        <h3 className="text-base font-bold text-ink">Sign out</h3>
        <p className="text-sm text-muted">Ends your session on this device.</p>
        <Button variant="outline" loading={logout.isPending} onClick={async () => { try { await logout.mutateAsync(); } finally { router.replace("/"); } }}>
          <LogOut className="size-4" aria-hidden />Sign out
        </Button>
      </div>
    </div>
  );
}
