"use client";

import { useState, type FormEvent } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  LoaderCircle,
  Pencil,
  X,
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTenantsQuery, useUpdateTenant, useUpdateTenantStatus } from "@/hooks/use-tenants";
import { useSubscriptionPlansQuery, useSubscriptionsQuery } from "@/hooks/use-subscriptions";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  getSubscriptionTenantId,
  hasCurrentSubscriptionAccess,
} from "@/lib/subscriptions/access";
import { useAuthStore } from "@/store/auth-store";
import type { Subscription, SubscriptionPlan } from "@/types/subscription";
import type { Tenant } from "@/types/tenant";

type TenantFilter = "ALL" | "ACTIVE" | "INACTIVE";
type TenantDraft = {
  name: string;
  contactEmail: string;
  contactPhone: string;
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function getPlanId(plan: SubscriptionPlan | string | undefined) {
  if (typeof plan === "string") return plan;
  return plan?.id ?? plan?._id ?? "";
}

function formatPrice(price: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDate(value?: string) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not set"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function ActiveSubscriptionDetails({
  subscription,
  plans,
}: {
  subscription?: Subscription;
  plans: SubscriptionPlan[];
}) {
  if (!subscription) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
        <CreditCard className="size-3.5 shrink-0" />
        No active subscription
      </div>
    );
  }

  const planId = getPlanId(subscription.planId);
  const plan =
    subscription.plan ??
    plans.find((availablePlan) => getPlanId(availablePlan) === planId);
  const planName = plan?.name ?? "Subscription plan";
  const status = subscription.status?.toUpperCase() ?? "UNKNOWN";

  return (
    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <CreditCard className="size-3.5 text-emerald-700" />
        <span className="text-xs font-bold text-emerald-950">{planName}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
            status === "CANCELLED"
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {status === "CANCELLED" ? "Cancels at period end" : status}
        </span>
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-900/75">
        <CalendarDays className="size-3" />
        {subscription.startDate
          ? `Since ${formatDate(subscription.startDate)}`
          : "Start date not set"}
        {" · "}
        {subscription.endDate
          ? `Renews/ends ${formatDate(subscription.endDate)}`
          : "End date not set"}
      </p>
      <p className="mt-1 text-[10px] text-emerald-900/75">
        {plan
          ? `${formatPrice(plan.price, plan.currency)} · ${plan.billingCycle.toLowerCase()}`
          : "Plan pricing unavailable"}
        {" · "}
        {subscription.autoRenew ? "Auto-renew on" : "Auto-renew off"}
      </p>
    </div>
  );
}

function TenantEditor({
  tenant,
  draft,
  saving,
  onChange,
  onCancel,
  onSubmit,
}: {
  tenant: Tenant;
  draft: TenantDraft;
  saving: boolean;
  onChange: (draft: TenantDraft) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-500">Organization name</span>
        <Input
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          required
          className="h-9 rounded-lg text-xs"
        />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-500">Contact email</span>
        <Input
          type="email"
          value={draft.contactEmail}
          onChange={(event) =>
            onChange({ ...draft, contactEmail: event.target.value })
          }
          className="h-9 rounded-lg text-xs"
        />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] font-semibold text-slate-500">Contact phone</span>
        <Input
          type="tel"
          value={draft.contactPhone}
          onChange={(event) =>
            onChange({ ...draft, contactPhone: event.target.value })
          }
          className="h-9 rounded-lg text-xs"
        />
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={saving} className="rounded-lg">
          {saving && <LoaderCircle className="size-3.5 animate-spin" />}
          Save changes
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg"
        >
          Cancel
        </Button>
      </div>
      <span className="sr-only">Editing {tenant.name}</span>
    </form>
  );
}

