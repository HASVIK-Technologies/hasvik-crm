"use client";

import React from "react";
import SearchInput from "@/components/common/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BusinessFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
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
    <div
      data-filter-controls
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 lg:gap-4"
    >
      <SearchInput
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search businesses..."
        wrapperClassName="min-w-75 w-full"
        className="h-11 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
      />
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedCity} onValueChange={onCityChange}>
        <SelectTrigger className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
