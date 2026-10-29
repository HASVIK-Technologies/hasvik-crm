"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";
import { useCategoryAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface CategoryAutocompleteProps {
  value?: string;
  label?: string;
  onChange?: (id: string, name?: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  formLabel?: string;
  required?: boolean;
  invalid?: boolean;
}

/** Category filter. Empty means "All categories"; the clear button resets it. */
export default function CategoryAutocomplete({ value = "", label = "", onChange, placeholder = "All categories", className, id, formLabel, required, invalid }: CategoryAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());
  const { data: options = [], isFetching } = useCategoryAutocomplete(debounced, open);
  return (
    <TypeaheadField
      id={id}
      label={formLabel}
      ariaLabel="Category"
      icon={Tag}
      placeholder={placeholder}
      options={options.map((option) => ({ value: option._id, label: option.name }))}
      value={value}
      valueLabel={label}
      onChange={(next, name) => onChange?.(next, next ? name : "")}
      onQueryChange={setSearch}
      onOpenChange={setOpen}
      loading={open && isFetching && options.length === 0}
      emptyText="No matching category."
      required={required}
      invalid={invalid}
      className={className}
    />
  );
}
