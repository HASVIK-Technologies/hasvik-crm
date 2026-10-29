"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import TypeaheadField from "@/components/common/TypeaheadField";
import { useCategoryAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface FormCategoryAutocompleteProps {
  id?: string;
  label: string;
  value?: string;
  valueLabel?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function FormCategoryAutocomplete({
  id,
  label,
  value = "",
  valueLabel = "",
  onChange,
  placeholder = "Select a category",
  required,
  invalid,
}: FormCategoryAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search.trim());
  const { data: categories = [], isFetching } = useCategoryAutocomplete(debounced, open);

  return (
    <TypeaheadField
      id={id}
      label={label}
      ariaLabel="Category"
      icon={Tag}
      placeholder={placeholder}
      options={categories.map((category) => ({ value: category._id, label: category.name }))}
      value={value}
      valueLabel={valueLabel}
      onChange={(categoryId) => onChange(categoryId)}
      onQueryChange={setSearch}
      onOpenChange={setOpen}
      loading={open && isFetching && categories.length === 0}
      emptyText="No matching category. An admin can add one under Business categories."
      required={required}
      invalid={invalid}
    />
  );
}
