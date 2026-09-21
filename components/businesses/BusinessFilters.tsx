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
import CategoryAutocomplete from "@/components/common/CategoryAutocomplete";
import CityAutocomplete from "@/components/common/CityAutocomplete";
import LeadStatusSelect from "@/components/common/LeadStatusSelect";

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

  // Active count for "More Filters" (Active/Inactive mapped to isDeleted)
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
      className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full xl:flex-nowrap"
    >
      {/* 1. Category Filter (Debounced server autocomplete) */}
      <div className="w-full sm:w-48 lg:w-44 xl:w-48 shrink-0">
        <CategoryAutocomplete
          value={selectedCategoryId}
          label={selectedCategoryName}
          onChange={onCategorySelect}
          placeholder="All Categories"
        />
      </div>

      {/* 2. Leads Filter (Server-side GET /api/businesses/status) */}
      <div className="w-full sm:w-40 lg:w-36 xl:w-40 shrink-0">
        <LeadStatusSelect value={selectedStatus} onChange={onStatusChange} />
      </div>

      {/* 3. City Filter (Debounced Server Autocomplete: GET /api/businesses/city/autocomplete?search=<city>) */}
      <div className="w-full sm:w-40 lg:w-40 xl:w-44 shrink-0">
        <CityAutocomplete
          value={selectedCity}
          onChange={onCityChange}
          placeholder="All Cities"
        />
      </div>

      {/* More Filters Popover (Active / Inactive mapped to isDeleted) */}
      <div className="hidden lg:block">
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

          {/* Status Filter (Active / Inactive mapped to isDeleted) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <Activity className="size-3.5 text-[#94a3b8]" />
              Status
            </label>
            <Select
              value={activeInactiveValue}
              onValueChange={handleActiveInactiveChange}
            >
              <SelectTrigger className="w-full h-9 rounded-lg bg-[#f8fafc] border-[#e2e8f0] text-xs font-medium text-[#334155]">
                <SelectValue placeholder="All Status">
                  {activeInactiveValue === "active"
                    ? "Active"
                    : activeInactiveValue === "inactive"
                      ? "Inactive"
                      : "All Status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="all" className="text-xs font-medium">
                  All Status
                </SelectItem>
                <SelectItem value="active" className="text-xs">
                  Active
                </SelectItem>
                <SelectItem value="inactive" className="text-xs">
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      </div>

      <div className="w-full sm:w-40 shrink-0 lg:hidden">
        <Select value={activeInactiveValue} onValueChange={handleActiveInactiveChange}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-white border-[#e2e8f0] text-xs font-medium text-[#334155]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="all" className="text-xs">All Status</SelectItem>
            <SelectItem value="active" className="text-xs">Active</SelectItem>
            <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. Reset Filters Button */}
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
