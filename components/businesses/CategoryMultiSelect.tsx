"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import AsyncAutocompleteSelect from "@/components/common/AsyncAutocompleteSelect";
import { useCategoryAutocomplete } from "@/hooks/use-filter-options";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface CategoryMultiSelectProps {
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  onCategorySelect?: (categoryId: string, categoryName?: string) => void;
  placeholder?: string;
  className?: string;
  selectedCategories?: string[];
  onCategoriesChange?: (categories: string[]) => void;
  categories?: string[];
  categoryCounts?: Record<string, number>;
}

export default function CategoryMultiSelect({
  selectedCategoryId = "",
  selectedCategoryName = "",
  onCategorySelect,
  placeholder = "All Categories",
  className,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const { data: categories = [], isLoading } = useCategoryAutocomplete(
    debouncedSearch,
    open,
  );

  return (
    <AsyncAutocompleteSelect
      value={selectedCategoryId}
      valueLabel={selectedCategoryName}
      onChange={(id, name) => {
        onCategorySelect?.(id, id ? name : "");
        setSearch("");
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
      emptyMessage="No categories found."
      icon={Tag}
      emptyOption={{ value: "", label: placeholder }}
      className={className}
    />
  );
}
