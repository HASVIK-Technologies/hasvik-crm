"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/settings/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenantQuery, useUpdateTenant } from "@/hooks/use-tenants";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/api-error";
import { useAuthStore } from "@/store/auth-store";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Company details for the signed-in admin's workspace (PATCH /tenants/{id}). */
export default function CompanySettings() {
  const tenantId = useAuthStore((state) => state.user?.tenantId);
  const tenant = useTenantQuery(tenantId, Boolean(tenantId));

  if (!tenantId) return <p className="text-sm text-muted">Your account isn&apos;t linked to a workspace, so there are no company details to edit.</p>;
  if (tenant.isPending) return <div role="status" aria-label="Loading company details" className="space-y-3"><div className="skeleton h-16" /><div className="skeleton h-16" /></div>;
  if (tenant.isError) return <p role="alert" className="rounded-xl bg-warn-soft p-4 text-sm text-warn">We couldn&apos;t load the company details. Refresh the page to try again.</p>;

  return (
    <CompanyForm
      key={tenant.data?.id}
      tenantId={tenantId}
      initial={{ name: tenant.data?.name ?? "", email: tenant.data?.contactEmail ?? "", phone: tenant.data?.contactPhone ?? "" }}
    />
  );
}

function CompanyForm({ tenantId, initial }: { tenantId: string; initial: { name: string; email: string; phone: string } }) {
  const update = useUpdateTenant();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter the company name.";
    if (email.trim() && !EMAIL.test(email.trim())) next.contactEmail = "Enter a valid email address, like hello@company.com.";
    setErrors(next);
    if (Object.keys(next).length || update.isPending) return;
    update.mutate(
      { id: tenantId, payload: { name: name.trim(), contactEmail: email.trim() || undefined, contactPhone: phone.trim() || undefined } },
      {
        onSuccess: () => setErrors({}),
        onError: (error) => {
          const fields = getApiFieldErrors(error, ["name", "contactEmail", "contactPhone"]);
          setErrors(Object.keys(fields).length ? fields : { _form: getApiErrorMessage(error) });
        },
      },
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-ink">Company details</h3>
        <p className="mt-1 text-sm text-muted">Shown to your team and used for your workspace&apos;s subscription.</p>
      </div>
      <Field label="Company name" error={errors.name} required>{(id) => <Input id={id} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />}</Field>
      <Field label="Contact email" error={errors.contactEmail}>{(id) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.contactEmail} />}</Field>
      <Field label="Contact phone" error={errors.contactPhone}>{(id) => <Input id={id} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.contactPhone} />}</Field>
      {errors._form && <p role="alert" className="rounded-xl bg-bad-soft px-3.5 py-2.5 text-sm font-medium text-bad">{errors._form}</p>}
      <div className="flex justify-end"><Button type="submit" loading={update.isPending}>Save changes</Button></div>
    </form>
  );
}
