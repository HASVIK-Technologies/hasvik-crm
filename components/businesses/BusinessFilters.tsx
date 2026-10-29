"use client";

import SelectField from "@/components/common/SelectField";
import ResponsiveFilters from "@/components/common/ResponsiveFilters";
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

  // Active / Inactive
  isActive?: boolean;
  onIsActiveChange?: (isActive: boolean | undefined) => void;

  // Owner (client-side: the API has no owner filter)
  owners?: { id: string; name: string }[];
  selectedOwner?: string;
  onOwnerChange?: (owner: string) => void;

  // Reset
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export default function BusinessFilters({ selectedCategoryId = "", selectedCategoryName = "", onCategorySelect, selectedStatus = "", onStatusChange, selectedCity = "", onCityChange, isActive, onIsActiveChange, onResetFilters, hasActiveFilters = false, owners = [], selectedOwner = "", onOwnerChange }: BusinessFiltersProps) {
  return <ResponsiveFilters onReset={onResetFilters} hasActiveFilters={hasActiveFilters} fields={[
    { key: "category", label: "Category", active: Boolean(selectedCategoryId), reset: () => onCategorySelect?.("", ""), control: <CategoryAutocomplete value={selectedCategoryId} label={selectedCategoryName} onChange={onCategorySelect} placeholder="All categories" /> },
    { key: "lead-status", label: "Lead status", active: Boolean(selectedStatus), reset: () => onStatusChange?.(""), control: <LeadStatusSelect value={selectedStatus} onChange={onStatusChange} /> },
    { key: "owner", label: "Owner", active: Boolean(selectedOwner), reset: () => onOwnerChange?.(""), control: <SelectField ariaLabel="Owner" value={selectedOwner || "ALL"} onChange={(value) => onOwnerChange?.(value === "ALL" ? "" : value)} options={[{ value: "ALL", label: "All owners" }, { value: "none", label: "Unassigned" }, ...owners.map((owner) => ({ value: owner.id, label: owner.name }))]} /> },
    { key: "city", label: "City", active: Boolean(selectedCity), reset: () => onCityChange?.(""), control: <CityAutocomplete value={selectedCity} onChange={onCityChange} placeholder="All cities" /> },
    { key: "activity", label: "Activity status", active: isActive !== undefined, reset: () => onIsActiveChange?.(undefined), control: <SelectField ariaLabel="Activity status" value={isActive === undefined ? "ALL" : isActive ? "ACTIVE" : "INACTIVE"} onChange={(value) => onIsActiveChange?.(value === "ALL" || !value ? undefined : value === "ACTIVE")} options={[{ value: "ALL", label: "All statuses" }, { value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} /> },
  ]} />;
}
