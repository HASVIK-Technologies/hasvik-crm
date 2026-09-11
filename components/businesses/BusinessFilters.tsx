"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoryMultiSelect from "./CategoryMultiSelect";
import CityMultiSelect from "./CityMultiSelect";

interface BusinessFiltersProps {
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  selectedCategories?: string[];
  onCategoriesChange?: (categories: string[]) => void;
  categoryCounts?: Record<string, number>;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCity?: string;
  onCityChange?: (value: string) => void;
  selectedCities?: string[];
  onCitiesChange?: (cities: string[]) => void;
  cityCounts?: Record<string, number>;
  categories?: string[];
  statuses?: string[];
  cities?: string[];
}

export default function BusinessFilters({
  selectedCategory = "All Categories",
  onCategoryChange,
  selectedCategories = [],
  onCategoriesChange,
  categoryCounts,
  selectedStatus,
  onStatusChange,
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
}: BusinessFiltersProps) {
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

  return (
    <div
      data-filter-controls
      className="flex flex-col gap-3 lg:gap-3 lg:flex-row lg:items-start w-full"
    >
      <div className="w-full lg:w-64 shrink-0">
        <CategoryMultiSelect
          selectedCategories={activeCategories}
          onCategoriesChange={handleCategoriesChange}
          categories={categories}
          categoryCounts={categoryCounts}
          placeholder="All Categories"
        />
      </div>

      <div className="w-full lg:w-44 shrink-0">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-white border-[#e2e8f0]">
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
      </div>

      <div className="w-full lg:w-56 shrink-0">
        <CityMultiSelect
          selectedCities={activeCities}
          onCitiesChange={handleCitiesChange}
          cities={cities}
          cityCounts={cityCounts}
          placeholder="All Cities"
        />
      </div>
    </div>
  );
}
