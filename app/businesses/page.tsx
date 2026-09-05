"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BusinessStats,
  BusinessFilters,
  BusinessTable,
  BusinessStatsData,
} from "@/components/businesses";
import { useBusinesses } from "@/lib/business-store";

export default function BusinessesPage() {
  const router = useRouter();
  const { businesses } = useBusinesses();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortOrder, setSortOrder] = useState("Latest First");

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
    const defaultCities = ["All Cities", "Ballia", "Buxar", "Ghazipur", "Varanasi"];
    const dataCities = businesses.map((b) => b.city).filter(Boolean);
    return Array.from(new Set([...defaultCities, ...dataCities]));
  }, [businesses]);

  // Compute live KPI stats directly from actual businesses in store
  const statsData: BusinessStatsData = useMemo(() => {
    const total = businesses.length;
    const active = businesses.filter((b) => b.status === "Active").length;
    const followUpToday = businesses.filter((b) => b.nextFollowUpType === "today").length;
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
        selectedCategory === "All Categories" || item.category === selectedCategory;
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
  }, [businesses, searchTerm, selectedCategory, selectedStatus, selectedCity, sortOrder]);

  const handleAddBusiness = () => {
    router.push("/businesses/form");
  };

  return (
    <div className="space-y-3 md:space-y-4 pb-12">
      {/* Mobile Heading */}
      <div className="block lg:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Businesses</h1>
        <p className="mt-0.5 text-xs text-[#64748b]">Manage and track all your business leads.</p>
      </div>

      {/* 1. Search & Filter Bar */}
      <BusinessFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        categories={availableCategories}
        cities={availableCities}
        onAddBusiness={handleAddBusiness}
      />

      {/* 2. Metric / KPI Stats Cards */}
      <BusinessStats stats={statsData} />

      {/* 3. Mobile Add Business Full Width Button */}
      <div className="block sm:hidden">
        <Button
          asChild
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b63e5] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0952be]"
        >
          <Link href="/businesses/form">
            <Plus className="size-4 stroke-[2.5]" />
            Add Business
          </Link>
        </Button>
      </div>

      {/* 4. Businesses Cards (Mobile) / Data Table (Desktop) */}
      <BusinessTable
        businesses={filteredData}
        totalCount={statsData.total}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onExport={() => {}}
      />
    </div>
  );
}
