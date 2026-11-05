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
import { useLeadsData } from "@/hooks/use-analytics";
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
  const [viewFilter, setViewFilter] = useState<LeadViewFilter>(() =>
    parseLeadViewFilter(searchParams ?? new URLSearchParams()),
  );
  const clientMode = needsClientFilter(viewFilter);
  const loadEverything = clientMode || view === "kanban";
  const leadsQuery = useLeadsData(clientMode);

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
      if (value !== undefined && value !== false) {
        sp.set(key, value === true ? "1" : String(value));
      }
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
  } = useBusinessesQuery(
    loadEverything ? { ...listQueryParams, page: 1, limit: 1000 } : listQueryParams,
  );

  const {
    data: kpiData,
    isLoading: isKpisLoading,
  } = useBusinessKpisQuery(kpiQueryParams);

  const clientRows = useMemo(() => {
    if (!clientMode || !leadsQuery.data) return null;
    const ids = new Set(
      applyLeadViewFilter(leadsQuery.data, viewFilter, new Date()).map((lead) => lead.id),
    );
    return (listData?.businesses ?? EMPTY_BUSINESSES).filter((item) =>
      ids.has(String(item.id)),
    );
  }, [clientMode, leadsQuery.data, listData, viewFilter]);
  const allRows = clientMode
    ? clientRows ?? EMPTY_BUSINESSES
    : listData?.businesses ?? EMPTY_BUSINESSES;
  const businesses =
    view === "kanban" ? allRows : clientMode ? allRows.slice((page - 1) * limit, page * limit) : allRows;
  const totalCount = clientMode ? allRows.length : listData?.total ?? 0;
  const totalPages =
    clientMode && view !== "kanban"
      ? Math.max(1, Math.ceil(totalCount / limit))
      : listData?.totalPages ?? 1;
  const listLoading = isListLoading || (clientMode && leadsQuery.isPending);
  const listError = isListError || (clientMode && leadsQuery.isError);
  const retryList = () => {
    void refetchList();
    if (clientMode) void leadsQuery.refetch();
  };
  const resetEverything = () => {
    setViewFilter({});
    resetAllFilters();
  };

  // Active filters detection (only dropdown filters, since search bar has its own 'X' clear button)
  const hasActiveFilters = Boolean(
    categoryId ||
      (city && city !== "All Cities") ||
      (status && status !== "All Status") ||
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
    />
  );

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Businesses" }]} />}
      customSearch={searchControl}
      filters={filterControls}
      showStats={showStats}
      showFilters={showFilters}
      onToggleFilters={toggleFilters}
      onResetFilters={resetEverything}
      resultCount={totalCount}
      viewSwitcher={<BusinessViewToggle value={view} onChange={setView} />}
      actions={
        <Actions
          primary={{
            label: "Add Business",
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
        listError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-700">
            Unable to load businesses or dashboard filters from the API.
            <button
              type="button"
              onClick={retryList}
              className="ml-2 font-semibold underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {clientMode && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                <span>Showing records filtered by the selected dashboard metric.</span>
                <button type="button" onClick={resetEverything} className="font-semibold underline underline-offset-2">
                  Clear dashboard filters
                </button>
              </div>
            )}
            {view === "kanban" ? (
              <BusinessKanban
                businesses={businesses}
                totalCount={totalCount}
                isLoading={listLoading}
                currentPage={page}
                itemsPerPage={limit}
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
                onClearFilters={resetEverything}
              />
            )}
          </div>
        )
      }
    />
  );
}

export default function BusinessesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-[#64748b]">
          Loading businesses...
        </div>
      }
    >
      <BusinessesContent />
    </Suspense>
  );
}
