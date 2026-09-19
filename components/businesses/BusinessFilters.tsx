"use client";

import React, { useState } from "react";
import { SlidersHorizontal, RotateCcw, Activity } from "lucide-react";
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
import { useBusinessStatusesQuery } from "@/hooks/use-businesses";

interface BusinessFiltersProps {
  // Category
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  onCategorySelect?: (categoryId: string, categoryName?: string) => void;

  // Status
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;

  // City
  selectedCity?: string;
  onCityChange?: (city: string) => void;

  // Active / Inactive (isDeleted)
  isDeleted?: boolean;
  onIsDeletedChange?: (isDeleted: boolean | undefined) => void;

  // Reset
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;

  // Backward-compat props (if any remaining callers pass them)
  selectedCategory?: string;
  onCategoryChange?: (val: string) => void;
  selectedCategories?: string[];
  onCategoriesChange?: (cats: string[]) => void;
  selectedCities?: string[];
  onCitiesChange?: (cits: string[]) => void;
  selectedFollowUpDate?: string;
  onFollowUpDateChange?: (val: string) => void;
}

export default function BusinessFilters({
  selectedCategoryId = "",
  selectedCategoryName = "",
  onCategorySelect,
  selectedStatus = "",
  onStatusChange,
  selectedCity = "",
  onCityChange,
  isDeleted,
  onIsDeletedChange,
  onResetFilters,
  hasActiveFilters = false,
}: BusinessFiltersProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Dynamic server-side Lead Status options from GET /api/businesses/status
  const { data: statusOptions = [] } = useBusinessStatusesQuery();

  // Active count for "More Filters" (Active/Inactive)
  const isMoreFiltersActive = typeof isDeleted === "boolean";
  const extraFiltersCount = isMoreFiltersActive ? 1 : 0;

  // Format the active/inactive state for the dropdown
  const activeInactiveValue =
    isDeleted === false ? "active" : isDeleted === true ? "inactive" : "all";

  const handleActiveInactiveChange = (val: string) => {
    if (val === "active") {
      onIsDeletedChange?.(false);
    } else if (val === "inactive") {
      onIsDeletedChange?.(true);
    } else {
      onIsDeletedChange?.(undefined);
    }
  };

  return (
    <div
      data-filter-controls
      className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:flex-nowrap"
    >
      {/* 1. Category Filter (Debounced Server Autocomplete: GET /api/businesses/autocomplete?search=<text>) */}
      <div className="w-full sm:w-48 lg:w-44 xl:w-48 shrink-0">
        <CategoryMultiSelect
          selectedCategoryId={selectedCategoryId}
          selectedCategoryName={selectedCategoryName}
          onCategorySelect={onCategorySelect}
          placeholder="All Categories"
        />
      </div>

      {/* 2. Lead Status Filter (Server-side GET /api/businesses/status) */}
      <div className="w-full sm:w-36 lg:w-36 shrink-0">
        <Select
          value={selectedStatus || "ALL"}
          onValueChange={(val) => onStatusChange?.(val === "ALL" ? "" : val)}
        >
          <SelectTrigger className="w-full h-10 rounded-xl bg-white border-[#e2e8f0] text-xs font-medium text-[#334155] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#cbd5e1] focus:ring-[#0b63e5]/20 focus:border-[#0b63e5]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL" className="text-xs">
              All Status
            </SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.key} value={opt.key} className="text-xs">
                {opt.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. City Filter (Debounced Server Autocomplete: GET /api/businesses/city/autocomplete?search=<city>) */}
      <div className="w-full sm:w-40 lg:w-40 xl:w-44 shrink-0">
        <CityMultiSelect
          selectedCity={selectedCity}
          onCitySelect={onCityChange}
          placeholder="All Cities"
        />
      </div>

      {/* 4. More Filters Popover (Active / Inactive mapped to isDeleted) */}
      <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
              isMoreFiltersActive
                ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]"
                : "border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]"
            }`}
          >
            <SlidersHorizontal className="size-3.5 text-[#64748b]" />
            <span>More Filters</span>
            {extraFiltersCount > 0 && (
              <span className="flex size-4.5 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">
                {extraFiltersCount}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-4 space-y-3.5 bg-white border border-[#e2e8f0] shadow-xl rounded-2xl z-50"
        >
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="size-4 text-[#2563eb]" />
              <h4 className="text-xs font-bold text-[#0f172a]">More Filters</h4>
            </div>
            {isMoreFiltersActive && (
              <button
                type="button"
                onClick={() => onIsDeletedChange?.(undefined)}
                className="text-[11px] font-medium text-[#2563eb] hover:underline"
              >
                Reset Extra
              </button>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <Activity className="size-3.5 text-[#94a3b8]" />
              Record Status
            </label>
            <Select
              value={activeInactiveValue}
              onValueChange={handleActiveInactiveChange}
            >
              <SelectTrigger className="w-full h-9 rounded-lg bg-[#f8fafc] border-[#e2e8f0] text-xs font-medium text-[#334155]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="text-xs">
                  All Records
                </SelectItem>
                <SelectItem value="active" className="text-xs">
                  Active Only (isDeleted=false)
                </SelectItem>
                <SelectItem value="inactive" className="text-xs">
                  Inactive Only (isDeleted=true)
                </SelectItem>
              </SelectContent>
            </Select>
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
