"use client";

import { changedFields } from "@/lib/forms/changed-fields";

import { useListActionHighlight } from "@/hooks/use-list-action-highlight";

import { useMemo, useState, type FormEvent } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Building2,
  Check,
  ChartNoAxesCombined,
  CreditCard,
  Filter,
  LoaderCircle,
  RefreshCw,
  UsersRound,
  X,
} from "lucide-react";
import Actions from "@/components/common/Actions";
import KpiCards from "@/components/common/KpiCards";
import Breadcrumb from "@/components/common/Breadcrumb";
import ListPagination from "@/components/common/ListPagination";
import ListTableToolbar from "@/components/common/ListTableToolbar";
import { DataTableMobileCard, DataTableMobileList, DataTableShell } from "@/components/common/DataTableLayout";
import ManagementConfirmDialog from "@/components/common/ManagementConfirmDialog";
import ManagementRowActions from "@/components/common/ManagementRowActions";
import ListPageLayout from "@/components/layout/ListPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSubscriptionPlansQuery, useSubscriptionsQuery } from "@/hooks/use-subscriptions";
import {
  useTenantsQuery,
  useTenantsPageQuery,
  useUpdateTenant,
  useUpdateTenantStatus,
} from "@/hooks/use-tenants";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  getSubscriptionTenantId,
  hasCurrentSubscriptionAccess,
} from "@/lib/subscriptions/access";
import { useAuthStore } from "@/store/auth-store";
import { isSuperAdmin, isTenantAdmin } from "@/types/auth";
import type { Subscription, SubscriptionPlan } from "@/types/subscription";
import type { Tenant, UpdateTenantPayload } from "@/types/tenant";

type TenantFilter = "ALL" | "ACTIVE" | "INACTIVE";
type TenantDraft = Required<Pick<UpdateTenantPayload, "name" | "contactEmail" | "contactPhone">>;

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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function getActiveSubscription(
  subscriptions: Subscription[],
  tenantId: string,
) {
  return subscriptions
    .filter(
      (subscription) =>
        getSubscriptionTenantId(subscription) === tenantId &&
        hasCurrentSubscriptionAccess(subscription),
    )
    .sort(
      (a, b) =>
        Number(b.status?.toUpperCase() === "ACTIVE") -
        Number(a.status?.toUpperCase() === "ACTIVE"),
    )[0];
}

function SubscriptionSummary({
  subscription,
  plans,
}: {
  subscription?: Subscription;
  plans: SubscriptionPlan[];
}) {
  const planId = getPlanId(subscription?.planId);
  const plan =
    subscription?.plan ??
    plans.find((availablePlan) => getPlanId(availablePlan) === planId);

  if (!subscription) {
    return <span className="text-xs text-slate-500">No active subscription</span>;
  }

  return (
    <div className="min-w-40">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
        <CreditCard className="size-3.5 text-emerald-700" />
        {plan?.name ?? "Subscription plan"}
      </p>
      <p className="mt-1 text-[10px] text-slate-500">
        {subscription.endDate
          ? `Ends ${formatDate(subscription.endDate)}`
          : "End date not set"}
        {plan
          ? ` · ${formatPrice(plan.price, plan.currency)}`
          : ""}
      </p>
    </div>
  );
}

