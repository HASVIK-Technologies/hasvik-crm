"use client";

import React, { useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import type { CategoryOption } from "@/hooks/use-businesses";

type FilterOption = { value: string; label: string };

function FilterCombobox({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  searchPlaceholder: string;
}) {
  return (
    <Combobox
      value={value}
      items={options}
      onValueChange={(nextValue) => onChange(nextValue ?? "")}
    >
      <ComboboxInput
        className="w-full lg:min-w-40"
        placeholder={placeholder}
        showClear={value !== options[0]?.value}
      />
      <ComboboxContent>
        <ComboboxEmpty>No matches found.</ComboboxEmpty>
        <ComboboxList>
          {options.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

interface BusinessFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLeadStatus: string;
  onLeadStatusChange: (value: string) => void;
  selectedActivityStatus: string;
  onActivityStatusChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
  selectedState: string;
  onStateChange: (value: string) => void;
  categories?: CategoryOption[];
  cities?: string[];
  states?: string[];
}

export default function BusinessFilters({
  selectedCategory,
  onCategoryChange,
  selectedLeadStatus,
  onLeadStatusChange,
  selectedActivityStatus,
  onActivityStatusChange,
  selectedCity,
  onCityChange,
  selectedState,
  onStateChange,
  categories = [{ id: "", name: "All Categories" }],
  cities = ["All Cities", "Ballia", "Buxar", "Ghazipur", "Varanasi"],
  states = ["All States"],
}: BusinessFiltersProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const categoryOptions = categories.map((category) => ({
    value: category.id || "All Categories",
    label: category.name,
  }));

  return (
    <div
      data-filter-controls
      className="flex flex-col gap-5 lg:gap-4 lg:flex-row lg:items-center"
    >
      <FilterCombobox
        value={selectedCategory}
        onChange={onCategoryChange}
        options={categoryOptions}
        placeholder="All Categories"
        searchPlaceholder="Search categories..."
      />
      <FilterCombobox
        value={selectedLeadStatus}
        onChange={onLeadStatusChange}
        options={[
          "All Lead Statuses",
          "NEW",
          "FOLLOWUP",
          "NOT INTERESTED",
          "INVALID",
          "DEMO",
          "INTERESTED",
          "PROPOSAL",
          "WON",
          "LOST",
        ].map((status) => ({ value: status, label: status }))}
        placeholder="All Lead Statuses"
        searchPlaceholder="Search statuses..."
      />
      <FilterCombobox
        value={selectedCity}
        onChange={onCityChange}
        options={cities.map((city) => ({ value: city, label: city }))}
        placeholder="All Cities"
        searchPlaceholder="Search cities..."
      />
      <FilterCombobox
        value={selectedState}
        onChange={onStateChange}
        options={states.map((state) => ({ value: state, label: state }))}
        placeholder="All States"
        searchPlaceholder="Search states..."
      />
      <FilterCombobox
        value={selectedActivityStatus}
        onChange={onActivityStatusChange}
        options={["All Status", "Active", "Inactive"].map((status) => ({
          value: status,
          label: status,
        }))}
        placeholder="All Status"
        searchPlaceholder="Search activity..."
      />
    </div>
  );
}
