"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { ChartNoAxesCombined, Filter, Plus } from "lucide-react";
import Actions from "@/components/common/Actions";
import {
  BusinessStats,
  BusinessFilters,
  BusinessKanban,
  BusinessTable,
  SearchWithSuggestions,
} from "@/components/businesses";
import type { BusinessItem } from "@/types/business";
import {
  useBusinessesQuery,
  useBusinessKpisQuery,
} from "@/hooks/use-businesses";
import { useBusinessListStore } from "@/store/business-list-store";
import {
  buildBusinessListParams,
  buildBusinessKpiParams,
  filtersToSearchParams,
  searchParamsToFilters,
} from "@/lib/business/query-builder";
import ListPageLayout from "@/components/layout/ListPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";
import BusinessViewToggle from "@/components/businesses/BusinessViewToggle";
import ActiveFilterChips, { type FilterChip } from "@/components/common/ActiveFilterChips";
import { useLeadsData } from "@/hooks/use-analytics";
import { STAGE_LABELS } from "@/lib/analytics/metrics";
import {
  applyLeadViewFilter,
  CLIENT_FILTER_KEYS,
  needsClientFilter,
  parseLeadViewFilter,
  type LeadViewFilter,
} from "@/lib/analytics/lead-filters";

const EMPTY_BUSINESSES: BusinessItem[] = [];

function BusinessesContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasInitializedFromUrl = useRef(false);

  const {
    page,
    limit,
    sortBy,
    search,
    categoryId,
    categoryName,
    city,
    status,
    isActive,
    showStats,
    showFilters,
    view,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setCategory,
    setCity,
    setStatus,
    setIsActive,
    toggleStats,
    toggleFilters,
    setView,
    resetAllFilters,
    syncFromParams,
  } = useBusinessListStore();

  useEffect(() => {
    void useBusinessListStore.persist.rehydrate();
  }, []);

  // Filters the API cannot apply (owner, dates, staleness, ...) live in the URL and are applied client-side.
  const [viewFilter, setViewFilter] = useState<LeadViewFilter>(() => {
    const parsed = parseLeadViewFilter(searchParams ?? new URLSearchParams());
    return { owner: parsed.owner, createdFrom: parsed.createdFrom, createdTo: parsed.createdTo, updatedFrom: parsed.updatedFrom, updatedTo: parsed.updatedTo, nextFrom: parsed.nextFrom, nextTo: parsed.nextTo, staleDays: parsed.staleDays, open: parsed.open, source: parsed.source };
  });
  const clientMode = needsClientFilter(viewFilter);
  // The pipeline board needs every record so each column shows its true count, not just the current page.
  const loadEverything = clientMode || view === "kanban";

  // 1. Initial URL param synchronization on mount / URL direct landing
  useEffect(() => {
    if (!hasInitializedFromUrl.current) {
      hasInitializedFromUrl.current = true;
      if (searchParams && searchParams.toString().length > 0) {
        const parsed = searchParamsToFilters(searchParams);
        syncFromParams(parsed);
      }
    }
  }, [searchParams, syncFromParams]);

  // 2. Keep browser URL in sync as filters/pagination/sorting change
  useEffect(() => {
    if (!hasInitializedFromUrl.current) return;

    const sp = filtersToSearchParams({
      page,
      limit,
      sortBy,
      search,
      categoryId,
      categoryName,
      city,
      status,
      isActive,
    });

    for (const key of CLIENT_FILTER_KEYS) {
      const value = viewFilter[key];
      if (value !== undefined && value !== false) sp.set(key, value === true ? "1" : String(value));
    }

    const newQueryString = sp.toString();
    const currentQueryString = searchParams ? searchParams.toString() : "";

    if (newQueryString !== currentQueryString) {
      const targetUrl = newQueryString ? `${pathname}?${newQueryString}` : pathname;
      // Using window.history.replaceState avoids spamming browser history during typing/filtering
      window.history.replaceState(null, "", targetUrl);
    }
  }, [
    pathname,
    searchParams,
    page,
    limit,
    sortBy,
    search,
    categoryId,
    categoryName,
    city,
    status,
    isActive,
    viewFilter,
  ]);

  // 3. Centralized API queries (100% Server-Side)
  const listQueryParams = useMemo(
    () =>
      buildBusinessListParams({
        page,
        limit,
        sortBy,
        search,
        categoryId,
        city,
        status,
        isActive,
      }),
    [page, limit, sortBy, search, categoryId, city, status, isActive],
  );

  const kpiQueryParams = useMemo(
    () =>
      buildBusinessKpiParams({
        search,
        categoryId,
        city,
        status,
        isActive,
      }),
    [search, categoryId, city, status, isActive],
  );

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useBusinessesQuery(loadEverything ? { ...listQueryParams, page: 1, limit: 1000 } : listQueryParams);
  const leadsQuery = useLeadsData(true);

  const {
    data: kpiData,
    isLoading: isKpisLoading,
  } = useBusinessKpisQuery(kpiQueryParams);

  const clientRows = useMemo(() => {
    if (!clientMode || !leadsQuery.data) return null;
    const ids = new Set(applyLeadViewFilter(leadsQuery.data, viewFilter, new Date()).map((lead) => lead.id));
    return (listData?.businesses ?? EMPTY_BUSINESSES).filter((item) => ids.has(String(item.id)));
  }, [clientMode, leadsQuery.data, listData, viewFilter]);
  const allRows = clientMode ? (clientRows ?? EMPTY_BUSINESSES) : (listData?.businesses ?? EMPTY_BUSINESSES);
  const businesses = view === "kanban" ? allRows : clientMode ? allRows.slice((page - 1) * limit, page * limit) : allRows;
  const totalCount = clientMode ? allRows.length : (listData?.total ?? 0);
  const totalPages = clientMode && view !== "kanban" ? Math.max(1, Math.ceil(totalCount / limit)) : (listData?.totalPages ?? 1);
  const listLoading = isListLoading || (clientMode && !clientRows);

  // Owner options come from the leads themselves, so they work for every role.
  const owners = useMemo(() => {
    const seen = new Map<string, string>();
    for (const lead of leadsQuery.data ?? []) if (lead.ownerId) seen.set(lead.ownerId, lead.ownerName || "Unnamed user");
    return [...seen.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [leadsQuery.data]);

  const patchViewFilter = (patch: Partial<LeadViewFilter>) => {
    setViewFilter((current) => ({ ...current, ...patch }));
    setPage(1);
  };
  const resetEverything = () => {
    setViewFilter({});
    resetAllFilters();
  };

  const day = (iso?: string) => (iso ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)) : "any date");
  const chips: FilterChip[] = [];
  if (status && status !== "All statuses") chips.push({ key: "status", label: "Stage: " + (STAGE_LABELS[status] ?? status), onRemove: () => setStatus("") });
  if (isActive === true) chips.push({ key: "active", label: "Active only", onRemove: () => setIsActive(undefined) });
  if (viewFilter.owner) chips.push({ key: "owner", label: "Owner: " + (viewFilter.owner === "none" ? "Unassigned" : owners.find((o) => o.id === viewFilter.owner)?.name ?? "selected user"), onRemove: () => patchViewFilter({ owner: undefined }) });
  if (viewFilter.createdFrom || viewFilter.createdTo) chips.push({ key: "created", label: "Added " + day(viewFilter.createdFrom) + " to " + day(viewFilter.createdTo), onRemove: () => patchViewFilter({ createdFrom: undefined, createdTo: undefined }) });
  if (viewFilter.updatedFrom || viewFilter.updatedTo) chips.push({ key: "updated", label: "Updated " + day(viewFilter.updatedFrom) + " to " + day(viewFilter.updatedTo), onRemove: () => patchViewFilter({ updatedFrom: undefined, updatedTo: undefined }) });
  if (viewFilter.nextFrom || viewFilter.nextTo) chips.push({ key: "next", label: "Next follow-up " + day(viewFilter.nextFrom) + " to " + day(viewFilter.nextTo), onRemove: () => patchViewFilter({ nextFrom: undefined, nextTo: undefined }) });
  if (viewFilter.staleDays) chips.push({ key: "stale", label: "No activity for " + viewFilter.staleDays + "+ days", onRemove: () => patchViewFilter({ staleDays: undefined }) });
  if (viewFilter.open) chips.push({ key: "open", label: "Open leads only", onRemove: () => patchViewFilter({ open: undefined }) });
  if (viewFilter.source) chips.push({ key: "source", label: "Source: " + viewFilter.source, onRemove: () => patchViewFilter({ source: undefined }) });

  // Active filters detection (only dropdown filters, since search bar has its own 'X' clear button)
  const hasActiveFilters = Boolean(
    categoryId ||
      (city && city !== "All cities") ||
      (status && status !== "All statuses") ||
      isActive !== undefined ||
      clientMode,
  );

  const searchControl = (
    <SearchWithSuggestions
      searchTerm={search}
      onSearchTermChange={setSearch}
      placeholder="Search by business name or phone number..."
    />
  );

  const filterControls = (
    <BusinessFilters
      selectedCategoryId={categoryId}
      selectedCategoryName={categoryName}
      onCategorySelect={setCategory}
      selectedStatus={status}
      onStatusChange={setStatus}
      selectedCity={city}
      onCityChange={setCity}
      isActive={isActive}
      onIsActiveChange={setIsActive}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={resetEverything}
      owners={owners}
      selectedOwner={viewFilter.owner ?? ""}
      onOwnerChange={(owner) => patchViewFilter({ owner: owner || undefined })}
    />
  );

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Businesses" }]} />}
      customSearch={searchControl}
      filters={filterControls}
      showStats={showStats && !clientMode}
      showFilters={showFilters}
      onToggleFilters={toggleFilters}
      onResetFilters={resetEverything}
      activeFilterCount={chips.length + (categoryId ? 1 : 0) + (city && city !== "All cities" ? 1 : 0)}
      resultCount={totalCount}
      viewSwitcher={<BusinessViewToggle value={view} onChange={setView} />}
      actions={
        <Actions
          primary={{
            label: "Add business",
            href: "/businesses/form",
            icon: <Plus className="size-4" />,
          }}
          menuItems={[
            {
              label: `${showStats ? "Hide" : "Show"} KPIs`,
              icon: <ChartNoAxesCombined className="size-4" />,
              onSelect: toggleStats,
              desktopOnly: true,
            },
            {
              label: `${showFilters ? "Hide" : "Show"} Filters`,
              icon: <Filter className="size-4" />,
              onSelect: toggleFilters,
              desktopOnly: true,
            },
          ]}
        />
      }
      stats={<BusinessStats stats={kpiData} isLoading={isKpisLoading} />}
      content={
        <div className="space-y-4">
        <ActiveFilterChips chips={chips} onClearAll={resetEverything} />
        {isListError ? (
          <div className="rounded-2xl border border-bad/30 bg-bad-soft p-12 text-center text-sm text-bad">
            Unable to load businesses from API.
            <button
              type="button"
              onClick={() => refetchList()}
              className="ml-2 font-semibold underline hover:text-bad"
            >
              Try again
            </button>
          </div>
        ) : (
          view === "kanban" ? (
            <BusinessKanban
              businesses={businesses}
              totalCount={totalCount}
              isLoading={listLoading}
              currentPage={1}
              itemsPerPage={Math.max(limit, totalCount, 1)}
              sortOrder={sortBy}
              onSortOrderChange={setSortBy}
              hasActiveFilters={Boolean(hasActiveFilters || search.trim())}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          ) : (
            <BusinessTable
              businesses={businesses}
              totalCount={totalCount}
              isLoading={listLoading}
              sortOrder={sortBy}
              onSortOrderChange={setSortBy}
              currentPage={page}
              totalPages={totalPages}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              onClearFilters={resetAllFilters}
            />
          )
        )}
        </div>
      }
    />
  );
}

export default function BusinessesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          Loading businesses...
        </div>
      }
    >
      <BusinessesContent />
    </Suspense>
  );
}
