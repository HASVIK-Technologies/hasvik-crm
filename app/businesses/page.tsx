"use client";

import React, { useState, useMemo } from "react";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import Actions from "@/components/common/Actions";
import {
  BusinessStats,
  BusinessFilters,
  BusinessTable,
  BusinessStatsData,
} from "@/components/businesses";
import { useBusinesses } from "@/lib/business-store";
import ListPageLayout from "@/components/layout/ListPageLayout";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function BusinessesPage() {
  const { businesses } = useBusinesses();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortOrder, setSortOrder] = useState("Latest First");
  const [showStats, setShowStats] = useState(true);

  // Dynamically derive categories and cities from data
  const availableCategories = useMemo(() => {
    const defaultCats = [
      "All Categories",
      "Furniture Shop",
      "Hardware Store",
      "Construction",
      "Electrical Shop",
      "Kirana Store",
      "Service Center",
      "Medical Store",
    ];
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

  // Filter & sort businesses
  const filteredData = useMemo(() => {
    const result = businesses.filter((item) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.phone.includes(searchTerm) ||
        item.category.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query) ||
        String(item.id).includes(searchTerm);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All Status" || item.status === selectedStatus;
      const matchesCity =
        selectedCity === "All Cities" || item.city === selectedCity;

      return matchesSearch && matchesCategory && matchesStatus && matchesCity;
    });

    // Sort by numeric ID
    return result.sort((a, b) => {
      if (sortOrder === "Latest First") {
        return b.id - a.id;
      }
      return a.id - b.id;
    });
  }, [
    businesses,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedCity,
    sortOrder,
  ]);

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
                onSelect: () => setShowStats((visible) => !visible),
              },
            ]}
          />
        }
        stats={<BusinessStats stats={statsData} />}
        content={
          <BusinessTable
            businesses={filteredData}
            totalCount={statsData.total}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onExport={() => {}}
          />
        }
      />
    </>
  );
}
