"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import AsyncAutocompleteSelect from "@/components/common/AsyncAutocompleteSelect";
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
  const debouncedSearch = useDebouncedValue(search);
  const { data: categories = [], isLoading } = useCategoryAutocomplete(
    debouncedSearch,
    open,
  );

  return (
    <AsyncAutocompleteSelect
      id={id}
      label={label}
      value={value}
      valueLabel={valueLabel}
      onChange={(categoryId, categoryName) => {
        onChange(categoryId);
        if (categoryId || !categoryName) setSearch("");
      }}
      options={categories.map((category) => ({
        value: category._id,
        label: category.name,
      }))}
      loading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      onOpenChange={setOpen}
      placeholder={placeholder}
      searchPlaceholder="Search categories..."
      emptyMessage="No matching category."
      icon={Tag}
      required={required}
      invalid={invalid}
    />
  );
}
