"use client";

import { isRecordInactive } from "@/lib/records/activity";
import EntityActivityButton from "@/components/common/EntityActivityButton";

import { useListActionHighlight } from "@/hooks/use-list-action-highlight";

import { useMemo, useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  CircleHelp,
  Copy,
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
import { isSuperAdmin, isTenantAdmin } from "@/types/auth";
import {
  useCreateSubscription,
  useRenewSubscription,
  useSubscriptionPlansQuery,
  useSubscriptionsQuery,
  useUpdateSubscriptionStatus,
} from "@/hooks/use-subscriptions";
import { useTenantQuery, useTenantsQuery } from "@/hooks/use-tenants";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  getSubscriptionId,
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
import { toast } from "sonner";
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
import StatusBadge from "@/components/common/SubscriptionStatusBadge";
import { getSubscriptionStatusVisual, SUBSCRIPTION_STATUS_VISUALS } from "@/lib/subscriptions/status";

const cycleLabels: Record<BillingCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half-yearly",
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
  return status?.trim().toUpperCase() ?? "UNKNOWN";
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
  readOnly,
  hasvikAdmin,
  tenantAdmin,
  busy,
  onApprove,
  onRenew,
  onCancel,
  onReject,
}: {
  subscription: Subscription;
  plan?: SubscriptionPlan;
  tenantName: string;
  readOnly: boolean;
  hasvikAdmin: boolean;
  tenantAdmin: boolean;
  busy: boolean;
  onApprove: (subscription: Subscription) => void;
  onRenew: (subscription: Subscription) => void;
  onCancel: (subscription: Subscription) => void;
  onReject: (subscription: Subscription) => void;
}) {
  const id = getSubscriptionId(subscription);
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
  const billingCycle = embeddedPlan?.billingCycle ?? plan?.billingCycle;

  return (
    <article className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">{planName}</h3>
          {id && <EntityActivityButton entityType="SUBSCRIPTION" entityId={id} name={planName} />}
          <StatusBadge status={status} />
        </div>
        <p className="mt-1 text-xs text-slate-600">
          {tenantName}
          {amount !== undefined ? ` · ${formatPrice(amount, currency)}` : ""}
          {billingCycle
            ? ` · ${cycleLabels[billingCycle] ?? billingCycle}`
            : ""}
          {subscription.autoRenew ? " · Auto-renew on" : " · Auto-renew off"}
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          {status === "PENDING"
            ? `Requested ${formatDate(subscription.createdAt)}`
            : `Starts ${formatDate(subscription.startDate)} · Ends ${formatDate(subscription.endDate)}`}
        </p>
        {id && (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(id).then(
                () => toast.success("Subscription ID copied."),
                () => toast.error("Unable to copy the subscription ID."),
              );
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-brand-blue"
            title={id}
          >
            <Copy className="size-3" />
            <span className="max-w-48 truncate">ID: {id}</span>
          </button>
        )}
        {status === "PENDING" && (
          <p className={`mt-2 rounded-lg border px-3 py-2 text-[11px] leading-5 ${getSubscriptionStatusVisual(status).badge}`}>
            {hasvikAdmin
              ? "This subscription request is awaiting your review."
              : "Your request is awaiting HASVIK admin approval. Access starts after approval."}
          </p>
        )}
        {status === "CANCELLED" && (
          <p className={`mt-2 rounded-lg border px-3 py-2 text-[11px] leading-5 ${getSubscriptionStatusVisual(status).badge}`}>
            Plan cancelled. Access remains active until{" "}
            <span className="font-semibold">{formatDate(subscription.endDate)}</span>.
          </p>
        )}
        {status === "REJECTED" && (
          <p className={`mt-2 rounded-lg border px-3 py-2 text-[11px] leading-5 ${getSubscriptionStatusVisual(status).badge}`}>
            This subscription request was rejected by a HASVIK admin.
          </p>
        )}
        {status === "SUSPENDED" && (
          <p className={`mt-2 rounded-lg border px-3 py-2 text-[11px] leading-5 ${getSubscriptionStatusVisual(status).badge}`}>
            This subscription is suspended. Workspace access may be restricted.
          </p>
        )}
      </div>
      {readOnly && <p className="text-xs text-slate-500">Read-only. Activate the tenant before changing subscriptions.</p>}
      {!readOnly && <div className="flex flex-wrap gap-2">
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
              onClick={() => onApprove(subscription)}
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
      </div>}
    </article>
  );
}