function TenantEditor({
  draft,
  error,
  saving,
  onChange,
  onCancel,
  onSubmit,
}: {
  draft: TenantDraft;
  error: string;
  saving: boolean;
  onChange: (draft: TenantDraft) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700">Organization name</span>
        <Input
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          required
          className="h-10 rounded-lg"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700">Contact email</span>
        <Input
          type="email"
          value={draft.contactEmail}
          onChange={(event) =>
            onChange({ ...draft, contactEmail: event.target.value })
          }
          className="h-10 rounded-lg"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-700">Contact phone</span>
        <Input
          type="tel"
          value={draft.contactPhone}
          onChange={(event) =>
            onChange({ ...draft, contactPhone: event.target.value })
          }
          className="h-10 rounded-lg"
        />
      </label>
      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel} className="rounded-lg">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="rounded-lg">
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

export default function TenantManagementPage() {
  const { highlightItem, isItemHighlighted } = useListActionHighlight("tenants");
  const user = useAuthStore((state) => state.user);
  const hasvikAdmin = isSuperAdmin(user);
  const tenantAdmin = isTenantAdmin(user);
  const subscriptionsQuery = useSubscriptionsQuery(user?.userId);
  const plansQuery = useSubscriptionPlansQuery();
  const updateMutation = useUpdateTenant();
  const statusMutation = useUpdateTenantStatus();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TenantFilter>("ACTIVE");
  const [sortValue, setSortValue] = useState("default");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [draft, setDraft] = useState<TenantDraft>();
  const [formError, setFormError] = useState("");
  const [tenantToToggle, setTenantToToggle] = useState<Tenant | null>(null);
  const [notice, setNotice] = useState("");
  const [operationError, setOperationError] = useState("");
  const needsCollection = Boolean(search.trim()) || sortValue !== "default" || filter === "ALL";
  const collectionQuery = useTenantsQuery(needsCollection, user?.userId);
  const pageQuery = useTenantsPageQuery({ page, limit, isActive: filter === "ACTIVE" }, !needsCollection, user?.userId);
  const activeCountQuery = useTenantsPageQuery({ page: 1, limit: 1, isActive: true }, showStats, user?.userId);
  const inactiveCountQuery = useTenantsPageQuery({ page: 1, limit: 1, isActive: false }, showStats, user?.userId);
  const tenantsQuery = needsCollection ? collectionQuery : pageQuery;
  const tenants = useMemo(() => needsCollection ? collectionQuery.data ?? [] : pageQuery.data?.data ?? [], [needsCollection, collectionQuery.data, pageQuery.data]);
  const tenantsPending = tenantsQuery.isPending;
  const tenantsError = tenantsQuery.isError;
  const tenantsErrorValue = tenantsQuery.error;
  const subscriptions = subscriptionsQuery.data ?? [];
  const plans = plansQuery.data ?? [];
  const activeCount = activeCountQuery.data?.total ?? 0;
  const inactiveCount = inactiveCountQuery.data?.total ?? 0;
  const filteredTenants = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matching = tenants.filter((tenant) => {
      if (filter === "ACTIVE" && !tenant.isActive) return false;
      if (filter === "INACTIVE" && tenant.isActive) return false;
      return (
        !query ||
        `${tenant.name} ${tenant.fullName ?? ""} ${tenant.contactEmail ?? ""} ${tenant.contactPhone ?? ""}`
          .toLowerCase()
          .includes(query)
      );
    });
    if (sortValue === "default") return matching;
    const [field, direction] = sortValue.split(":");
    return matching.sort((a, b) => {
      const comparison =
        field === "createdAt"
          ? (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
          : a.name.localeCompare(b.name);
      return direction === "desc" ? -comparison : comparison;
    });
  }, [filter, search, sortValue, tenants]);
  const total = needsCollection ? filteredTenants.length : pageQuery.data?.total ?? 0;
  const pagedTenants = needsCollection ? filteredTenants.slice((page - 1) * limit, page * limit) : tenants;
  if (!tenantsQuery.isPending && !tenantsQuery.isError && page > Math.max(1, Math.ceil(total / limit))) {
    setPage(Math.max(1, Math.ceil(total / limit)));
  }

  function openEdit(tenant: Tenant) {
    if (!tenant.isActive) return;
    setEditingTenant(tenant);
    setDraft({
      name: tenant.name,
      contactEmail: tenant.contactEmail ?? "",
      contactPhone: tenant.contactPhone ?? "",
    });
    setFormError("");
  }

  function closeEditor() {
    setEditingTenant(null);
    setDraft(undefined);
    setFormError("");
  }

  async function saveTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTenant || !draft || (tenants.find((tenant) => tenant.id === editingTenant.id) ?? editingTenant).isActive === false) return;
    setFormError("");
    try {
      const payload = changedFields({
        name: draft.name.trim(), contactEmail: draft.contactEmail.trim(), contactPhone: draft.contactPhone.trim(),
      }, {
        name: editingTenant.name.trim(), contactEmail: (editingTenant.contactEmail ?? "").trim(), contactPhone: (editingTenant.contactPhone ?? "").trim(),
      });
      if (Object.keys(payload).length) await updateMutation.mutateAsync({ id: editingTenant.id, payload });
      highlightItem(editingTenant.id);
      closeEditor();
      setNotice("Tenant details saved.");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  async function toggleTenantStatus() {
    if (!tenantToToggle) return;
    setOperationError("");
    try {
      await statusMutation.mutateAsync({
        id: tenantToToggle.id,
        isActive: !tenantToToggle.isActive,
      });
      highlightItem(tenantToToggle.id);
      setNotice(
        `${tenantToToggle.name} has been ${tenantToToggle.isActive ? "deactivated" : "activated"}.`,
      );
      setTenantToToggle(null);
    } catch (error) {
      setOperationError(getApiErrorMessage(error));
    }
  }

  function changeSort(value: string) {
    setSortValue(value);
    setPage(1);
  }

  return (
    <>
      <ListPageLayout
        breadcrumb={<Breadcrumb items={[{ label: "Tenant management" }]} />}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search tenants by name or contact"
        filters={
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="tenant-status-filter" className="text-xs font-medium text-slate-600">
              Status
            </label>
            <Select
              value={filter}
              onValueChange={(value) => {
                setFilter(value as TenantFilter);
                setPage(1);
              }}
            >
              <SelectTrigger id="tenant-status-filter" size="sm" className="w-40 rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-xs">All statuses</SelectItem>
                <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                <SelectItem value="INACTIVE" className="text-xs">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((visible) => !visible)}
        onResetFilters={() => {
          setSearch("");
          setFilter("ACTIVE");
          setPage(1);
        }}
        resultCount={total}
        showStats={showStats}
        stats={
          <KpiCards items={[
              { label: "Tenants", value: activeCount + inactiveCount, icon: UsersRound, tone: "text-primary bg-blue-50" },
              { label: "Active tenants", value: activeCount, icon: Check, tone: "text-emerald-700 bg-emerald-50" },
              { label: "Inactive tenants", value: inactiveCount, icon: X, tone: "text-slate-600 bg-slate-100" },
            ].map((item, index) => ({ ...item, tone: (["blue", "green", "slate"] as const)[index] }))} />
        }
        actions={
          <Actions
            primary={{
              label: "Refresh tenants",
              onSelect: () => {
                void tenantsQuery.refetch();
                if (showStats) {
                  void activeCountQuery.refetch();
                  void inactiveCountQuery.refetch();
                }
              },
              icon: <RefreshCw className="size-4" />,
            }}
            menuItems={[
              { label: showStats ? "Hide KPIs" : "Show KPIs", icon: <ChartNoAxesCombined className="size-4" />, onSelect: () => setShowStats((visible) => !visible) },
              { label: showFilters ? "Hide filters" : "Show filters", onSelect: () => setShowFilters((visible) => !visible), icon: <Filter className="size-4" /> },
            ]}
          />
        }
        content={
          <DataTableShell>
            <ListTableToolbar
              title={hasvikAdmin ? "Tenant workspaces" : "My workspace"}
              total={total}
              sortValue={sortValue}
              sortOptions={[
                { value: "default", label: "Default order" },
                { value: "name:asc", label: "Name A–Z" },
                { value: "name:desc", label: "Name Z–A" },
                { value: "createdAt:desc", label: "Newest first" },
                { value: "createdAt:asc", label: "Oldest first" },
              ]}
              onSortChange={changeSort}
            />
            {notice && (
              <p role="status" className="border-b border-slate-100 px-4 py-3 text-xs text-slate-700">
                {notice}
              </p>
            )}
            {operationError && (
              <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                {operationError}
              </p>
            )}
            {subscriptionsQuery.isError && (
              <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                Subscription details couldn’t be loaded. {getApiErrorMessage(subscriptionsQuery.error)}
              </p>
            )}
            {plansQuery.isError && (
              <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-800">
                Plan details couldn’t be loaded. {getApiErrorMessage(plansQuery.error)}
              </p>
            )}
            {tenantsPending ? (
              <div className="flex min-h-44 items-center justify-center">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-slate-500">Loading tenants…</span>
              </div>
            ) : tenantsError ? (
              <div className="px-5 py-12 text-center">
                <p role="alert" className="text-sm font-semibold text-slate-900">Tenants couldn’t be loaded</p>
                <p className="mt-1 text-xs text-slate-500">{getApiErrorMessage(tenantsErrorValue)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void tenantsQuery.refetch()}
                  className="mt-4 rounded-lg"
                >
                  Try again
                </Button>
              </div>
            ) : pagedTenants.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <Building2 className="mx-auto size-7 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {tenants.length === 0
                    ? "No tenants found"
                    : "No tenants match your filters"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {tenants.length === 0
                    ? "Tenant workspaces will appear here when they are available."
                    : "Try another search or status filter."}
                </p>
              </div>
            ) : (
              <>
                <DataTableMobileList>
                  {pagedTenants.map((tenant) => (
                    <DataTableMobileCard key={tenant.id} className={isItemHighlighted(tenant.id) ? "border-brand-blue bg-blue-50/80 ring-2 ring-brand-blue/20" : ""}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                            <Building2 className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{tenant.name}</p>
                            <p className="mt-0.5 break-all text-xs text-slate-600">{tenant.contactEmail || "No contact email"}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{tenant.contactPhone || "No contact phone"}</p>
                            <div className="mt-2"><StatusBadge active={tenant.isActive} /></div>
                          </div>
                        </div>
                        <TenantActions
                          tenant={tenant}
                          canManageTenants={hasvikAdmin || tenantAdmin}
                          disabled={statusMutation.isPending}
                          onEdit={() => openEdit(tenant)}
                          onToggle={() => setTenantToToggle(tenant)}
                        />
                      </div>
                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <SubscriptionSummary
                          subscription={getActiveSubscription(subscriptions, tenant.id)}
                          plans={plans}
                        />
                      </div>
                    </DataTableMobileCard>
                  ))}
                </DataTableMobileList>
                <div data-layout-desktop>
                  <Table className="w-full min-w-[850px] text-left">
                    <TableHeader>
                      <TableRow className="border-b border-[#f1f5f9] hover:bg-transparent">
                        <TableHead className="py-4 pl-6 pr-4">Workspace</TableHead>
                        <TableHead className="px-4 py-4">Contact</TableHead>
                        <TableHead className="px-4 py-4">Subscription</TableHead>
                        <TableHead className="px-4 py-4">Status</TableHead>
                        <TableHead className="sticky right-0 bg-slate-50 py-4 pl-4 pr-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
                      {pagedTenants.map((tenant) => (
                        <TableRow key={tenant.id} className={`group border-b border-[#f1f5f9] transition-colors duration-500 hover:bg-[#f8fafc]/80 ${isItemHighlighted(tenant.id) ? "bg-blue-50 ring-2 ring-inset ring-brand-blue/25" : ""}`}>
                          <TableCell className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Building2 className="size-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#0f172a]">{tenant.name}</p>
                                <p className="mt-0.5 text-xs text-[#64748b]">{tenant.fullName || "Workspace account"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <p className="text-xs text-slate-700">{tenant.contactEmail || "No contact email"}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{tenant.contactPhone || "No contact phone"}</p>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <SubscriptionSummary
                              subscription={getActiveSubscription(subscriptions, tenant.id)}
                              plans={plans}
                            />
                          </TableCell>
                          <TableCell className="px-4 py-4"><StatusBadge active={tenant.isActive} /></TableCell>
                          <TableCell className="sticky right-0 bg-white py-4 pl-4 pr-6 group-hover:bg-slate-50">
                            <TenantActions
                              tenant={tenant}
                              canManageTenants={hasvikAdmin || tenantAdmin}
                              disabled={statusMutation.isPending}
                              onEdit={() => openEdit(tenant)}
                              onToggle={() => setTenantToToggle(tenant)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ListPagination
                  total={total}
                  page={page}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(nextLimit) => {
                    setLimit(nextLimit);
                    setPage(1);
                  }}
                />
              </>
            )}
          </DataTableShell>
        }
      />

      <DialogPrimitive.Root
        open={Boolean(editingTenant)}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) closeEditor();
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl outline-none sm:p-6">
            <div className="mb-5">
              <DialogPrimitive.Title className="text-lg font-bold text-slate-900">
                Edit workspace details
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs leading-5 text-slate-500">
                Update the organization name and contact information.
              </DialogPrimitive.Description>
            </div>
            {draft && (
              <TenantEditor
                draft={draft}
                error={formError}
                saving={updateMutation.isPending}
                onChange={setDraft}
                onCancel={closeEditor}
                onSubmit={(event) => void saveTenant(event)}
              />
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ManagementConfirmDialog
        open={Boolean(tenantToToggle)}
        title={tenantToToggle?.isActive ? "Deactivate tenant?" : "Activate tenant?"}
        description={
          tenantToToggle
            ? `${tenantToToggle.name} will be ${tenantToToggle.isActive ? "unable" : "able"} to access the workspace.`
            : ""
        }
        confirmLabel={tenantToToggle?.isActive ? "Deactivate tenant" : "Activate tenant"}
        destructive={Boolean(tenantToToggle?.isActive)}
        pending={statusMutation.isPending}
        onCancel={() => setTenantToToggle(null)}
        onConfirm={() => void toggleTenantStatus()}
      />
    </>
  );
}

function TenantActions({
  tenant,
  canManageTenants,
  disabled,
  onEdit,
  onToggle,
}: {
  tenant: Tenant;
  canManageTenants: boolean;
  disabled: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <ManagementRowActions
      readOnly={tenant.isActive === false}
      activity={{ entityType: "TENANT", entityId: tenant.id, name: tenant.name }}
      editLabel={`Edit ${tenant.name}`}
      {...(canManageTenants
        ? {
            actionLabel: tenant.isActive ? "Deactivate tenant" : "Activate tenant",
            actionDestructive: tenant.isActive,
            onAction: onToggle,
          }
        : {})}
      disabled={disabled}
      showEdit={canManageTenants}
      onEdit={onEdit}
    />
  );
}
