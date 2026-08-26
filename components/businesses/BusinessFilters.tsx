"use client";

import React from "react";
import { Search, ChevronDown, Plus } from "lucide-react";

interface BusinessFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
  onAddBusiness?: () => void;
  categories?: string[];
  statuses?: string[];
  cities?: string[];
}

export default function BusinessFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedCity,
  onCityChange,
  onAddBusiness,
  categories = [
    "All Categories",
    "Furniture Shop",
    "Hardware Store",
    "Construction",
    "Electrical Shop",
    "Kirana Store",
    "Service Center",
    "Medical Store",
  ],
  statuses = ["All Status", "Active", "Inactive"],
  cities = ["All Cities", "Ballia", "Buxar", "Ghazipur", "Varanasi"],
}: BusinessFiltersProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-[#e4ecf2] bg-white p-4 shadow-[0_2px_12px_rgba(20,40,60,0.03)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3.5">
        {/* Search Box */}
        <div className="relative min-w-[240px] flex-1">
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-white pl-4.5 pr-11 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0b63e5] focus:outline-none focus:ring-1 focus:ring-[#0b63e5]"
          />
          <Search className="pointer-events-none absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-[#94a3b8]" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-11 appearance-none rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-10 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-11 appearance-none rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-10 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none"
          >
            {statuses.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
        </div>

        {/* Cities Filter */}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="h-11 appearance-none rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-10 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#64748b]" />
        </div>
      </div>

      {/* Add Business Button */}
      <button
        type="button"
        onClick={onAddBusiness}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b63e5] px-5.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(11,99,229,0.28)] transition-all hover:bg-[#0952be]"
      >
        <Plus className="size-4.5 stroke-[2.5]" />
        Add Business
      </button>
    </div>
  );
}