export default function SubscriptionsPage() {
  const { highlightItem, isItemHighlighted } = useListActionHighlight("subscriptions");
  const user = useAuthStore((state) => state.user);
  const hasvikAdmin = isSuperAdmin(user);
  const tenantAdmin = isTenantAdmin(user);
  const plansQuery = useSubscriptionPlansQuery();
  const subscriptionsQuery = useSubscriptionsQuery(user?.userId);
  const ownTenantQuery = useTenantQuery(user?.tenantId, !hasvikAdmin);
  const tenantsQuery = useTenantsQuery(hasvikAdmin, user?.userId);
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
  const ownTenantId = user?.tenantId;
  const ownTenant = ownTenantQuery.data;
  const subscriptions = subscriptionsQuery.data ?? [];
  const embeddedTenant = subscriptions.find(
    (subscription) => getSubscriptionTenantId(subscription) === ownTenantId,
  )?.tenant;
  function subscriptionReadOnly(subscription?: Subscription | null) {
    if (!subscription) return true;
    const tenantId = getSubscriptionTenantId(subscription);
    const tenant = tenantId === ownTenantId ? ownTenant : tenants.find((item) => item.id === tenantId);
    return isRecordInactive(tenant) || (typeof subscription.tenant === "object" && subscription.tenant.isActive === false) || (typeof subscription.tenantId === "object" && subscription.tenantId.isActive === false) || (typeof subscription.business === "object" && subscription.business.isActive === false);
  }
  const ownTenantName =
    ownTenant?.name ??
    (typeof embeddedTenant === "object" ? embeddedTenant.name : undefined);
  const [chosenPlan, setChosenPlan] = useState<SubscriptionPlan | null>(null);
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<SubscriptionFilter>(
    hasvikAdmin ? "PENDING" : "ALL",
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
  const [subscriptionToApprove, setSubscriptionToApprove] =
    useState<Subscription | null>(null);
  const [manualVerificationConfirmed, setManualVerificationConfirmed] =
    useState(false);

  const visibleSubscriptions = subscriptions.filter((subscription) => {
    if (!hasvikAdmin && ownTenantId && getSubscriptionTenantId(subscription) !== ownTenantId) {
      return false;
    }
    if (!hasvikAdmin && !ownTenantId) return false;
    const status = normalizeStatus(subscription.status);
    if (statusFilter !== "ALL" && status !== statusFilter) {
      return false;
    }
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
  const pendingSubscriptionsCount = subscriptions.filter(
    (subscription) => normalizeStatus(subscription.status) === "PENDING",
  ).length;
  const createTenantId = ownTenantId ?? "";
  const requestExistsForCreateTenant = subscriptions.some(
    (subscription) =>
      getSubscriptionTenantId(subscription) === createTenantId &&
      (hasCurrentSubscriptionAccess(subscription) ||
        normalizeStatus(subscription.status) === "PENDING"),
  );
  const canChoosePlan =
    Boolean(createTenantId) && ownTenant?.isActive === true &&
    !hasvikAdmin &&
    !requestExistsForCreateTenant &&
    !subscriptionsQuery.isPending &&
    !subscriptionsQuery.isError &&
    !ownTenantQuery.isError;

  const visiblePlans = plans.filter((plan) => {
    const matchesCycle = cycleFilter === "ALL" || plan.billingCycle === cycleFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${plan.name} ${plan.code} ${plan.description ?? ""}`.toLowerCase().includes(query);
    return matchesCycle && matchesSearch;
  });

  function openCheckout(plan: SubscriptionPlan) {
    if (!canChoosePlan || plan.isActive === false) return;
    setChosenPlan(plan);
    setNotice("");
    setOperationError("");
  }

  async function submitSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const planId = chosenPlan ? getPlanId(chosenPlan) : "";
    if (!chosenPlan || !planId || !createTenantId || !canChoosePlan || chosenPlan.isActive === false) return;
    if (!Number.isFinite(chosenPlan.price) || chosenPlan.price < 0) return;
    setOperationError("");
    try {
      const createdSubscription = await createMutation.mutateAsync({
        tenantId: createTenantId,
        planId,
        autoRenew: false,
      });
      const createdStatus = createdSubscription.status?.trim().toUpperCase();
      setChosenPlan(null);
      setNotice(
        createdStatus === "PENDING"
          ? `Your request for ${chosenPlan.name} was submitted and is pending HASVIK admin approval.`
          : `Your subscription request was submitted with status ${createdStatus ?? "unknown"}.`,
      );
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  async function activate(id: string) {
    if (subscriptionReadOnly(subscriptionToApprove)) return;
    if (!id || normalizeStatus(subscriptionToApprove?.status) !== "PENDING") {
      setOperationError("Only a pending subscription request can be approved.");
      return;
    }
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status: "ACTIVE" });
      highlightItem(id);
      setSubscriptionToApprove(null);
      setManualVerificationConfirmed(false);
      setNotice("Subscription request approved.");
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  async function renew(id: string): Promise<boolean> {
    if (subscriptionReadOnly(subscriptions.find((item) => getSubscriptionId(item) === id))) return false;
    setOperationError("");
    try {
      await renewMutation.mutateAsync({ id });
      highlightItem(id);
      setNotice("Subscription renewed.");
      return true;
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
      return false;
    }
  }

  async function rejectSubscription() {
    if (subscriptionReadOnly(subscriptionToReject)) return;
    const id = subscriptionToReject ? getSubscriptionId(subscriptionToReject) : "";
    if (!id || normalizeStatus(subscriptionToReject?.status) !== "PENDING") {
      setOperationError("Only a pending subscription request can be rejected.");
      return;
    }
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status: "REJECTED" });
      highlightItem(id);
      setSubscriptionToReject(null);
      setNotice("Subscription request rejected.");
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  async function cancelSubscription() {
    if (subscriptionReadOnly(subscriptionToCancel)) return;
    const id = subscriptionToCancel ? getSubscriptionId(subscriptionToCancel) : "";
    if (!id) return;
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status: "CANCELLED" });
      highlightItem(id);
      setSubscriptionToCancel(null);
      setNotice(
        `Subscription cancelled. Access remains active until ${formatDate(subscriptionToCancel?.endDate)}.`,
      );
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  const busySubscriptionId =
    renewMutation.variables?.id ?? statusMutation.variables?.id;
  const busy =
    createMutation.isPending ||
    renewMutation.isPending ||
    statusMutation.isPending;
  const chosenPlanHasValidPrice =
    chosenPlan !== null &&
    Number.isFinite(chosenPlan.price) &&
    chosenPlan.price >= 0;

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Subscriptions" }]} />}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder={
        hasvikAdmin
          ? "Search subscriptions by workspace or plan"
          : "Search plans and subscriptions"
      }
      filters={tenantAdmin || hasvikAdmin ? (
        <div className="flex flex-wrap items-center gap-4">
          {tenantAdmin && (
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
          )}
          <label htmlFor="subscription-status-filter" className="flex items-center gap-2 text-xs font-medium text-slate-600">
            Status
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as SubscriptionFilter)}
            >
              <SelectTrigger id="subscription-status-filter" size="sm" className="w-48 rounded-none text-xs">
                <SelectValue>
                  {statusFilter === "ALL" ? <span className="text-slate-600">All statuses</span> : <StatusBadge status={statusFilter} />}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="rounded-none py-2.5 text-xs">All statuses</SelectItem>
                {Object.entries(SUBSCRIPTION_STATUS_VISUALS).map(([status, visual]) => <SelectItem key={status} value={status} textValue={visual.label} className="rounded-none py-2.5 text-xs"><span className="inline-flex items-center gap-2.5"><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${visual.dot}`} /><span>{visual.label}</span></span></SelectItem>)}
              </SelectContent>
            </Select>
          </label>
        </div>
      ) : undefined}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters((visible) => !visible)}
      onResetFilters={() => {
        setSearch("");
        setCycleFilter("ALL");
        setStatusFilter(hasvikAdmin ? "PENDING" : "ALL");
      }}
      resultCount={visibleSubscriptions.length}
      showStats={false}
      actions={
        <Actions
          primary={{
            label: hasvikAdmin ? "Review pending requests" : "Explore plans",
            onSelect: () =>
              document
                .getElementById(
                  hasvikAdmin ? "subscription-requests" : "available-plans",
                )
                ?.scrollIntoView({ behavior: "smooth" }),
            icon: <ArrowRight className="size-4" />,
          }}
          menuItems={tenantAdmin || hasvikAdmin ? [
            {
              label: showFilters ? "Hide filters" : "Show filters",
              onSelect: () => setShowFilters((visible) => !visible),
              icon: <Filter className="size-4" />,
            },
          ] : []}
        />
      }
      content={
        <div className="flex flex-col gap-5">
          {hasvikAdmin ? (
            <div className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${getSubscriptionStatusVisual("PENDING").badge}`}>
              <div>
                <p className="text-sm font-bold">Subscription approval queue</p>
                <p className="mt-1 text-xs leading-5">
                  Review pending requests from all workspaces. Approving a request activates its subscription.
                </p>
              </div>
              <StatusBadge status="PENDING" label={`${pendingSubscriptionsCount} awaiting review`} className="w-fit px-3 py-1.5 text-xs" />
            </div>
          ) : (
            <div className="flex justify-end">
              <span className="inline-flex w-fit max-w-full items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Building2 className="mr-1.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{ownTenantName ?? user?.fullName ?? "My workspace"}</span>
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
              Your account is missing a workspace ID. Subscription requests are unavailable until your workspace administrator restores the tenant ID on your account.
            </div>
          )}

          {hasvikAdmin && tenantsQuery.isError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              Tenant names couldn’t be loaded. {getApiErrorMessage(tenantsQuery.error)}
            </div>
          )}

          {!hasvikAdmin && ownTenantId && ownTenantQuery.isError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              Workspace details couldn’t be loaded. {getApiErrorMessage(ownTenantQuery.error)}
            </div>
          )}

          {requestExistsForCreateTenant && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-blue-950">
                Your workspace already has an active subscription or a pending request. Another plan cannot be requested until the current request is resolved or the subscription ends.
              </p>
            </div>
          )}

          <section id="subscription-requests" aria-label="Current subscriptions" className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_4px_16px_rgba(20,40,60,0.03)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf2f7] px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-sm font-bold text-[#0f172a]">
                  {hasvikAdmin ? "Subscription requests and history" : "Your subscriptions"}
                </h2>
                <p className="mt-1 text-xs text-[#64748b]">
                  {hasvikAdmin
                    ? "Review pending requests or filter the complete subscription history."
                    : "View your active plan, dates, and any requests awaiting approval."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-none border px-2.5 py-1 text-[10px] font-bold ${hasvikAdmin ? getSubscriptionStatusVisual(statusFilter).badge : getSubscriptionStatusVisual("ACTIVE").badge}`}>
                  {hasvikAdmin
                    ? statusFilter === "PENDING"
                      ? `${pendingSubscriptionsCount} pending`
                      : `${visibleSubscriptions.length} shown`
                    : `${activeSubscriptions.length} active`}
                </span>
                {hasvikAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={subscriptionsQuery.isFetching}
                    onClick={() => void subscriptionsQuery.refetch()}
                    className="h-8 rounded-lg px-2.5 text-xs"
                  >
                    <RefreshCw
                      className={`size-3.5 ${subscriptionsQuery.isFetching ? "animate-spin" : ""}`}
                    />
                    <span className="sr-only sm:not-sr-only">Refresh</span>
                  </Button>
                )}
              </div>
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
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {hasvikAdmin
                    ? search.trim()
                      ? "No subscriptions match your search"
                      : statusFilter === "PENDING"
                        ? "No pending subscription requests"
                        : "No subscriptions match this status"
                    : "No subscriptions found"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {hasvikAdmin
                    ? search.trim()
                      ? "Try another workspace or plan name."
                      : statusFilter === "PENDING"
                        ? "New subscription requests from tenant admins will appear here."
                        : "Choose another status to review subscription history."
                    : "Choose an available plan below to create a subscription."}
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
                    (hasvikAdmin ? "Tenant" : ownTenantName ?? "Your workspace");
                  const busyThisSubscription =
                    busy && getSubscriptionId(subscription) === busySubscriptionId;
                  const subscriptionId = getSubscriptionId(subscription) || `${tenantId}-${planId}`;
                  return (
                    <div key={subscriptionId} className={`transition-all duration-500 ${isItemHighlighted(subscriptionId) ? "bg-blue-50 ring-2 ring-inset ring-brand-blue/25" : ""}`}>
                    <SubscriptionRow
                      subscription={subscription}
                      plan={plans.find((plan) => getPlanId(plan) === planId)}
                      tenantName={tenantName}
                      readOnly={subscriptionReadOnly(subscription)}
                      hasvikAdmin={hasvikAdmin}
                      tenantAdmin={tenantAdmin}
                      busy={busyThisSubscription}
                      onApprove={(approvalSubscription) => {
                        setOperationError("");
                        setManualVerificationConfirmed(false);
                        setSubscriptionToApprove(approvalSubscription);
                      }}
                      onRenew={(renewalSubscription) => {
                        setOperationError("");
                        setSubscriptionToRenew(renewalSubscription);
                      }}
                      onCancel={setSubscriptionToCancel}
                      onReject={setSubscriptionToReject}
                    />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {tenantAdmin && (
          <section id="available-plans" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
                  Available subscription plans
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Choose a plan and submit it for HASVIK admin review. Payments are handled manually.
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
                    disabled={
                      !canChoosePlan ||
                      requestExistsForCreateTenant ||
                      !Number.isFinite(plan.price) ||
                      plan.price < 0
                    }
                    onChoose={openCheckout}
                  />
                ))}
              </div>
            )}
          </section>
          )}

          <DialogPrimitive.Root
            open={Boolean(chosenPlan)}
            onOpenChange={(open) => {
              if (
                !open &&
                !createMutation.isPending &&
                !statusMutation.isPending
              ) {
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
                      Plan request
                    </span>
                    <DialogPrimitive.Title className="mt-3 text-xl font-bold tracking-tight text-[#0f172a]">
                      Request subscription plan
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-xs leading-5 text-[#64748b]">
                      Submit this plan to HASVIK admin for manual review and approval.
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close
                    aria-label="Close"
                    disabled={createMutation.isPending || statusMutation.isPending}
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
                    <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[10px] leading-4 text-blue-950">
                      <FileText className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      Payment is handled manually outside the CRM. Submitting creates a pending request; workspace access begins only after HASVIK admin approval.
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
                        onClick={() => {
                          setChosenPlan(null);
                        }}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createMutation.isPending ||
                          !createTenantId ||
                          !chosenPlanHasValidPrice
                        }
                        className="rounded-xl bg-primary text-white"
                      >
                        {createMutation.isPending && <LoaderCircle className="size-4 animate-spin" />}
                        {createMutation.isPending ? "Submitting…" : "Request plan"}
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
            open={Boolean(subscriptionToApprove)}
            title="Approve subscription request?"
            description={
              subscriptionToApprove
                ? `Approve the pending request for ${
                    typeof subscriptionToApprove.plan === "object"
                      ? subscriptionToApprove.plan.name
                      : plans.find(
                          (plan) =>
                            getPlanId(plan) ===
                            getReferenceId(subscriptionToApprove.planId),
                        )?.name ?? "this subscription"
                  }. Approval activates workspace access.`
                : ""
            }
            confirmLabel="Approve request"
            destructive={false}
            pending={statusMutation.isPending}
            confirmDisabled={!manualVerificationConfirmed}
            onCancel={() => {
              setSubscriptionToApprove(null);
              setManualVerificationConfirmed(false);
              setOperationError("");
            }}
            onConfirm={() => {
              const id = subscriptionToApprove
                ? getSubscriptionId(subscriptionToApprove)
                : "";
              if (manualVerificationConfirmed) void activate(id);
            }}
          >
            <label className="mt-5 flex cursor-pointer items-start gap-3 border border-brand-green/20 bg-emerald-50/60 p-3.5">
              <Checkbox
                checked={manualVerificationConfirmed}
                onCheckedChange={(checked) =>
                  setManualVerificationConfirmed(checked === true)
                }
                className="mt-0.5"
              />
              <span className="text-xs leading-5 text-slate-700">
                <span className="block font-semibold text-slate-900">
                  Manual verification completed
                </span>
                <span className="block text-[10px] text-slate-500">
                  I have verified payment or commercial approval outside the CRM.
                </span>
              </span>
            </label>
            {operationError && (
              <p role="alert" className="mt-3 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {operationError}
              </p>
            )}
          </ManagementConfirmDialog>

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
                ? getSubscriptionId(subscriptionToRenew)
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
