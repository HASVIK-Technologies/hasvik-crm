"use client";

import ResponsiveFilters from "@/components/common/ResponsiveFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    { key: "category", label: "Category", active: Boolean(selectedCategoryId), reset: () => onCategorySelect?.("", ""), control: <CategoryAutocomplete value={selectedCategoryId} label={selectedCategoryName} onChange={onCategorySelect} placeholder="All Categories" /> },
    { key: "lead-status", label: "Lead status", active: Boolean(selectedStatus), reset: () => onStatusChange?.(""), control: <LeadStatusSelect value={selectedStatus} onChange={onStatusChange} /> },
    { key: "owner", label: "Owner", active: Boolean(selectedOwner), reset: () => onOwnerChange?.(""), control: <Select value={selectedOwner || "ALL"} onValueChange={(value) => onOwnerChange?.(value === "ALL" ? "" : value)}>
      <SelectTrigger className="w-full bg-surface" aria-label="Owner"><SelectValue /></SelectTrigger>
      <SelectContent className="bg-surface"><SelectItem value="ALL">All owners</SelectItem><SelectItem value="none">Unassigned</SelectItem>{owners.map((owner) => <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>)}</SelectContent>
    </Select> },
    { key: "city", label: "City", active: Boolean(selectedCity), reset: () => onCityChange?.(""), control: <CityAutocomplete value={selectedCity} onChange={onCityChange} placeholder="All Cities" /> },
    { key: "activity", label: "Activity status", active: isActive !== undefined, reset: () => onIsActiveChange?.(undefined), control: <Select value={isActive === undefined ? "ALL" : isActive ? "ACTIVE" : "INACTIVE"} onValueChange={(value) => onIsActiveChange?.(value === "ALL" ? undefined : value === "ACTIVE")}>
      <SelectTrigger className="w-full bg-surface" aria-label="Activity status"><SelectValue /></SelectTrigger>
      <SelectContent className="bg-surface"><SelectItem value="ALL">All Status</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent>
    </Select> },
  ]} />;
}
