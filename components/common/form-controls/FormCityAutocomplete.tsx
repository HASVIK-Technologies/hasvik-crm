"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import AsyncAutocompleteSelect from "@/components/common/AsyncAutocompleteSelect";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface FormCityAutocompleteProps {
  id?: string;
  label: string;
  value?: string;
  onChange: (city: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function FormCityAutocomplete({
  id,
  label,
  value = "",
  onChange,
  placeholder = "Select a city",
  required,
  invalid,
}: FormCityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data: cities = [], isLoading } = useCityAutocomplete(
    debouncedSearch,
    open,
  );

  return (
    <AsyncAutocompleteSelect
      id={id}
      label={label}
      value={value}
      valueLabel={value}
      onChange={(city) => {
        onChange(city);
        setSearch("");
      }}
      options={cities.map((option) => ({
        value: option.city,
        label: option.city,
      }))}
      loading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      onOpenChange={setOpen}
      placeholder={placeholder}
      searchPlaceholder="Search cities..."
      emptyMessage="No matching city."
      icon={MapPin}
      required={required}
      invalid={invalid}
    />
  );
}