export default function TenantManagementPage() {
  const userId = useAuthStore((state) => state.user?.userId);
  const tenantsQuery = useTenantsQuery(true, userId);
  const subscriptionsQuery = useSubscriptionsQuery(userId);
  const plansQuery = useSubscriptionPlansQuery();
  const updateMutation = useUpdateTenant();
  const statusMutation = useUpdateTenantStatus();
  const [filter, setFilter] = useState<TenantFilter>("ALL");
  const [editingId, setEditingId] = useState<string>();
  const [draft, setDraft] = useState<TenantDraft>();
  const [notice, setNotice] = useState("");
  const tenants = tenantsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const plans = plansQuery.data ?? [];
  const activeCount = tenants.filter((tenant) => tenant.isActive).length;
  const inactiveCount = tenants.length - activeCount;
  const visibleTenants = tenants.filter((tenant) => {
    if (filter === "ACTIVE") return tenant.isActive;
    if (filter === "INACTIVE") return !tenant.isActive;
    return true;
  });

  function startEditing(tenant: Tenant) {
    setEditingId(tenant.id);
    setDraft({
      name: tenant.name,
      contactEmail: tenant.contactEmail ?? "",
      contactPhone: tenant.contactPhone ?? "",
    });
    setNotice("");
  }

  async function saveTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId || !draft) return;
    setNotice("");
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        payload: {
          name: draft.name.trim(),
          contactEmail: draft.contactEmail.trim(),
          contactPhone: draft.contactPhone.trim(),
        },
      });
      setEditingId(undefined);
      setDraft(undefined);
      setNotice("Tenant details saved.");
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  }

  async function toggleTenantStatus(tenant: Tenant) {
    setNotice("");
    try {
      await statusMutation.mutateAsync({
        id: tenant.id,
        isActive: !tenant.isActive,
      });
      setNotice(
        `${tenant.name} has been ${tenant.isActive ? "deactivated" : "activated"}.`,
      );
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
      <Breadcrumb items={[{ label: "Tenant management" }]} />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Tenants", value: tenants.length, icon: Building2, color: "text-primary", bg: "bg-blue-50" },
          { label: "Active tenants", value: activeCount, icon: Check, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Inactive tenants", value: inactiveCount, icon: X, color: "text-slate-600", bg: "bg-slate-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <article
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-[#e4ecf2] bg-white p-4 shadow-[0_4px_16px_rgba(20,40,60,0.03)] sm:p-5"
          >
            <span className={`flex size-10 items-center justify-center rounded-xl ${bg} ${color}`}>
              <Icon className="size-4" />
            </span>
            <span>
              <span className="block text-xl font-bold leading-tight text-[#0f172a]">{value}</span>
              <span className="mt-1 block text-xs font-medium text-[#64748b]">{label}</span>
            </span>
          </article>
        ))}
      </section>

      {notice && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
          {notice}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_4px_16px_rgba(20,40,60,0.03)]">
        <div className="flex flex-col gap-4 border-b border-[#edf2f7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-sm font-bold text-[#0f172a]">Tenant workspaces</h2>
            <p className="mt-1 text-xs text-[#64748b]">
              View tenant accounts, active subscription details, update contact details, and manage access.
            </p>
          </div>
          <div
            role="group"
            aria-label="Filter tenants by status"
            className="flex flex-wrap gap-1 rounded-xl border border-[#e4ecf2] bg-white p-1"
          >
            {([
              ["ALL", "All"],
              ["ACTIVE", "Active"],
              ["INACTIVE", "Inactive"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-lg px-3 py-2 text-[10px] font-semibold transition-colors ${
                  filter === value
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tenantsQuery.isPending ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="size-4 animate-spin" />
            Loading tenants…
          </div>
        ) : tenantsQuery.isError ? (
          <div className="px-5 py-14 text-center">
            <p role="alert" className="text-sm font-semibold text-slate-800">
              Tenants couldn’t be loaded
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {getApiErrorMessage(tenantsQuery.error)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void tenantsQuery.refetch()}
              className="mt-4 rounded-lg"
            >
              Try again
            </Button>
          </div>
        ) : visibleTenants.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Building2 className="mx-auto size-7 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {tenants.length === 0 ? "No tenants found" : "No tenants in this view"}
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              {tenants.length === 0
                ? "New workspaces created through tenant signup will appear here."
                : "Choose another status filter to view tenant accounts."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#edf2f7]">
            {visibleTenants.map((tenant) => {
              const isEditing = editingId === tenant.id;
              return (
                <article key={tenant.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      {isEditing && draft ? (
                        <TenantEditor
                          tenant={tenant}
                          draft={draft}
                          saving={updateMutation.isPending}
                          onChange={setDraft}
                          onCancel={() => {
                            setEditingId(undefined);
                            setDraft(undefined);
                          }}
                          onSubmit={(event) => void saveTenant(event)}
                        />
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{tenant.name}</h3>
                            <StatusBadge active={tenant.isActive} />
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {tenant.fullName ? `${tenant.fullName} · ` : ""}
                            {tenant.contactEmail || "No contact email"} · {tenant.contactPhone || "No contact phone"}
                          </p>
                          {subscriptionsQuery.isError ? (
                            <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
                              Subscription details couldn’t be loaded. {getApiErrorMessage(subscriptionsQuery.error)}
                            </p>
                          ) : subscriptionsQuery.isPending ? (
                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
                              <LoaderCircle className="size-3.5 animate-spin" />
                              Loading subscription details…
                            </div>
                          ) : (
                            <>
                              {plansQuery.isError && (
                                <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
                                  Plan pricing couldn’t be loaded. {getApiErrorMessage(plansQuery.error)}
                                </p>
                              )}
                              {plansQuery.isPending ? (
                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500">
                                  <LoaderCircle className="size-3.5 animate-spin" />
                                  Loading plan details…
                                </div>
                              ) : (
                                <ActiveSubscriptionDetails
                                  subscription={subscriptions
                                    .filter(
                                      (subscription) =>
                                        getSubscriptionTenantId(subscription) === tenant.id &&
                                        hasCurrentSubscriptionAccess(subscription),
                                    )
                                    .sort(
                                      (a, b) =>
                                        Number(b.status?.toUpperCase() === "ACTIVE") -
                                        Number(a.status?.toUpperCase() === "ACTIVE"),
                                    )[0]}
                                  plans={plans}
                                />
                              )}
                            </>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={statusMutation.isPending}
                            onClick={() => startEditing(tenant)}
                            className="mt-2 h-8 rounded-lg px-2 text-xs text-primary"
                          >
                            <Pencil className="size-3.5" />
                            Edit details
                          </Button>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={statusMutation.isPending || updateMutation.isPending}
                        onClick={() => void toggleTenantStatus(tenant)}
                        className="h-9 shrink-0 rounded-lg"
                      >
                        {statusMutation.isPending && statusMutation.variables?.id === tenant.id ? (
                          <LoaderCircle className="size-3.5 animate-spin" />
                        ) : null}
                        {tenant.isActive ? "Deactivate tenant" : "Activate tenant"}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
