"use client";

import React, { useState } from "react";
import { SlidersHorizontal, RotateCcw, Calendar, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CategoryMultiSelect from "./CategoryMultiSelect";
import CityMultiSelect from "./CityMultiSelect";

export const FOLLOW_UP_DATE_OPTIONS = [
  "All Dates",
  "Today",
  "Upcoming",
  "Overdue",
  "No Follow-up",
];

interface BusinessFiltersProps {
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  selectedCategories?: string[];
  onCategoriesChange?: (categories: string[]) => void;
  categoryCounts?: Record<string, number>;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedFollowUpDate?: string;
  onFollowUpDateChange?: (value: string) => void;
  selectedCity?: string;
  onCityChange?: (value: string) => void;
  selectedCities?: string[];
  onCitiesChange?: (cities: string[]) => void;
  cityCounts?: Record<string, number>;
  categories?: string[];
  statuses?: string[];
  cities?: string[];
  states?: string[];
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export default function BusinessFilters({
  selectedCategory = "All Categories",
  onCategoryChange,
  selectedCategories = [],
  onCategoriesChange,
  categoryCounts,
  selectedStatus = "All Status",
  onStatusChange,
  selectedFollowUpDate = "All Dates",
  onFollowUpDateChange,
  selectedCity = "All Cities",
  onCityChange,
  selectedCities = [],
  onCitiesChange,
  cityCounts,
  categories = [
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
  states = ["All States"],
  onResetFilters,
  hasActiveFilters = false,
}: BusinessFiltersProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const handleCategoriesChange = (cats: string[]) => {
    onCategoriesChange?.(cats);
  };

  const handleCitiesChange = (cits: string[]) => {
    onCitiesChange?.(cits);
  };

  const activeCategories =
    selectedCategories.length > 0
      ? selectedCategories
      : selectedCategory && selectedCategory !== "All Categories"
        ? [selectedCategory]
        : [];

  const activeCities =
    selectedCities.length > 0
      ? selectedCities
      : selectedCity && selectedCity !== "All Cities"
        ? [selectedCity]
        : [];

  const extraFiltersActiveCount = activeCities.length;

  return (
    <div
      data-filter-controls
      className="flex flex-col gap-2.5 lg:gap-3 lg:flex-row lg:items-center w-full flex-wrap"
    >
      {/* 1. Business Categories */}
      <div className="w-full lg:w-56 shrink-0">
        <CategoryMultiSelect
          selectedCategories={activeCategories}
          onCategoriesChange={handleCategoriesChange}
          categories={categories}
          categoryCounts={categoryCounts}
          placeholder="All Categories"
        />
      </div>

      {/* 2. Lead Status */}
      <div className="w-full lg:w-40 shrink-0">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-white border-[#e2e8f0] text-xs font-medium text-[#334155]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {statuses.map((status) => (
              <SelectItem key={status} value={status} className="text-xs">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. Follow-up Date */}
      <div className="w-full lg:w-44 shrink-0">
        <Select
          value={selectedFollowUpDate}
          onValueChange={(val) => onFollowUpDateChange?.(val)}
        >
          <SelectTrigger className="w-full h-10 rounded-xl bg-white border-[#e2e8f0] text-xs font-medium text-[#334155] gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="size-3.5 text-[#64748b] shrink-0" />
              <span className="truncate">
                {selectedFollowUpDate === "All Dates"
                  ? "Follow-up Date"
                  : selectedFollowUpDate}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white">
            {FOLLOW_UP_DATE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. More Filters Popover (City, etc.) */}
      <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors shrink-0 ${
              extraFiltersActiveCount > 0
                ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                : "border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]"
            }`}
          >
            <SlidersHorizontal className="size-3.5 text-[#64748b]" />
            <span>More Filters</span>
            {extraFiltersActiveCount > 0 && (
              <span className="flex size-4.5 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">
                {extraFiltersActiveCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-80 p-4 space-y-3.5 bg-white border border-[#e2e8f0] shadow-xl rounded-2xl"
        >
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="size-4 text-[#2563eb]" />
              <h4 className="text-xs font-bold text-[#0f172a]">More Filters</h4>
            </div>
            {extraFiltersActiveCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  handleCitiesChange([]);
                  onCityChange?.("All Cities");
                }}
                className="text-[11px] font-medium text-[#2563eb] hover:underline"
              >
                Reset Extra
              </button>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <MapPin className="size-3.5 text-[#94a3b8]" />
              City / Location
            </label>
            <CityMultiSelect
              selectedCities={activeCities}
              onCitiesChange={handleCitiesChange}
              cities={cities}
              cityCounts={cityCounts}
              placeholder="All Cities"
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* 5. Reset Filters Button */}
      {hasActiveFilters && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#64748b] hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
          title="Reset all filters"
        >
          <RotateCcw className="size-3" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}

