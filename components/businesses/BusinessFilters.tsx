"use client";

import ResponsiveFilters from "@/components/common/ResponsiveFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategoryAutocomplete from "@/components/common/CategoryAutocomplete";
import CityAutocomplete from "@/components/common/CityAutocomplete";
import LeadStatusSelect from "@/components/common/LeadStatusSelect";
import TagAutocomplete from "@/components/common/TagAutocomplete";

interface BusinessFiltersProps {
  // Category
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  onCategorySelect?: (categoryId: string, categoryName?: string) => void;

  // Status
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;

  // Tag (Slot 3)
  selectedTagId?: string;
  selectedTagName?: string;
  onTagSelect?: (tagId: string, tagName?: string) => void;

  // City (Slot 4 - goes to More Filters)
  selectedCity?: string;
  onCityChange?: (city: string) => void;

  // Active / Inactive (Slot 5 - in More Filters)
  isActive?: boolean;
  onIsActiveChange?: (isActive: boolean | undefined) => void;

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
  selectedTagId = "",
  selectedTagName = "",
  onTagSelect,
  selectedCity = "",
  onCityChange,
  isActive,
  onIsActiveChange,
  onResetFilters,
  hasActiveFilters = false,
}: BusinessFiltersProps) {
  return (
    <ResponsiveFilters
      onReset={onResetFilters}
      hasActiveFilters={hasActiveFilters}
      fields={[
        // 1. All Categories
        {
          key: "category",
          label: "Category",
          active: Boolean(selectedCategoryId),
          reset: () => onCategorySelect?.("", ""),
          control: (
            <CategoryAutocomplete
              value={selectedCategoryId}
              label={selectedCategoryName}
              onChange={onCategorySelect}
              placeholder="All Categories"
            />
          ),
        },
        // 2. All Leads
        {
          key: "lead-status",
          label: "Lead status",
          active: Boolean(selectedStatus),
          reset: () => onStatusChange?.(""),
          control: (
            <LeadStatusSelect
              value={selectedStatus}
              onChange={onStatusChange}
            />
          ),
        },
        // 3. All Tags (replaces All Cities here)
        {
          key: "tag",
          label: "Tag",
          active: Boolean(selectedTagId),
          reset: () => onTagSelect?.("", ""),
          control: (
            <TagAutocomplete
              value={selectedTagId}
              label={selectedTagName}
              onChange={onTagSelect}
              entityType="BUSINESS"
              placeholder="All Tags"
            />
          ),
        },
        // 4. All Cities (now in More Filters on desktop)
        {
          key: "city",
          label: "City",
          active: Boolean(selectedCity),
          reset: () => onCityChange?.(""),
          control: (
            <CityAutocomplete
              value={selectedCity}
              onChange={onCityChange}
              placeholder="All Cities"
            />
          ),
        },
        // 5. Activity Status (in More Filters)
        {
          key: "activity",
          label: "Activity status",
          active: isActive !== undefined,
          reset: () => onIsActiveChange?.(undefined),
          control: (
            <Select
              value={isActive === undefined ? "ALL" : isActive ? "ACTIVE" : "INACTIVE"}
              onValueChange={(value) =>
                onIsActiveChange?.(value === "ALL" ? undefined : value === "ACTIVE")
              }
            >
              <SelectTrigger className="w-full bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ]}
    />
  );
}