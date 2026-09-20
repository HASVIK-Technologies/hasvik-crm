"use client";

import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import Actions from "@/components/common/Actions";
import {
  BusinessStats,
  BusinessFilters,
  BusinessTable,
  SearchWithSuggestions,
} from "@/components/businesses";
import type { BusinessItem } from "@/types/business";
import {
  useBusinessesQuery,
  useBusinessKpisQuery,
  useCategoriesQuery,
} from "@/hooks/use-businesses";
import { useBusinessListStore } from "@/store/business-list-store";
import {
  buildBusinessListParams,
  buildBusinessKpiParams,
  filtersToSearchParams,
  searchParamsToFilters,
} from "@/lib/business-query-builder";
import ListPageLayout from "@/components/layout/ListPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";

const EMPTY_BUSINESSES: BusinessItem[] = [];

function BusinessesContent() {
  const router = useRouter();
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
    isDeleted,
    showStats,
    setPage,
    setLimit,
    setSortBy,
    setSearch,
    setCategory,
    setCity,
    setStatus,
    setIsDeleted,
    toggleStats,
    resetAllFilters,
    syncFromParams,
  } = useBusinessListStore();

  // Categories query for category stats count
  const { data: apiCategories = [] } = useCategoriesQuery();

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
      isDeleted,
    });

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
    isDeleted,
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
        isDeleted,
      }),
    [page, limit, sortBy, search, categoryId, city, status, isDeleted],
  );

  const kpiQueryParams = useMemo(
    () =>
      buildBusinessKpiParams({
        search,
        categoryId,
        city,
        status,
        isDeleted,
      }),
    [search, categoryId, city, status, isDeleted],
  );

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useBusinessesQuery(listQueryParams);

  const {
    data: kpiData,
    isLoading: isKpisLoading,
  } = useBusinessKpisQuery(kpiQueryParams);

  const businesses = listData?.businesses ?? EMPTY_BUSINESSES;
  const totalCount = listData?.total ?? 0;
  const totalPages = listData?.totalPages ?? 1;

  // Active filters detection (only dropdown filters, since search bar has its own 'X' clear button)
  const hasActiveFilters = Boolean(
    categoryId ||
      (city && city !== "All Cities") ||
      (status && status !== "All Status") ||
      isDeleted !== undefined,
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
      isDeleted={isDeleted}
      onIsDeletedChange={setIsDeleted}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={resetAllFilters}
    />
  );

  const fullStatsData = useMemo(() => {
    const total = kpiData?.total ?? 0;
    const active = kpiData?.active ?? 0;
    const deactivated = Math.max(0, total - active);
    const newCount = kpiData?.new ?? 0;
    const interested = kpiData?.interested ?? 0;
    const won = kpiData?.won ?? 0;
    const followUpToday = businesses.filter((b) => b.nextFollowUpType === "today").length;
    const categoriesCount = apiCategories.filter(
      (c) => c.name && c.name !== "All Categories",
    ).length;

    return {
      total,
      active,
      deactivated,
      new: newCount,
      interested,
      won,
      followUpToday,
      categoriesCount,
    };
  }, [kpiData, businesses, apiCategories]);

  return (
    <ListPageLayout
      breadcrumb={<Breadcrumb items={[{ label: "Businesses" }]} />}
      customSearch={searchControl}
      filters={filterControls}
      showStats={showStats}
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
            },
          ]}
        />
      }
      stats={<BusinessStats stats={fullStatsData} isLoading={isKpisLoading} />}
      content={
        isListError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-700">
            Unable to load businesses from API.
            <button
              type="button"
              onClick={() => refetchList()}
              className="ml-2 font-semibold underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        ) : (
          <BusinessTable
            businesses={businesses}
            totalCount={totalCount}
            isLoading={isListLoading}
            sortOrder={sortBy}
            onSortOrderChange={setSortBy}
            currentPage={page}
            totalPages={totalPages}
            itemsPerPage={limit}
            onPageChange={setPage}
            onItemsPerPageChange={setLimit}
            onExport={() => {}}
            onClearFilters={resetAllFilters}
          />
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
