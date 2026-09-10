"use client";

import React, { useMemo } from "react";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import Actions from "@/components/common/Actions";
import {
  BusinessStats,
  BusinessFilters,
  BusinessTable,
  BusinessStatsData,
} from "@/components/businesses";
import type { BusinessItem } from "@/types/business";
import { useBusinessesQuery } from "@/hooks/use-businesses";
import { useBusinessListStore } from "@/store/business-list-store";
import ListPageLayout from "@/components/layout/ListPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";

const EMPTY_BUSINESSES: BusinessItem[] = [];

export default function BusinessesPage() {
  const {
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedCity,
    sortOrder,
    page,
    limit,
    showStats,
    setSearchTerm,
    setSelectedCategory,
    setSelectedStatus,
    setSelectedCity,
    setSortOrder,
    setPage,
    setLimit,
    toggleStats,
  } = useBusinessListStore();

  const queryParams = useMemo(
    () => ({
      search: searchTerm || undefined,
      status:
        selectedStatus === "All Status"
          ? undefined
          : selectedStatus === "Active"
            ? "ACTIVE"
            : "INACTIVE",
      categoryId:
        /^[a-f\d]{24}$/i.test(selectedCategory) ? selectedCategory : undefined,
      city: selectedCity === "All Cities" ? undefined : selectedCity,
      page,
      limit,
      sortBy: sortOrder === "Latest First" ? "-createdAt" : "createdAt",
    }),
    [page, limit, searchTerm, selectedCategory, selectedCity, selectedStatus, sortOrder],
  );

  const { data, isError, isLoading, refetch } = useBusinessesQuery(queryParams);
  const businesses = data?.businesses ?? EMPTY_BUSINESSES;

  // Keep the filter options useful while categories are still represented by API IDs.
  const availableCategories = useMemo(() => {
    const defaultCats = ["All Categories"];
    const dataCats = businesses.map((b) => b.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dataCats]));
  }, [businesses]);

  const availableCities = useMemo(() => {
    const defaultCities = [
      "All Cities",
      "Ballia",
      "Buxar",
      "Ghazipur",
      "Varanasi",
    ];
    const dataCities = businesses.map((b) => b.city).filter(Boolean);
    return Array.from(new Set([...defaultCities, ...dataCities]));
  }, [businesses]);

  // Compute live KPI stats directly from actual businesses in store
  const statsData: BusinessStatsData = useMemo(() => {
    const total = businesses.length;
    const active = businesses.filter((b) => b.status === "Active").length;
    const followUpToday = businesses.filter(
      (b) => b.nextFollowUpType === "today",
    ).length;
    const categoriesCount = new Set(businesses.map((b) => b.category)).size;

    return {
      total,
      active,
      followUpToday,
      categoriesCount,
    };
  }, [businesses]);

  const filterControls = (
    <BusinessFilters
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      selectedCity={selectedCity}
      onCityChange={setSelectedCity}
      categories={availableCategories}
      cities={availableCities}
    />
  );

  return (
    <>
      <ListPageLayout
        breadcrumb={<Breadcrumb items={[{ label: "Businesses" }]} />}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search businesses..."
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
        stats={<BusinessStats stats={statsData} />}
        content={
          isLoading ? (
            <div className="rounded-2xl border border-[#e4ecf2] bg-white p-12 text-center text-sm text-[#64748b]">
              Loading businesses...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-700">
              Unable to load businesses.
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <BusinessTable
              businesses={businesses}
              totalCount={data?.total ?? 0}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              currentPage={page}
              totalPages={data?.totalPages ?? 0}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              onExport={() => {}}
            />
          )
        }
      />
    </>
  );
}
