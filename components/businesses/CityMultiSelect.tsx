"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import AsyncAutocompleteSelect from "@/components/common/AsyncAutocompleteSelect";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface CityMultiSelectProps {
  selectedCity?: string;
  onCitySelect?: (city: string) => void;
  placeholder?: string;
  className?: string;
  selectedCities?: string[];
  onCitiesChange?: (cities: string[]) => void;
  cities?: string[];
  cityCounts?: Record<string, number>;
}

export default function CityMultiSelect({
  selectedCity = "",
  onCitySelect,
  placeholder = "All Cities",
  className,
}: CityMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data: cities = [], isLoading } = useCityAutocomplete(
    debouncedSearch,
    open,
  );
  const value = selectedCity === "All Cities" ? "" : selectedCity;

  return (
    <AsyncAutocompleteSelect
      value={value}
      valueLabel={value}
      onChange={(city) => {
        onCitySelect?.(city);
        setSearch("");
      }}
      options={cities.map((city) => ({
        value: city.city,
        label: city.city,
      }))}
      loading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      onOpenChange={setOpen}
      placeholder={placeholder}
      searchPlaceholder="Search cities..."
      emptyMessage="No cities found."
      icon={MapPin}
      emptyOption={{ value: "", label: placeholder }}
      className={className}
    />
  );
}
