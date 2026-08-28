"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  BusinessStats,
  BusinessFilters,
  BusinessTable,
  BusinessItem,
  BusinessStatsData,
} from "@/components/businesses";

const INITIAL_BUSINESS_DATA: BusinessItem[] = [
  {
    id: "1",
    name: "Shree Balaji Traders",
    phone: "9876543210",
    initials: "SB",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Furniture Shop",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "Today at 10:00 AM",
    nextFollowUp: "Today",
    nextFollowUpType: "today",
  },
  {
    id: "2",
    name: "Maa Durga Enterprises",
    phone: "9123456780",
    initials: "MD",
    avatarBg: "bg-[#d1fadf]",
    avatarTextColor: "text-[#039855]",
    category: "Hardware Store",
    city: "Buxar",
    status: "Active",
    lastFollowUp: "Today at 11:30 AM",
    nextFollowUp: "Today",
    nextFollowUpType: "today",
  },
  {
    id: "3",
    name: "Akash Furniture",
    phone: "9988776655",
    initials: "AF",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Furniture Shop",
    city: "Ghazipur",
    status: "Active",
    lastFollowUp: "Tomorrow 10:00 AM",
    nextFollowUp: "Tomorrow",
    nextFollowUpType: "tomorrow",
  },
  {
    id: "4",
    name: "Gupta Construction",
    phone: "8877665544",
    initials: "GC",
    avatarBg: "bg-[#fee4e2]",
    avatarTextColor: "text-[#d92d20]",
    category: "Construction",
    city: "Varanasi",
    status: "Active",
    lastFollowUp: "25 May 2024",
    nextFollowUp: "25 May 2024",
    nextFollowUpType: "date",
  },
  {
    id: "5",
    name: "Star Enterprises",
    phone: "7766554433",
    initials: "SE",
    avatarBg: "bg-[#f4ebff]",
    avatarTextColor: "text-[#7f56d9]",
    category: "Electrical Shop",
    city: "Ballia",
    status: "Inactive",
    lastFollowUp: "20 May 2024",
    nextFollowUp: "-",
    nextFollowUpType: "none",
  },
  {
    id: "6",
    name: "Rakesh Kirana Store",
    phone: "9988774433",
    initials: "RK",
    avatarBg: "bg-[#d1fadf]",
    avatarTextColor: "text-[#039855]",
    category: "Kirana Store",
    city: "Ballia",
    status: "Active",
    lastFollowUp: "24 May 2024",
    nextFollowUp: "26 May 2024",
    nextFollowUpType: "date",
  },
  {
    id: "7",
    name: "Vishal Services",
    phone: "8899776655",
    initials: "VS",
    avatarBg: "bg-[#e0eafe]",
    avatarTextColor: "text-[#2e90fa]",
    category: "Service Center",
    city: "Buxar",
    status: "Active",
    lastFollowUp: "23 May 2024",
    nextFollowUp: "25 May 2024",
    nextFollowUpType: "date",
  },
  {
    id: "8",
    name: "Prakash Pharmacy",
    phone: "7788996655",
    initials: "PK",
    avatarBg: "bg-[#fef0c7]",
    avatarTextColor: "text-[#dc6803]",
    category: "Medical Store",
    city: "Ghazipur",
    status: "Inactive",
    lastFollowUp: "15 May 2024",
    nextFollowUp: "-",
    nextFollowUpType: "none",
  },
];

const STATS_DATA: BusinessStatsData = {
  total: 156,
  active: 128,
  followUpToday: 18,
  categoriesCount: 24,
};

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortOrder, setSortOrder] = useState("Latest First");

  const filteredData = useMemo(() => {
    return INITIAL_BUSINESS_DATA.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All Status" || item.status === selectedStatus;
      const matchesCity =
        selectedCity === "All Cities" || item.city === selectedCity;

      return matchesSearch && matchesCategory && matchesStatus && matchesCity;
    });
  }, [searchTerm, selectedCategory, selectedStatus, selectedCity]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
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
        onAddBusiness={() => {}}
      />

      {/* 2. Metric / KPI Stats Cards (2x2 on mobile) */}
      <BusinessStats stats={STATS_DATA} />

      {/* 3. Mobile Add Business Full Width Button */}
      <div className="block sm:hidden">
        <button
          type="button"
          onClick={() => {}}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b63e5] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0952be]"
        >
          <Plus className="size-4 stroke-[2.5]" />
          Add Business
        </button>
      </div>

      {/* 4. Businesses Cards (Mobile) / Data Table (Desktop) */}
      <BusinessTable
        businesses={filteredData}
        totalCount={STATS_DATA.total}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onExport={() => {}}
      />
    </div>
  );
}
