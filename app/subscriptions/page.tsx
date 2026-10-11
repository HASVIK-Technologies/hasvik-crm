"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CircleHelp,
  CreditCard,
  FileText,
  Filter,
  Gem,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import { useAuthStore } from "@/store/auth-store";
import {
  useCreateSubscription,
  useRenewSubscription,
  useSubscriptionPlansQuery,
  useSubscriptionsQuery,
  useUpdateSubscriptionStatus,
} from "@/hooks/use-subscriptions";
import { useTenantsQuery } from "@/hooks/use-tenants";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  getSubscriptionTenantId,
  hasCurrentSubscriptionAccess,
} from "@/lib/subscriptions/access";
import type {
  BillingCycle,
  Subscription,
  SubscriptionPlan,
  SubscriptionReference,
} from "@/types/subscription";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Actions from "@/components/common/Actions";
import Breadcrumb from "@/components/common/Breadcrumb";
import ListPageLayout from "@/components/layout/ListPageLayout";

const cycleLabels: Record<BillingCycle, string> = {
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  LIFETIME: "Lifetime",
};

type SubscriptionFilter =
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "CANCELLED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED";

function getPlanId(plan: SubscriptionPlan) {
  return plan._id ?? plan.id ?? "";
}

function getRecordId(record: { _id?: string; id?: string }) {
  return record.id ?? record._id ?? "";
}

function getReferenceId(value: string | SubscriptionReference | undefined) {
  if (typeof value === "string") return value;
  return value?.id ?? value?._id ?? "";
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

function getLimit(value: number | undefined) {
  if (value === undefined) return "—";
  return value < 0 ? "Unlimited" : value.toLocaleString("en-IN");
}

function normalizeStatus(status?: string) {
  return status?.toUpperCase() ?? "UNKNOWN";
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const style =
    normalized === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "EXPIRED"
        ? "bg-rose-50 text-rose-700"
        : normalized === "REJECTED"
          ? "bg-rose-50 text-rose-700"
          : normalized === "SUSPENDED"
            ? "bg-slate-100 text-slate-700"
            : normalized === "PENDING" || normalized === "CANCELLED"
          ? "bg-amber-50 text-amber-800"
          : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${style}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function LimitLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value?: number;
}) {
  if (value === undefined) return null;
  return (
    <li className="flex items-center justify-between gap-3 text-xs text-[#475569]">
      <span className="flex items-center gap-2">
        <Icon className="size-3.5 text-[#94a3b8]" />
        {label}
      </span>
      <span className="font-semibold text-[#334155]">{getLimit(value)}</span>
    </li>
  );
}

