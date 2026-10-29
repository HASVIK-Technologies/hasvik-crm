"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";
import { useCityAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface CityAutocompleteProps {
  value?: string;
  onChange?: (city: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  formLabel?: string;
  required?: boolean;
  invalid?: boolean;
}

/** City filter over the cities already used in the CRM. Empty means "All cities". */
export default function CityAutocomplete({ value = "", onChange, placeholder = "All cities", className, id, formLabel, required, invalid }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());
  const { data: options = [], isFetching } = useCityAutocomplete(debounced, open);
  return (
    <TypeaheadField
      id={id}
      label={formLabel}
      ariaLabel="City"
      icon={MapPin}
      placeholder={placeholder}
      options={options.map((option) => ({ value: option.city, label: option.city }))}
      value={value}
      valueLabel={value}
      onChange={(next) => onChange?.(next)}
      onQueryChange={setSearch}
      onOpenChange={setOpen}
      loading={open && isFetching && options.length === 0}
      emptyText="No business in that city yet."
      required={required}
      invalid={invalid}
      className={className}
    />
  );
}
