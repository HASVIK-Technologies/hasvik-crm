"use client";

import React, { useMemo } from "react";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import Actions from "@/components/common/Actions";
import {
  BusinessStats,
  BusinessFilters,
  BusinessTable,
  SearchWithSuggestions,
  BusinessStatsData,
} from "@/components/businesses";
import type { BusinessItem } from "@/types/business";
import { useBusinessesQuery, useCategoriesQuery } from "@/hooks/use-businesses";
import { useBusinessListStore } from "@/store/business-list-store";
import ListPageLayout from "@/components/layout/ListPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";

const EMPTY_BUSINESSES: BusinessItem[] = [];

export default function BusinessesPage() {
  const {
    searchTerm,
    searchChips,
    selectedCategory,
    selectedCategories,
    selectedStatus,
    selectedCity,
    selectedCities,
    sortOrder,
    page,
    limit,
    showStats,
    setSearchTerm,
    setSelectedCategory,
    setSelectedCategories,
    setSelectedStatus,
    setSelectedCity,
    setSelectedCities,
    setSortOrder,
    setPage,
    setLimit,
    toggleStats,
    resetAllFilters,
  } = useBusinessListStore();

  // 1. Fetch categories from backend API
  const { data: apiCategories } = useCategoriesQuery();

  // Create a fast lookup map: categoryId -> categoryName
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    if (apiCategories) {
      apiCategories.forEach((c) => {
        map.set(c._id, c.name);
      });
    }
    return map;
  }, [apiCategories]);

  // 2. Fetch businesses from backend API
  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sortBy: sortOrder === "Latest First" ? "-createdAt" : "createdAt",
    }),
    [sortOrder],
  );

  const { data: apiData, isError, isLoading, refetch } = useBusinessesQuery(queryParams);
  const rawBusinesses = apiData?.businesses ?? EMPTY_BUSINESSES;

  // 3. Strictly use API businesses only, resolving any category IDs to readable names
  const businesses = useMemo(() => {
    return rawBusinesses.map((item) => {
      const resolvedCat =
        categoryMap.get(item.category) ||
        (item.category && !/^[a-f\d]{24}$/i.test(item.category)
          ? item.category
          : "Uncategorized");

      return {
        ...item,
        category: resolvedCat,
      };
    });
  }, [rawBusinesses, categoryMap]);

  // 4. Derive categories from API categories + API businesses data
  const { availableCategories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const seen = new Set<string>();

    if (apiCategories) {
      apiCategories.forEach((c) => {
        if (c.name && c.name !== "All Categories") {
          seen.add(c.name);
        }
      });
    }

    businesses.forEach((b) => {
      if (b.category && b.category !== "Uncategorized") {
        seen.add(b.category);
        counts[b.category] = (counts[b.category] || 0) + 1;
      }
    });

    return {
      availableCategories: Array.from(seen),
      categoryCounts: counts,
    };
  }, [apiCategories, businesses]);

  // 5. Derive available cities and city counts from API businesses
  const { availableCities, cityCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const set = new Set<string>(["All Cities"]);
    businesses.forEach((b) => {
      if (b.city && b.city !== "-") {
        set.add(b.city);
        counts[b.city] = (counts[b.city] || 0) + 1;
      }
    });
    return {
      availableCities: Array.from(set),
      cityCounts: counts,
    };
  }, [businesses]);

  // Active category selections
  const activeCategories = useMemo(() => {
    if (selectedCategories.length > 0) return selectedCategories;
    if (selectedCategory && selectedCategory !== "All Categories") {
      return [selectedCategory];
    }
    return [];
  }, [selectedCategories, selectedCategory]);

  // Active city selections
  const activeCities = useMemo(() => {
    if (selectedCities.length > 0) return selectedCities;
    if (selectedCity && selectedCity !== "All Cities") {
      return [selectedCity];
    }
    return [];
  }, [selectedCities, selectedCity]);

  // 6. Dynamic Combined Filtering over API businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((item) => {
      // (a) Category Filter: item must match one of the selected categories
      if (activeCategories.length > 0) {
        const itemCat = item.category.toLowerCase().trim();
        const matchesCategory = activeCategories.some((cat) => {
          const filterCat = cat.toLowerCase().trim();
          return (
            itemCat === filterCat ||
            itemCat.includes(filterCat) ||
            filterCat.includes(itemCat)
          );
        });
        if (!matchesCategory) return false;
      }

      // (b) Search Chips Filter: every selected search chip must match business name or phone
      if (searchChips.length > 0) {
        const matchesAllChips = searchChips.every((chip) => {
          const q = chip.toLowerCase().trim();
          return (
            item.name.toLowerCase().includes(q) ||
            item.phone.toLowerCase().includes(q) ||
            (item.alternatePhone && item.alternatePhone.toLowerCase().includes(q))
          );
        });
        if (!matchesAllChips) return false;
      }

      // (c) Free Text Search: matches strictly by business name or phone number
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesText =
          item.name.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          (item.alternatePhone && item.alternatePhone.toLowerCase().includes(q));

        if (!matchesText) return false;
      }

      // (d) Status Filter
      if (selectedStatus !== "All Status" && item.status !== selectedStatus) {
        return false;
      }

      // (e) City Filter: item must match one of the selected cities
      if (activeCities.length > 0) {
        const itemCity = item.city.toLowerCase().trim();
        const matchesCity = activeCities.some((c) => {
          const filterCity = c.toLowerCase().trim();
          return (
            itemCity === filterCity ||
            itemCity.includes(filterCity) ||
            filterCity.includes(itemCity)
          );
        });
        if (!matchesCity) return false;
      }

      return true;
    });
  }, [
    businesses,
    activeCategories,
    activeCities,
    searchChips,
    searchTerm,
    selectedStatus,
  ]);

  // 7. Sorting
  const sortedBusinesses = useMemo(() => {
    const list = [...filteredBusinesses];
    return list.sort((a, b) => {
      if (sortOrder === "Latest First") {
        return String(b.id).localeCompare(String(a.id));
      }
      return String(a.id).localeCompare(String(b.id));
    });
  }, [filteredBusinesses, sortOrder]);

  // 8. Pagination
  const totalCount = sortedBusinesses.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedBusinesses.slice(startIndex, startIndex + limit);
  }, [sortedBusinesses, page, limit]);

  // 9. Live KPI stats computed strictly from API businesses
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

  const searchControl = (
    <SearchWithSuggestions
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      businesses={businesses}
      placeholder="Search by business name or phone number..."
    />
  );

  const filterControls = (
    <BusinessFilters
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      selectedCategories={selectedCategories}
      onCategoriesChange={setSelectedCategories}
      categoryCounts={categoryCounts}
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      selectedCity={selectedCity}
      onCityChange={setSelectedCity}
      selectedCities={selectedCities}
      onCitiesChange={setSelectedCities}
      cityCounts={cityCounts}
      categories={availableCategories}
      cities={availableCities}
    />
  );

  return (
    <>
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
        stats={<BusinessStats stats={statsData} />}
        content={
          isLoading ? (
            <div className="rounded-2xl border border-[#e4ecf2] bg-white p-12 text-center text-sm text-[#64748b]">
              Loading businesses from API...
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-sm text-red-700">
              Unable to load businesses from API.
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
              businesses={paginatedBusinesses}
              totalCount={totalCount}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
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
    </>
  );
}