function PlanCard({
  plan,
  featured,
  disabled,
  onChoose,
}: {
  plan: SubscriptionPlan;
  featured: boolean;
  disabled: boolean;
  onChoose: (plan: SubscriptionPlan) => void;
}) {
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_8px_28px_rgba(20,40,60,0.04)] ${
        featured
          ? "border-brand-blue/35 ring-1 ring-brand-blue/10"
          : "border-[#e4ecf2]"
      }`}
    >
      {featured && (
        <div className="flex items-center gap-1.5 border-b border-blue-100 bg-blue-50 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Popular choice
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <Gem className="size-3" aria-hidden="true" />
            {cycleLabels[plan.billingCycle] ?? plan.billingCycle}
          </span>
          <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500">
            {plan.code}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-[#0f172a]">{plan.name}</h3>
        <p className="mt-1 min-h-10 text-xs leading-5 text-[#64748b]">
          {plan.description || "A flexible plan for your workspace."}
        </p>
        <div className="mb-5 mt-4 rounded-xl bg-[#f8fafc] px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-xs text-[#64748b]">
              {plan.billingCycle === "MONTHLY"
                ? "/ month"
                : plan.billingCycle === "YEARLY"
                  ? "/ year"
                  : "one time"}
            </span>
          </div>
        </div>
        {plan.limits && (
          <ul className="mb-5 space-y-2.5 rounded-xl border border-slate-100 p-3.5">
            <LimitLine icon={Users} label="Team members" value={plan.limits.maxUsers} />
            <LimitLine icon={Building2} label="Businesses" value={plan.limits.maxBusinesses} />
            <LimitLine icon={CalendarDays} label="Follow-ups" value={plan.limits.maxFollowUps} />
            <LimitLine icon={FileText} label="Notes" value={plan.limits.maxNotes} />
          </ul>
        )}
        {plan.features && plan.features.length > 0 && (
          <ul className="mb-6 flex-1 space-y-2.5">
            {plan.features.map((feature) => (
              <li
                key={feature.code}
                className="flex items-start gap-2.5 text-xs leading-5 text-[#475569]"
                title={feature.description}
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-brand-green-strong" />
                <span>
                  <span className="font-semibold">{feature.name}</span>
                  {feature.description && (
                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                      {feature.description}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          disabled={disabled || !getPlanId(plan)}
          onClick={() => onChoose(plan)}
          className={`mt-auto h-10 w-full rounded-xl font-semibold ${
            featured ? "bg-primary text-white hover:bg-primary/90" : ""
          }`}
        >
          {disabled ? "Active subscription exists" : "Choose this plan"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </article>
  );
}

function SubscriptionRow({
  subscription,
  plan,
  tenantName,
  hasvikAdmin,
  tenantAdmin,
  busy,
  onActivate,
  onRenew,
  onCancel,
  onReject,
}: {
  subscription: Subscription;
  plan?: SubscriptionPlan;
  tenantName: string;
  hasvikAdmin: boolean;
  tenantAdmin: boolean;
  busy: boolean;
  onActivate: (id: string) => void;
  onRenew: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
  onReject: (subscription: Subscription) => void;
}) {
  const id = getRecordId(subscription);
  const status = normalizeStatus(subscription.status);
  const embeddedPlan =
    typeof subscription.plan === "object" ? subscription.plan : undefined;
  const planName =
    embeddedPlan?.name ??
    plan?.name ??
    (typeof subscription.planId === "object" ? subscription.planId.name : "") ??
    "Subscription plan";
  const amount = embeddedPlan?.price ?? plan?.price;
  const currency = embeddedPlan?.currency ?? plan?.currency ?? "INR";

  return (
    <article className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">{planName}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="mt-1 text-xs text-slate-600">
          {tenantName}
          {amount !== undefined ? ` · ${formatPrice(amount, currency)}` : ""}
          {subscription.autoRenew ? " · Auto-renew on" : " · Auto-renew off"}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Starts {formatDate(subscription.startDate)} · Ends {formatDate(subscription.endDate)}
        </p>
        {status === "CANCELLED" && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-950">
            Plan cancelled. Access remains active until{" "}
            <span className="font-semibold">{formatDate(subscription.endDate)}</span>.
          </p>
        )}
        {status === "REJECTED" && (
          <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-900">
            This subscription request was rejected by a HASVIK admin.
          </p>
        )}
        {status === "SUSPENDED" && (
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-700">
            This subscription is suspended. Workspace access may be restricted.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {(hasvikAdmin || tenantAdmin) && status === "ACTIVE" && id && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onCancel(subscription)}
            className="h-9 rounded-lg border-amber-300 text-amber-900 hover:bg-amber-50"
          >
            Cancel subscription
          </Button>
        )}
        {hasvikAdmin && status === "PENDING" && id && (
          <>
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => onActivate(id)}
              className="h-9 rounded-lg"
            >
              {busy && <LoaderCircle className="size-3.5 animate-spin" />}
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onReject(subscription)}
              className="h-9 rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              Reject
            </Button>
          </>
        )}
        {(status === "ACTIVE" || status === "EXPIRED") && id && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onRenew(subscription)}
            className="h-9 rounded-lg"
          >
            {busy && <LoaderCircle className="size-3.5 animate-spin" />}
            <RefreshCw className="size-3.5" />
            Renew
          </Button>
        )}
      </div>
    </article>
  );
}

export default function SubscriptionsPage() {
  const user = useAuthStore((state) => state.user);
  const hasvikAdmin = user?.role.toUpperCase() === "HASVIK_ADMIN";
  const tenantAdmin = user?.role.toUpperCase() === "ADMIN";
  const plansQuery = useSubscriptionPlansQuery();
  const subscriptionsQuery = useSubscriptionsQuery(user?.userId);
  const tenantsQuery = useTenantsQuery(
    hasvikAdmin || !user?.tenantId,
    user?.userId,
  );
  const createMutation = useCreateSubscription();
  const renewMutation = useRenewSubscription();
  const statusMutation = useUpdateSubscriptionStatus();
  const plans = useMemo(
    () =>
      [...(plansQuery.data ?? [])]
        .filter((plan) => plan.isActive !== false)
        .sort((a, b) => a.price - b.price),
    [plansQuery.data],
  );
  const tenants = tenantsQuery.data ?? [];
  const emailMatchedTenant = tenants.find(
    (tenant) =>
      tenant.contactEmail?.toLowerCase() === user?.email.toLowerCase(),
  );
  const ownTenantId = user?.tenantId ?? emailMatchedTenant?.id;
  const ownTenant = tenants.find((tenant) => tenant.id === ownTenantId) ?? emailMatchedTenant;
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [chosenPlan, setChosenPlan] = useState<SubscriptionPlan | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<SubscriptionFilter>(
    hasvikAdmin ? "ACTIVE" : "ALL",
  );
  const [showFilters, setShowFilters] = useState(true);
  const [notice, setNotice] = useState("");
  const [operationError, setOperationError] = useState("");
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<Subscription | null>(null);
  const [subscriptionToRenew, setSubscriptionToRenew] =
    useState<Subscription | null>(null);
  const [subscriptionToReject, setSubscriptionToReject] =
    useState<Subscription | null>(null);

  const subscriptions = subscriptionsQuery.data ?? [];
  const visibleSubscriptions = subscriptions.filter((subscription) => {
    if (!hasvikAdmin && ownTenantId && getSubscriptionTenantId(subscription) !== ownTenantId) {
      return false;
    }
    if (!hasvikAdmin && !ownTenantId) return false;
    const status = normalizeStatus(subscription.status);
    if (statusFilter !== "ALL" && status !== statusFilter) return false;
    const planId = getReferenceId(subscription.planId);
    const planName =
      (typeof subscription.plan === "object" ? subscription.plan.name : "") ??
      plans.find((plan) => getPlanId(plan) === planId)?.name ??
      "";
    const tenantName =
      (typeof subscription.tenant === "object" ? subscription.tenant.name : "") ??
      tenants.find((tenant) => tenant.id === getSubscriptionTenantId(subscription))?.name ??
      "";
    const query = search.trim().toLowerCase();
    return !query || `${planName} ${tenantName} ${status}`.toLowerCase().includes(query);
  });
  const activeSubscriptions = visibleSubscriptions.filter(
    (subscription) => normalizeStatus(subscription.status) === "ACTIVE",
  );
  const allActiveSubscriptionsCount = subscriptions.filter(
    (subscription) => normalizeStatus(subscription.status) === "ACTIVE",
  ).length;
  const selectedTenant = tenants.find((tenant) => tenant.id === selectedTenantId);
  const createTenantId = hasvikAdmin ? selectedTenantId : ownTenantId ?? "";
  const activeForSelectedTenant = subscriptions.some(
    (subscription) =>
      getSubscriptionTenantId(subscription) === createTenantId &&
      hasCurrentSubscriptionAccess(subscription),
  );
  const pendingCreateTenantId = tenantsQuery.isPending && !ownTenantId;
  const canChoosePlan =
    Boolean(createTenantId) &&
    !(hasvikAdmin && selectedTenant && !selectedTenant.isActive) &&
    !activeForSelectedTenant &&
    !subscriptionsQuery.isPending &&
    !subscriptionsQuery.isError &&
    !pendingCreateTenantId &&
    !(hasvikAdmin && tenantsQuery.isError);

  const visiblePlans = plans.filter((plan) => {
    const matchesCycle = cycleFilter === "ALL" || plan.billingCycle === cycleFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${plan.name} ${plan.code} ${plan.description ?? ""}`.toLowerCase().includes(query);
    return matchesCycle && matchesSearch;
  });

  function openCheckout(plan: SubscriptionPlan) {
    setChosenPlan(plan);
    setAutoRenew(false);
    setNotice("");
    setOperationError("");
  }

  async function submitSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const planId = chosenPlan ? getPlanId(chosenPlan) : "";
    if (!planId || !createTenantId) return;

    setOperationError("");
    try {
      await createMutation.mutateAsync({
        tenantId: createTenantId,
        planId,
        autoRenew,
      });
      setChosenPlan(null);
      setNotice(
        hasvikAdmin
          ? `The ${chosenPlan?.name ?? "selected"} subscription was created for ${selectedTenant?.name ?? "the selected tenant"}.`
          : `Your request for the ${chosenPlan?.name ?? "selected"} plan was submitted for HASVIK admin approval.`,
      );
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  async function activate(id: string) {
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status: "ACTIVE" });
      setNotice("Subscription request approved.");
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  async function renew(id: string): Promise<boolean> {
    setOperationError("");
    try {
      await renewMutation.mutateAsync({ id });
      setNotice("Subscription renewed.");
      return true;
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
      return false;
    }
  }

  async function rejectSubscription() {
    const id = subscriptionToReject ? getRecordId(subscriptionToReject) : "";
    if (!id) return;
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status: "REJECTED" });
      setSubscriptionToReject(null);
      setNotice("Subscription request rejected.");
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  async function cancelSubscription() {
    const id = subscriptionToCancel ? getRecordId(subscriptionToCancel) : "";
    if (!id) return;
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status: "CANCELLED" });
      setSubscriptionToCancel(null);
      setNotice(
        `Subscription cancelled. Access remains active until ${formatDate(subscriptionToCancel?.endDate)}.`,
      );
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  const busySubscriptionId =
    renewMutation.variables?.id ??
    statusMutation.variables?.id;
  const busy =
    createMutation.isPending ||
    renewMutation.isPending ||
    statusMutation.isPending;

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Subscriptions" }]} />}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search plans and subscriptions"
      filters={
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="subscription-cycle-filter" className="flex items-center gap-2 text-xs font-medium text-slate-600">
            Billing cycle
            <Select
              value={cycleFilter}
              onValueChange={(value) => setCycleFilter(value as BillingCycle | "ALL")}
            >
              <SelectTrigger id="subscription-cycle-filter" size="sm" className="w-36 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-xs">All cycles</SelectItem>
                {Object.entries(cycleLabels).map(([cycle, label]) => (
                  <SelectItem key={cycle} value={cycle} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label htmlFor="subscription-status-filter" className="flex items-center gap-2 text-xs font-medium text-slate-600">
            Status
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as SubscriptionFilter)}
            >
              <SelectTrigger id="subscription-status-filter" size="sm" className="w-36 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-xs">All statuses</SelectItem>
                <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
                <SelectItem value="REJECTED" className="text-xs">Rejected</SelectItem>
                <SelectItem value="SUSPENDED" className="text-xs">Suspended</SelectItem>
                <SelectItem value="EXPIRED" className="text-xs">Expired</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      }
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters((visible) => !visible)}
      showStats={false}
      actions={
        <Actions
          primary={{
            label: "Explore plans",
            onSelect: () =>
              document.getElementById("available-plans")?.scrollIntoView({ behavior: "smooth" }),
            icon: <ArrowRight className="size-4" />,
          }}
          menuItems={[
            {
              label: showFilters ? "Hide filters" : "Show filters",
              onSelect: () => setShowFilters((visible) => !visible),
              icon: <Filter className="size-4" />,
            },
          ]}
        />
      }
      content={
        <div className="flex flex-col gap-5">
          {hasvikAdmin ? (
            <div className="flex flex-col gap-2 rounded-xl border border-[#e4ecf2] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Manage tenant subscriptions</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Select a tenant before assigning a plan.
                </p>
              </div>
              <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                <SelectTrigger className="w-full rounded-lg text-xs sm:w-72">
                  <SelectValue placeholder="Choose a tenant" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id} className="text-xs">
                      {tenant.name}{tenant.isActive ? "" : " (inactive)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex justify-end">
              <span className="inline-flex w-fit max-w-full items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Building2 className="mr-1.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{ownTenant?.name ?? user?.fullName ?? "My workspace"}</span>
              </span>
            </div>
          )}

          {notice && (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
              {notice}
            </p>
          )}
          {operationError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              {operationError}
            </p>
          )}

          {!hasvikAdmin && !ownTenantId && (
            <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
              Your tenant ID is missing from your account session, and no tenant matched your sign-in email. Subscription creation is unavailable until the account response includes its tenant ID or the tenant contact email matches your account.
            </div>
          )}

          {tenantsQuery.isError && (hasvikAdmin || !ownTenantId) && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              Tenant details couldn’t be loaded. {getApiErrorMessage(tenantsQuery.error)}
            </div>
          )}

          {activeForSelectedTenant && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-blue-950">
                This tenant already has an active subscription. Renew it from the subscription list; assigning another active plan is disabled.
              </p>
            </div>
          )}

          <section aria-label="Current subscriptions" className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_4px_16px_rgba(20,40,60,0.03)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf2f7] px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-sm font-bold text-[#0f172a]">
                  {hasvikAdmin ? "Tenant subscriptions" : "Your subscriptions"}
                </h2>
                <p className="mt-1 text-xs text-[#64748b]">
                  {hasvikAdmin
                    ? "Active subscriptions across all tenants. Use the status filter to review requests and history."
                    : "Subscription status and dates come from the live service."}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                {hasvikAdmin
                  ? allActiveSubscriptionsCount
                  : activeSubscriptions.length}{" "}
                active
              </span>
            </div>
            {subscriptionsQuery.isPending ? (
              <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500">
                <LoaderCircle className="size-4 animate-spin" />
                Loading subscriptions…
              </div>
            ) : subscriptionsQuery.isError ? (
              <div className="px-5 py-10 text-center">
                <p role="alert" className="text-sm font-semibold text-slate-800">
                  Subscriptions couldn’t be loaded
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {getApiErrorMessage(subscriptionsQuery.error)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void subscriptionsQuery.refetch()} className="mt-4 rounded-lg">
                  Try again
                </Button>
              </div>
            ) : visibleSubscriptions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CreditCard className="mx-auto size-6 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-800">No subscriptions found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Choose an available plan below to create a subscription.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#edf2f7]">
                {visibleSubscriptions.map((subscription) => {
                  const planId = getReferenceId(subscription.planId);
                  const tenantId = getSubscriptionTenantId(subscription);
                  const tenantName =
                    (typeof subscription.tenant === "object" ? subscription.tenant.name : undefined) ??
                    tenants.find((tenant) => tenant.id === tenantId)?.name ??
                    (hasvikAdmin ? "Tenant" : ownTenant?.name ?? "Your workspace");
                  const busyThisSubscription =
                    busy && getRecordId(subscription) === busySubscriptionId;
                  return (
                    <SubscriptionRow
                      key={getRecordId(subscription) || `${tenantId}-${planId}`}
                      subscription={subscription}
                      plan={plans.find((plan) => getPlanId(plan) === planId)}
                      tenantName={tenantName}
                      hasvikAdmin={hasvikAdmin}
                      tenantAdmin={tenantAdmin}
                      busy={busyThisSubscription}
                      onActivate={(id) => void activate(id)}
                      onRenew={(renewalSubscription) => {
                        setOperationError("");
                        setSubscriptionToRenew(renewalSubscription);
                      }}
                      onCancel={setSubscriptionToCancel}
                      onReject={setSubscriptionToReject}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section id="available-plans" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
                  Available subscription plans
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Creating a subscription does not process a payment.
                </p>
              </div>
              {!plansQuery.isPending && !plansQuery.isError && (
                <span className="text-xs font-medium text-slate-500">
                  {visiblePlans.length} {visiblePlans.length === 1 ? "plan" : "plans"}
                </span>
              )}
            </div>
            {plansQuery.isPending ? (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-[#e4ecf2] bg-white">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-[#64748b]">Loading plans…</span>
              </div>
            ) : plansQuery.isError ? (
              <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-[#0f172a]">Plans couldn’t be loaded</p>
                <p className="mt-1 text-xs text-[#64748b]">{getApiErrorMessage(plansQuery.error)}</p>
                <Button variant="outline" size="sm" onClick={() => void plansQuery.refetch()} className="mt-4 rounded-lg">
                  Try again
                </Button>
              </div>
            ) : visiblePlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-5 py-12 text-center">
                <CreditCard className="mx-auto size-6 text-[#94a3b8]" />
                <p className="mt-3 text-sm font-semibold text-[#334155]">
                  {plans.length === 0 ? "No plans are available right now" : "No plans match your filters"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visiblePlans.map((plan) => (
                  <PlanCard
                    key={getPlanId(plan) || plan.code}
                    plan={plan}
                    featured={plans.length > 1 && plans[1] === plan}
                    disabled={!canChoosePlan || activeForSelectedTenant}
                    onChoose={openCheckout}
                  />
                ))}
              </div>
            )}
          </section>

          <DialogPrimitive.Root
            open={Boolean(chosenPlan)}
            onOpenChange={(open) => {
              if (!open && !createMutation.isPending) {
                setChosenPlan(null);
                setOperationError("");
              }
            }}
          >
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[2px]" />
              <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-2xl outline-none sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <CreditCard className="size-3" />
                      Live subscription
                    </span>
                    <DialogPrimitive.Title className="mt-3 text-xl font-bold tracking-tight text-[#0f172a]">
                      {hasvikAdmin ? "Assign subscription" : "Subscribe to a plan"}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-xs leading-5 text-[#64748b]">
                      {hasvikAdmin
                        ? "Create a subscription for the selected tenant. Payment is not collected in this flow."
                        : "Submit a subscription request for HASVIK admin approval. Payment is not collected in this flow."}
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close
                    aria-label="Close"
                    disabled={createMutation.isPending}
                    className="rounded-lg p-2 text-[#64748b] transition-colors hover:bg-[#f1f5f9] disabled:opacity-50"
                  >
                    <X className="size-4" />
                  </DialogPrimitive.Close>
                </div>
                {chosenPlan && (
                  <form onSubmit={(event) => void submitSubscription(event)} className="space-y-5">
                    <div className="rounded-xl border border-[#dbeafe] bg-[#f8fbff] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Selected plan</p>
                      <p className="mt-1 text-base font-bold text-slate-900">{chosenPlan.name}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(chosenPlan.price, chosenPlan.currency)}
                      </p>
                      {chosenPlan.description && (
                        <p className="mt-2 text-xs leading-5 text-slate-600">{chosenPlan.description}</p>
                      )}
                    </div>
                    {hasvikAdmin && (
                      <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-slate-700">Tenant</span>
                        <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                          <SelectTrigger className="w-full rounded-xl text-xs">
                            <SelectValue placeholder="Choose a tenant" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {tenants.filter((tenant) => tenant.isActive).map((tenant) => (
                              <SelectItem key={tenant.id} value={tenant.id} className="text-xs">
                                {tenant.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </label>
                    )}
                    {selectedTenant && !selectedTenant.isActive && (
                      <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                        This tenant is inactive. Activate the tenant before assigning a subscription.
                      </p>
                    )}
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e4ecf2] p-3.5">
                      <Checkbox
                        checked={autoRenew}
                        onCheckedChange={(checked) => setAutoRenew(checked === true)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block text-xs font-semibold text-[#334155]">Automatic subscription renewal</span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-[#64748b]">
                          Enable automatic renewal for this subscription.
                        </span>
                      </span>
                    </label>
                    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[10px] leading-4 text-blue-950">
                      <CircleHelp className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      No payment is processed or recorded. The subscription is created through the backend and its status is shown in the subscriptions list.
                    </div>
                    {operationError && (
                      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                        {operationError}
                      </p>
                    )}
                    <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={createMutation.isPending}
                        onClick={() => setChosenPlan(null)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createMutation.isPending ||
                          !createTenantId ||
                          (hasvikAdmin && Boolean(selectedTenant && !selectedTenant.isActive))
                        }
                        className="rounded-xl bg-primary text-white"
                      >
                        {createMutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
                        {createMutation.isPending
                          ? "Submitting…"
                          : hasvikAdmin
                            ? "Create subscription"
                            : "Submit request"}
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>

          <DialogPrimitive.Root
            open={Boolean(subscriptionToCancel)}
            onOpenChange={(open) => {
              if (!open && !statusMutation.isPending) {
                setSubscriptionToCancel(null);
              }
            }}
          >
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0f172a]/45 backdrop-blur-[2px]" />
              <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e4ecf2] bg-white p-5 shadow-2xl outline-none sm:p-7">
                <DialogPrimitive.Title className="text-lg font-bold text-slate-900">
                  Cancel subscription?
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-2 text-xs leading-5 text-slate-600">
                  {subscriptionToCancel && (
                    <>
                      Cancel {typeof subscriptionToCancel.plan === "object"
                        ? subscriptionToCancel.plan.name
                        : plans.find(
                            (plan) =>
                              getPlanId(plan) === getReferenceId(subscriptionToCancel.planId),
                          )?.name ?? "this subscription"}
                      . The plan will remain active until{" "}
                      <span className="font-semibold text-slate-900">
                        {formatDate(subscriptionToCancel.endDate)}
                      </span>
                      . Access will end after the current subscription period.
                    </>
                  )}
                </DialogPrimitive.Description>
                {operationError && (
                  <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    {operationError}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() => setSubscriptionToCancel(null)}
                    className="rounded-xl"
                  >
                    Keep subscription
                  </Button>
                  <Button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => void cancelSubscription()}
                    className="rounded-xl bg-amber-700 text-white hover:bg-amber-800"
                  >
                    {statusMutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
                    {statusMutation.isPending ? "Cancelling…" : "Cancel at period end"}
                  </Button>
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>

          <ManagementConfirmDialog
            open={Boolean(subscriptionToRenew)}
            title="Renew subscription?"
            description={
              subscriptionToRenew
                ? `Confirm renewal for ${
                    typeof subscriptionToRenew.plan === "object"
                      ? subscriptionToRenew.plan.name
                      : plans.find(
                          (plan) =>
                            getPlanId(plan) ===
                            getReferenceId(subscriptionToRenew.planId),
                        )?.name ?? "this subscription"
                  }. This will submit the renewal through the existing subscription flow.`
                : ""
            }
            confirmLabel="Confirm renewal"
            destructive={false}
            pending={renewMutation.isPending}
            onCancel={() => setSubscriptionToRenew(null)}
            onConfirm={() => {
              const id = subscriptionToRenew
                ? getRecordId(subscriptionToRenew)
                : "";
              if (id) {
                void renew(id).then((success) => {
                  if (success) setSubscriptionToRenew(null);
                });
              }
            }}
          />

          <ManagementConfirmDialog
            open={Boolean(subscriptionToReject)}
            title="Reject subscription request?"
            description={
              subscriptionToReject
                ? `Reject the pending request for ${
                    typeof subscriptionToReject.plan === "object"
                      ? subscriptionToReject.plan.name
                      : plans.find(
                          (plan) =>
                            getPlanId(plan) ===
                            getReferenceId(subscriptionToReject.planId),
                        )?.name ?? "this subscription"
                  }? The tenant will not receive access from this request.`
                : ""
            }
            confirmLabel="Reject request"
            pending={statusMutation.isPending}
            onCancel={() => setSubscriptionToReject(null)}
            onConfirm={() => void rejectSubscription()}
          />
        </div>
      }
    />
  );
}
