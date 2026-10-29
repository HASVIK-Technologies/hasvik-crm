"use client";

import { isRecordInactive } from "@/lib/records/activity";
import { EntityActivityDialog } from "@/components/common/EntityActivityButton";
import TableActionButton from "@/components/common/TableActionButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

import { useListActionHighlight } from "@/hooks/use-list-action-highlight";

import { useMemo, useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  ArrowRight,
  MoreVertical,
  History,
  Pause,
  Play,
  Ban,
  CheckCircle2,
  XCircle,
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
  useSubscriptionsPageQuery,
  useUpdateSubscriptionStatus,
} from "@/hooks/use-subscriptions";
import { useTenantQuery, useTenantsQuery } from "@/hooks/use-tenants";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { buildRenewalPayload } from "@/lib/subscriptions/renewal";
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
import { DataTableShell, DataTableHeader, DataTableMobileCard, DataTableMobileList } from "@/components/common/DataTableLayout";
import ListPagination from "@/components/common/ListPagination";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import Actions from "@/components/common/Actions";
import Breadcrumb from "@/components/common/Breadcrumb";
import ResponsiveFilters from "@/components/common/ResponsiveFilters";
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
    <li className="flex items-center justify-between gap-3 text-xs text-ink-soft">
      <span className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted" />
        {label}
      </span>
      <span className="font-semibold text-ink-soft">{getLimit(value)}</span>
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
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface shadow-card ${
        featured
          ? "border-brand-strong/35 ring-1 ring-brand/10"
          : "border-line"
      }`}
    >
      {featured && (
        <div className="flex items-center gap-1.5 border-b border-brand-soft bg-brand-soft px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Popular choice
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
            <Gem className="size-3" aria-hidden="true" />
            {cycleLabels[plan.billingCycle] ?? plan.billingCycle}
          </span>
          <span className="rounded-full bg-surface-2 px-2 py-1 text-xs font-semibold text-muted">
            {plan.code}
          </span>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-ink">{plan.name}</h3>
        <p className="mt-1 min-h-10 text-xs leading-5 text-muted">
          {plan.description || "A flexible plan for your workspace."}
        </p>
        <div className="mb-5 mt-4 rounded-xl bg-surface-2 px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-xs text-muted">
              {plan.billingCycle === "MONTHLY"
                ? "/ month"
                : plan.billingCycle === "YEARLY"
                  ? "/ year"
                  : "one time"}
            </span>
          </div>
        </div>
        {plan.limits && (
          <ul className="mb-5 space-y-2.5 rounded-xl border border-surface-2 p-3.5">
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
                className="flex items-start gap-2.5 text-xs leading-5 text-ink-soft"
                title={feature.description}
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-accent-strong" />
                <span>
                  <span className="font-semibold">{feature.name}</span>
                  {feature.description && (
                    <span className="mt-0.5 block text-xs leading-4 text-muted">
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
            featured ? "bg-btn text-white hover:bg-btn/90" : ""
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
  onSuspensionChange,
  highlighted,
  mobile = false,
}: {
  mobile?: boolean;
  highlighted: boolean;
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
  onSuspensionChange: (subscription: Subscription) => void;
}) {
  const id = getSubscriptionId(subscription);
  const status = normalizeStatus(subscription.status);
  const embeddedPlan = subscription.plan ?? (typeof subscription.planId === "object" ? subscription.planId : undefined);
  const planName =
    embeddedPlan?.name ??
    plan?.name ??
    "Subscription plan";
  const amount = embeddedPlan?.price ?? plan?.price;
  const currency = embeddedPlan?.currency ?? plan?.currency ?? "INR";
  const billingCycle = embeddedPlan?.billingCycle ?? plan?.billingCycle ?? (typeof subscription.planId === "object" ? subscription.planId.billingCycle : undefined);

  const [activityOpen, setActivityOpen] = useState(false);
  const writable = !readOnly && Boolean(id);
  const canApprove = writable && hasvikAdmin && status === "PENDING";
  const canRenew = writable && (hasvikAdmin || tenantAdmin) && (status === "ACTIVE" || status === "EXPIRED") && billingCycle !== "LIFETIME";
  const actions = (
    <div className="flex items-center justify-end gap-1.5">
      {canRenew && <TableActionButton tooltip="Renew subscription" tone="brand" disabled={busy} onClick={() => onRenew(subscription)}><RefreshCw className="size-4" /></TableActionButton>}
      {id && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TableActionButton tooltip="More actions" aria-label={`More actions for ${planName}`}><MoreVertical className="size-4" /></TableActionButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-surface" onCloseAutoFocus={(event) => { if (activityOpen) event.preventDefault(); }}>
          <DropdownMenuItem onSelect={() => setActivityOpen(true)} className="cursor-pointer gap-2 text-xs"><History className="size-3.5" />View activity</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { void navigator.clipboard.writeText(id).then(() => toast.success("Subscription ID copied."), () => toast.error("Unable to copy the subscription ID.")); }} className="cursor-pointer gap-2 text-xs"><Copy className="size-3.5" />Copy subscription ID</DropdownMenuItem>
          {writable && ((hasvikAdmin && (status === "ACTIVE" || status === "SUSPENDED" || status === "PENDING")) || (tenantAdmin && status === "ACTIVE")) && <DropdownMenuSeparator />}
          {writable && hasvikAdmin && (status === "ACTIVE" || status === "SUSPENDED") && <DropdownMenuItem disabled={busy} onSelect={() => onSuspensionChange(subscription)} className="cursor-pointer gap-2 text-xs">
            {status === "SUSPENDED" ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}{status === "SUSPENDED" ? "Resume subscription" : "Suspend subscription"}
          </DropdownMenuItem>}
          {writable && (hasvikAdmin || tenantAdmin) && status === "ACTIVE" && <DropdownMenuItem disabled={busy} onSelect={() => onCancel(subscription)} className="cursor-pointer gap-2 text-xs text-bad focus:text-bad"><Ban className="size-3.5" />Cancel subscription</DropdownMenuItem>}
          {canApprove && <DropdownMenuItem disabled={busy} onSelect={() => onApprove(subscription)} className="cursor-pointer gap-2 text-xs text-ok focus:text-ok"><CheckCircle2 className="size-3.5" />Approve</DropdownMenuItem>}
          {canApprove && <DropdownMenuItem disabled={busy} onSelect={() => onReject(subscription)} className="cursor-pointer gap-2 text-xs text-bad focus:text-bad"><XCircle className="size-3.5" />Reject request</DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>}
    </div>
  );
  const planSummary = <div className="flex min-w-0 items-center gap-3">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><CreditCard className="size-4.5" /></span>
    <div className="min-w-0">
      <p className="max-w-56 truncate text-sm font-semibold text-ink" title={planName}>{planName}</p>
      <p className="mt-0.5 text-xs text-muted">{amount !== undefined ? formatPrice(amount, currency) : "Price unavailable"}{billingCycle && ` / ${cycleLabels[billingCycle] ?? billingCycle}`}</p>
    </div>
  </div>;
  const term = <div className="space-y-1 text-xs text-ink-soft">
    {status === "PENDING" ? <p>Requested {formatDate(subscription.createdAt)}</p> : <><p>Starts {formatDate(subscription.startDate)}</p><p className="text-muted">{billingCycle === "LIFETIME" ? "No expiry" : `Ends ${formatDate(subscription.endDate)}`}</p></>}
  </div>;
  const activity = <EntityActivityDialog entityType="SUBSCRIPTION" entityId={id} name={planName} open={activityOpen} onOpenChange={setActivityOpen} />;
  const readOnlyMessage = readOnly && <p className="mt-1 text-xs text-muted">Read-only: tenant or business inactive.</p>;

  if (mobile) return <>
    {activity}
    <DataTableMobileCard className={highlighted ? "border-brand-strong bg-brand-soft/80 ring-2 ring-brand/20" : ""}>
      <div className="flex items-start justify-between gap-3">{planSummary}{actions}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-ink-soft">{tenantName}</p><StatusBadge status={status} /></div>
      <div className="mt-3 flex items-end justify-between gap-3">{term}<p className="text-xs text-muted">{subscription.autoRenew ? "Auto-renew on" : "Auto-renew off"}</p></div>
      {readOnlyMessage}
    </DataTableMobileCard>
  </>;

  return <>
    {activity}
    <TableRow className={`group ${highlighted ? "bg-brand-soft/80 ring-2 ring-inset ring-brand/20" : ""}`}>
      <TableCell className="py-4 pl-6 pr-4">{planSummary}</TableCell>
      <TableCell className="max-w-56 px-4 py-4 text-xs font-medium text-ink-soft"><p className="truncate" title={tenantName}>{tenantName}</p>{readOnlyMessage}</TableCell>
      <TableCell className="px-4 py-4"><StatusBadge status={status} /></TableCell>
      <TableCell className="px-4 py-4">{term}</TableCell>
      <TableCell className="px-4 py-4 text-xs text-muted">{subscription.autoRenew ? "On" : "Off"}</TableCell>
      <TableCell className={`sticky right-0 py-4 pl-4 pr-6 ${highlighted ? "bg-brand-soft" : "bg-surface group-hover:bg-surface-2"}`}>{actions}</TableCell>
    </TableRow>
  </>;
}

export default function SubscriptionsPage() {
  const { highlightItem, isItemHighlighted } = useListActionHighlight("subscriptions");
  const user = useAuthStore((state) => state.user);
  const hasvikAdmin = isSuperAdmin(user);
  const tenantAdmin = isTenantAdmin(user);
  const plansQuery = useSubscriptionPlansQuery();
  const eligibilityQuery = useSubscriptionsQuery(user?.userId, tenantAdmin && Boolean(user?.tenantId));
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

  const embeddedTenant = eligibilityQuery.data?.find(
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
  const [statusFilter, setStatusFilter] = useState<SubscriptionFilter>("ALL");
  const [showFilters, setShowFilters] = useState(true);
  const [notice, setNotice] = useState("");
  const [operationError, setOperationError] = useState("");
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<Subscription | null>(null);
  const [subscriptionToRenew, setSubscriptionToRenew] =
    useState<Subscription | null>(null);
  const [renewalEndDate, setRenewalEndDate] = useState("");
  const [renewalNotes, setRenewalNotes] = useState("");
  const [subscriptionToReject, setSubscriptionToReject] =
    useState<Subscription | null>(null);
  const [subscriptionToApprove, setSubscriptionToApprove] =
    useState<Subscription | null>(null);
  const [suspensionChange, setSuspensionChange] = useState<{
    subscription: Subscription;
    status: "SUSPENDED" | "ACTIVE";
  } | null>(null);
  const [manualVerificationConfirmed, setManualVerificationConfirmed] =
    useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const subscriptionsQuery = useSubscriptionsPageQuery({
    page, limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    tenantId: hasvikAdmin ? undefined : ownTenantId,
  }, user?.userId, Boolean(user) && (hasvikAdmin || Boolean(ownTenantId)));
  const pendingQuery = useSubscriptionsPageQuery({ page: 1, limit: 1, status: "PENDING" }, user?.userId, hasvikAdmin);
  const subscriptions = subscriptionsQuery.data?.data ?? [];
  const visibleSubscriptions = subscriptions;
  const total = subscriptionsQuery.data?.total ?? 0;
  const pendingSubscriptionsCount = pendingQuery.data?.total;
  if (subscriptionsQuery.isSuccess && page > Math.max(1, Math.ceil(total / limit))) {
    setPage(Math.max(1, Math.ceil(total / limit)));
  }
  const createTenantId = ownTenantId ?? "";
  const requestExistsForCreateTenant = (eligibilityQuery.data ?? []).some(
    (subscription) =>
      getSubscriptionTenantId(subscription) === createTenantId &&
      (hasCurrentSubscriptionAccess(subscription) ||
        normalizeStatus(subscription.status) === "PENDING" ||
        normalizeStatus(subscription.status) === "SUSPENDED"),
  );
  const canChoosePlan =
    Boolean(createTenantId) && ownTenant?.isActive === true &&
    !hasvikAdmin &&
    !requestExistsForCreateTenant &&
    !eligibilityQuery.isPending &&
    !eligibilityQuery.isError &&
    !ownTenantQuery.isError;

  const visiblePlans = plans;

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
    if (renewMutation.isPending || !subscriptionToRenew || (!hasvikAdmin && !tenantAdmin)) return false;
    if (subscriptionReadOnly(subscriptions.find((item) => getSubscriptionId(item) === id))) return false;
    setOperationError("");
    try {
      const payload = buildRenewalPayload(subscriptionToRenew, renewalEndDate, renewalNotes);
      const renewed = await renewMutation.mutateAsync({ id, payload });
      highlightItem(id);
      setNotice(renewed.status === "PENDING" ? "Renewal submitted and awaiting HASVIK admin approval." : "Subscription renewed.");
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

  async function changeSuspension() {
    if (!hasvikAdmin || !suspensionChange || statusMutation.isPending) return;
    const { subscription, status } = suspensionChange;
    const id = getSubscriptionId(subscription);
    const latest = subscriptions.find((item) => getSubscriptionId(item) === id);
    if (!id || subscriptionReadOnly(latest)) return;
    const expectedStatus = status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    if (normalizeStatus(latest?.status) !== expectedStatus) {
      setOperationError("The subscription status has changed. Close this dialog and refresh before trying again.");
      return;
    }
    setOperationError("");
    try {
      await statusMutation.mutateAsync({ id, status });
      highlightItem(id);
      setNotice(status === "SUSPENDED" ? "Subscription suspended. It no longer grants workspace access." : "Subscription resumed. Workspace access follows its current term dates.");
      setSuspensionChange(null);
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  const busySubscriptionId = renewMutation.isPending
    ? renewMutation.variables?.id
    : statusMutation.variables?.id;
  const busy =
    createMutation.isPending ||
    renewMutation.isPending ||
    statusMutation.isPending;
  const chosenPlanHasValidPrice =
    chosenPlan !== null &&
    Number.isFinite(chosenPlan.price) &&
    chosenPlan.price >= 0;

  function renderSubscriptionRows(mobile = false) {
    return visibleSubscriptions.map((subscription) => {
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
      <SubscriptionRow
        key={subscriptionId}
        mobile={mobile}
        highlighted={isItemHighlighted(subscriptionId)}
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
          setRenewalEndDate("");
          setRenewalNotes("");
          setOperationError("");
          setSubscriptionToRenew(renewalSubscription);
        }}
        onCancel={setSubscriptionToCancel}
        onReject={setSubscriptionToReject}
        onSuspensionChange={(subscription) => {
          setOperationError("");
          setSuspensionChange({ subscription, status: normalizeStatus(subscription.status) === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" });
        }}
      />
    );
  });
  }

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Subscriptions" }]} />}
      filters={tenantAdmin || hasvikAdmin ? <ResponsiveFilters onReset={() => { setStatusFilter("ALL"); setPage(1); }} fields={[{ key: "status", label: "Status", active: statusFilter !== "ALL", reset: () => { setStatusFilter("ALL"); setPage(1); }, control: <Select
              value={statusFilter}
              onValueChange={(value) => { setStatusFilter(value as SubscriptionFilter); setPage(1); }}
            >
              <SelectTrigger id="subscription-status-filter" aria-label="Subscription status" size="sm" className="w-48 rounded-xl text-xs">
                <SelectValue>
                  {statusFilter === "ALL" ? <span className="text-ink-soft">All statuses</span> : <StatusBadge status={statusFilter} />}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-surface">
                <SelectItem value="ALL" className="rounded-xl py-2.5 text-xs">All statuses</SelectItem>
                {Object.entries(SUBSCRIPTION_STATUS_VISUALS).map(([status, visual]) => <SelectItem key={status} value={status} textValue={visual.label} className="rounded-xl py-2.5 text-xs"><span className="inline-flex items-center gap-2.5"><span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${visual.dot}`} /><span>{visual.label}</span></span></SelectItem>)}
              </SelectContent>
            </Select> }]} /> : undefined}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters((visible) => !visible)}
      onResetFilters={() => {
        setStatusFilter("ALL");
        setPage(1);
      }}
      resultCount={total}
      showStats={false}
      actions={
        <Actions
          primary={{
            label: hasvikAdmin ? "Review pending requests" : "Explore plans",
            onSelect: () => {
              if (hasvikAdmin) { setStatusFilter("PENDING"); setPage(1); }
              document
                .getElementById(
                  hasvikAdmin ? "subscription-requests" : "available-plans",
                )
                ?.scrollIntoView({ behavior: "smooth" });
            },
            icon: <ArrowRight className="size-4" />,
          }}
          menuItems={tenantAdmin || hasvikAdmin ? [
            {
              label: showFilters ? "Hide filters" : "Show filters",
              desktopOnly: true,
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
              <StatusBadge status="PENDING" label={pendingQuery.isError ? "Queue unavailable" : pendingSubscriptionsCount === undefined ? "Loading queue" : `${pendingSubscriptionsCount} awaiting review`} className="w-fit px-3 py-1.5 text-xs" />
            </div>
          ) : (
            <div className="flex justify-end">
              <span className="inline-flex w-fit max-w-full items-center rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
                <Building2 className="mr-1.5 size-3.5 shrink-0 text-muted" aria-hidden="true" />
                <span className="truncate">{ownTenantName ?? user?.fullName ?? "My workspace"}</span>
              </span>
            </div>
          )}

          {notice && (
            <p role="status" className="rounded-xl border border-ok/30 bg-ok-soft px-4 py-3 text-xs text-ok">
              {notice}
            </p>
          )}
          {operationError && (
            <p role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-xs text-bad">
              {operationError}
            </p>
          )}

          {!hasvikAdmin && !ownTenantId && (
            <div role="alert" className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-xs leading-5 text-warn">
              Your account is missing a workspace ID. Subscription requests are unavailable until your workspace administrator restores the tenant ID on your account.
            </div>
          )}

          {hasvikAdmin && tenantsQuery.isError && (
            <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-xs text-bad">
              Tenant names couldn’t be loaded. {getApiErrorMessage(tenantsQuery.error)}
            </div>
          )}

          {!hasvikAdmin && ownTenantId && ownTenantQuery.isError && (
            <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-xs text-bad">
              Workspace details couldn’t be loaded. {getApiErrorMessage(ownTenantQuery.error)}
            </div>
          )}

          {tenantAdmin && eligibilityQuery.isError && <p role="alert" className="text-sm text-bad">Workspace subscription eligibility could not be verified. <button type="button" onClick={() => void eligibilityQuery.refetch()} className="underline">Try again</button></p>}

          {requestExistsForCreateTenant && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-brand-soft bg-brand-soft px-4 py-3">
              <CircleHelp className="mt-0.5 size-4 shrink-0 text-brand-strong" />
              <p className="text-xs leading-5 text-brand-strong">
                Your workspace has an active subscription, a suspended subscription, or a pending request. Contact a HASVIK admin to resolve a suspension. Another plan can be requested once the current subscription or request is resolved.
              </p>
            </div>
          )}

          <TooltipProvider><DataTableShell id="subscription-requests" aria-label="Current subscriptions">
            <DataTableHeader
              title={hasvikAdmin ? "Subscriptions" : "Your subscriptions"}
              total={total}
              description="Review subscription plans, terms, and requests."
              actions={<Button type="button" variant="outline" size="sm" disabled={subscriptionsQuery.isFetching} onClick={() => { void subscriptionsQuery.refetch(); if (hasvikAdmin) void pendingQuery.refetch(); else void eligibilityQuery.refetch(); }} className="h-8 text-xs">
                <RefreshCw className={`size-3.5 ${subscriptionsQuery.isFetching ? "animate-spin" : ""}`} />Refresh
              </Button>}
            />
            {subscriptionsQuery.isPending ? (
              <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted">
                <LoaderCircle className="size-4 animate-spin" />
                Loading subscriptions…
              </div>
            ) : subscriptionsQuery.isError ? (
              <div className="px-5 py-10 text-center">
                <p role="alert" className="text-sm font-semibold text-ink">
                  Subscriptions couldn’t be loaded
                </p>
                <p className="mt-1 text-xs text-muted">
                  {getApiErrorMessage(subscriptionsQuery.error)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => void subscriptionsQuery.refetch()} className="mt-4 rounded-lg">
                  Try again
                </Button>
              </div>
            ) : visibleSubscriptions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CreditCard className="mx-auto size-6 text-muted" />
                <p className="mt-3 text-sm font-semibold text-ink">
                  {hasvikAdmin
                    ? statusFilter === "PENDING"
                        ? "No pending subscription requests"
                        : "No subscriptions match this status"
                    : "No subscriptions found"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {hasvikAdmin
                    ? statusFilter === "PENDING"
                        ? "New subscription requests from tenant admins will appear here."
                        : "Choose another status to review subscription history."
                    : "Choose an available plan below to create a subscription."}
                </p>
              </div>
            ) : (
              <>
                <DataTableMobileList>{renderSubscriptionRows(true)}</DataTableMobileList>
                <div data-layout-desktop className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead className="py-4 pl-6 pr-4">Subscription</TableHead>
                      <TableHead className="px-4 py-4">Workspace</TableHead>
                      <TableHead className="px-4 py-4">Status</TableHead>
                      <TableHead className="px-4 py-4">Term</TableHead>
                      <TableHead className="px-4 py-4">Auto-renew</TableHead>
                      <TableHead className="sticky right-0 bg-surface-2 py-4 pl-4 pr-6 text-right">Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>{renderSubscriptionRows()}</TableBody>
                  </Table>
                </div>
              </>
            )}
            {subscriptionsQuery.isSuccess && <ListPagination total={total} page={page} limit={limit} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />}
          </DataTableShell></TooltipProvider>

          {tenantAdmin && (
          <section id="available-plans" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink">
                  Available subscription plans
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Choose a plan and submit it for HASVIK admin review. Payments are handled manually.
                </p>
              </div>
              {!plansQuery.isPending && !plansQuery.isError && (
                <span className="text-xs font-medium text-muted">
                  {visiblePlans.length} {visiblePlans.length === 1 ? "plan" : "plans"}
                </span>
              )}
            </div>
            {plansQuery.isPending ? (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-line bg-surface">
                <LoaderCircle className="size-5 animate-spin text-brand-strong" />
                <span className="ml-2 text-sm text-muted">Loading plans…</span>
              </div>
            ) : plansQuery.isError ? (
              <div className="rounded-2xl border border-bad-soft bg-surface p-8 text-center">
                <p className="text-sm font-semibold text-ink">Plans couldn’t be loaded</p>
                <p className="mt-1 text-xs text-muted">{getApiErrorMessage(plansQuery.error)}</p>
                <Button variant="outline" size="sm" onClick={() => void plansQuery.refetch()} className="mt-4 rounded-lg">
                  Try again
                </Button>
              </div>
            ) : visiblePlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-12 text-center">
                <CreditCard className="mx-auto size-6 text-muted" />
                <p className="mt-3 text-sm font-semibold text-ink-soft">
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
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px]" />
              <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-2xl outline-none sm:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-strong">
                      <CreditCard className="size-3" />
                      Plan request
                    </span>
                    <DialogPrimitive.Title className="mt-3 text-xl font-bold tracking-tight text-ink">
                      Request subscription plan
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-xs leading-5 text-muted">
                      Submit this plan to HASVIK admin for manual review and approval.
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close
                    aria-label="Close"
                    disabled={createMutation.isPending || statusMutation.isPending}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
                  >
                    <X className="size-4" />
                  </DialogPrimitive.Close>
                </div>
                {chosenPlan && (
                  <form onSubmit={(event) => void submitSubscription(event)} className="space-y-5">
                    <div className="rounded-xl border border-line bg-surface-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Selected plan</p>
                      <p className="mt-1 text-base font-bold text-ink">{chosenPlan.name}</p>
                      <p className="mt-1 text-sm font-semibold text-brand-strong">
                        {formatPrice(chosenPlan.price, chosenPlan.currency)}
                      </p>
                      {chosenPlan.description && (
                        <p className="mt-2 text-xs leading-5 text-ink-soft">{chosenPlan.description}</p>
                      )}
                    </div>
                    <div className="flex items-start gap-2 rounded-xl border border-brand-soft bg-brand-soft p-3 text-xs leading-4 text-brand-strong">
                      <FileText className="mt-0.5 size-3.5 shrink-0 text-brand-strong" />
                      Payment is handled manually outside the CRM. Submitting creates a pending request; workspace access begins only after HASVIK admin approval.
                    </div>
                    {operationError && (
                      <p role="alert" className="rounded-xl border border-bad/30 bg-bad-soft p-3 text-xs text-bad">
                        {operationError}
                      </p>
                    )}
                    <div className="flex flex-col-reverse gap-2 border-t border-surface-2 pt-4 sm:flex-row sm:justify-end">
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
                        className="rounded-xl bg-btn text-white"
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
              <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px]" />
              <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-5 shadow-2xl outline-none sm:p-7">
                <DialogPrimitive.Title className="text-lg font-bold text-ink">
                  Cancel subscription?
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-2 text-xs leading-5 text-ink-soft">
                  {subscriptionToCancel && (
                    <>
                      Cancel {typeof subscriptionToCancel.plan === "object"
                        ? subscriptionToCancel.plan.name
                        : plans.find(
                            (plan) =>
                              getPlanId(plan) === getReferenceId(subscriptionToCancel.planId),
                          )?.name ?? "this subscription"}
                      . The plan will remain active until{" "}
                      <span className="font-semibold text-ink">
                        {formatDate(subscriptionToCancel.endDate)}
                      </span>
                      . Access will end after the current subscription period.
                    </>
                  )}
                </DialogPrimitive.Description>
                {operationError && (
                  <p role="alert" className="mt-4 rounded-lg border border-bad/30 bg-bad-soft p-3 text-xs text-bad">
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
                    className="rounded-xl bg-warn text-white hover:bg-warn"
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
            <label className="mt-5 flex cursor-pointer items-start gap-3 border border-accent/20 bg-ok-soft/60 p-3.5">
              <Checkbox
                checked={manualVerificationConfirmed}
                onCheckedChange={(checked) =>
                  setManualVerificationConfirmed(checked === true)
                }
                className="mt-0.5"
              />
              <span className="text-xs leading-5 text-ink-soft">
                <span className="block font-semibold text-ink">
                  Manual verification completed
                </span>
                <span className="block text-xs text-muted">
                  I have verified payment or commercial approval outside the CRM.
                </span>
              </span>
            </label>
            {operationError && (
              <p role="alert" className="mt-3 border border-bad/30 bg-bad-soft p-3 text-xs text-bad">
                {operationError}
              </p>
            )}
          </ManagementConfirmDialog>

          <ManagementConfirmDialog
            open={Boolean(suspensionChange)}
            title={suspensionChange?.status === "SUSPENDED" ? "Suspend subscription?" : "Resume subscription?"}
            description={suspensionChange?.status === "SUSPENDED"
              ? "This subscription will stop granting workspace access immediately. A HASVIK admin can resume it later."
              : "This will reactivate the subscription using its existing start and end dates. An expired term will still require renewal."}
            confirmLabel={suspensionChange?.status === "SUSPENDED" ? "Suspend subscription" : "Resume subscription"}
            destructive={suspensionChange?.status === "SUSPENDED"}
            pending={statusMutation.isPending}
            onCancel={() => { setSuspensionChange(null); setOperationError(""); }}
            onConfirm={() => void changeSuspension()}
          >
            {operationError && <p role="alert" className="text-sm text-bad">{operationError}</p>}
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
                  }. Leave the end date blank to renew using the plan billing cycle.`
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
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-ink-soft">
                Renewal end date (optional)
                <input type="date" value={renewalEndDate} onChange={(event) => setRenewalEndDate(event.target.value)} disabled={renewMutation.isPending} className="mt-2 block w-full border border-line p-2" />
              </label>
              <label className="block text-sm font-medium text-ink-soft">
                Renewal notes (optional)
                <textarea value={renewalNotes} onChange={(event) => setRenewalNotes(event.target.value)} maxLength={1000} disabled={renewMutation.isPending} className="mt-2 block w-full border border-line p-2" rows={3} />
              </label>
              {operationError && <p role="alert" className="text-sm text-bad">{operationError}</p>}
            </div>
          </ManagementConfirmDialog>

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
