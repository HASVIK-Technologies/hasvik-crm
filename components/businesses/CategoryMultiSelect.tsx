"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Search, X, Check, Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryMultiSelectProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  categories: string[];
  categoryCounts?: Record<string, number>;
  placeholder?: string;
  className?: string;
  showChips?: boolean;
}

export default function CategoryMultiSelect({
  selectedCategories,
  onCategoriesChange,
  categories,
  categoryCounts = {},
  placeholder = "All Categories",
  className,
  showChips = true,
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize available categories (exclude "All Categories" placeholder from selectable list)
  const normalizedCategories = useMemo(() => {
    return categories.filter(
      (cat) => Boolean(cat) && cat !== "All Categories" && cat !== "all",
    );
  }, [categories]);

  // Filtered categories based on search input
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return normalizedCategories;
    const query = searchQuery.toLowerCase().trim();
    return normalizedCategories.filter((cat) =>
      cat.toLowerCase().includes(query),
    );
  }, [normalizedCategories, searchQuery]);

  // Toggle single category
  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  // Select all currently filtered categories
  const handleSelectAllFiltered = () => {
    const combined = Array.from(
      new Set([...selectedCategories, ...filteredCategories]),
    );
    onCategoriesChange(combined);
  };

  // Clear all selections
  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  // Remove individual category
  const handleRemoveCategory = (catToRemove: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onCategoriesChange(selectedCategories.filter((c) => c !== catToRemove));
  };

  // Trigger button label
  const triggerLabel = useMemo(() => {
    if (selectedCategories.length === 0) {
      return placeholder;
    }
    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }
    return `${selectedCategories.length} Categories`;
  }, [selectedCategories, placeholder]);

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-sm text-[#0f172a] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#cbd5e1] hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0b63e5]/20 focus:border-[#0b63e5]",
              selectedCategories.length > 0 && "border-[#0b63e5]/50 bg-[#f8faff]",
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Tag className="size-4 shrink-0 text-[#64748b]" />
              <span
                className={cn(
                  "truncate text-left",
                  selectedCategories.length === 0
                    ? "text-[#64748b]"
                    : "font-medium text-[#0f172a]",
                )}
              >
                {triggerLabel}
              </span>
              {selectedCategories.length > 1 && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0b63e5] text-[10px] font-semibold text-white">
                  {selectedCategories.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {selectedCategories.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      handleClearAll();
                    }
                  }}
                  className="rounded p-0.5 text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors"
                  title="Clear all selected categories"
                >
                  <X className="size-3.5" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "size-4 text-[#64748b] transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[300px] sm:w-[320px] p-0 rounded-2xl border border-[#e2e8f0] bg-white shadow-xl overflow-hidden"
          align="start"
        >
          {/* Header Search Input */}
          <div className="border-b border-[#f1f5f9] p-2.5">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="h-9 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-9 pr-8 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0b63e5] focus:bg-white focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 rounded p-0.5 text-[#94a3b8] hover:text-[#0f172a]"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[#64748b]">
              <span>
                {selectedCategories.length} selected
              </span>
              <div className="flex items-center gap-2">
                {filteredCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="font-medium text-[#0b63e5] hover:underline"
                  >
                    Select all
                  </button>
                )}
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-transparent">
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b]">
                No categories found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isChecked = selectedCategories.includes(category);
                const count = categoryCounts[category];

                return (
                  <div
                    key={category}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleCategory(category)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleCategory(category);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors select-none",
                      isChecked
                        ? "bg-[#eff6ff] text-[#1d4ed8]"
                        : "text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                      <Checkbox
                        checked={isChecked}
                        className={cn(
                          "size-4 rounded border-[#cbd5e1]",
                          isChecked && "border-[#0b63e5] bg-[#0b63e5]",
                        )}
                      />
                      <span className="truncate">{category}</span>
                    </div>

                    {count !== undefined && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums pointer-events-none",
                          isChecked
                            ? "bg-[#dbeafe] text-[#1e40af]"
                            : "bg-[#f1f5f9] text-[#64748b]",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="border-t border-[#f1f5f9] bg-[#fafafa] px-3 py-2 text-right">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#0f172a] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#1e293b]"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Removable Chips */}
      {showChips && selectedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#1e40af] transition-all hover:bg-[#dbeafe]"
            >
              <span className="truncate max-w-[140px]">{category}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveCategory(category, e)}
                aria-label={`Remove ${category}`}
                className="rounded-full p-0.5 hover:bg-[#bfdbfe] hover:text-[#1e3a8a] transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {selectedCategories.length >= 2 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-medium text-[#64748b] hover:text-red-600 hover:underline px-1 py-0.5 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
