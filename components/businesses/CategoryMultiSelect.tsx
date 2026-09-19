"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X, Tag, Check, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBusinessCategoryAutocomplete } from "@/hooks/use-businesses";

interface CategoryMultiSelectProps {
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  onCategorySelect?: (categoryId: string, categoryName?: string) => void;
  placeholder?: string;
  className?: string;
  // Backward compatibility props
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce autocomplete search input by 300ms
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Server-side debounced category autocomplete query
  const { data: categoryOptions = [], isLoading } =
    useBusinessCategoryAutocomplete(open ? debouncedSearch : "");

  const handleSelect = (id: string, name: string) => {
    onCategorySelect?.(id, name);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onCategorySelect?.("", "");
    setSearchQuery("");
  };

  const displayLabel = selectedCategoryName || placeholder;
  const hasSelection = Boolean(selectedCategoryId);

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-2 text-xs font-medium text-[#334155] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#cbd5e1] hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0b63e5]/20 focus:border-[#0b63e5]",
              hasSelection && "border-[#0b63e5]/50 bg-[#f8faff] text-[#0b63e5]",
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Tag className="size-3.5 shrink-0 text-[#64748b]" />
              <span
                className={cn(
                  "truncate text-left",
                  !hasSelection ? "text-[#64748b]" : "font-semibold text-[#0f172a]",
                )}
              >
                {displayLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {hasSelection && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleClear();
                    }
                  }}
                  className="rounded p-0.5 text-[#94a3b8] hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors"
                  title="Clear category filter"
                >
                  <X className="size-3.5" />
                </span>
              )}
              <ChevronDown
                className={cn(
                  "size-3.5 text-[#64748b] transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[280px] sm:w-[320px] p-0 rounded-2xl border border-[#e2e8f0] bg-white shadow-xl overflow-hidden z-50"
          align="start"
        >
          {/* Header Search Input */}
          <div className="border-b border-[#f1f5f9] p-2.5">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-3.5 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="h-8.5 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-8.5 pr-8 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0b63e5] focus:bg-white focus:outline-none"
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
          </div>

          {/* Categories Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {/* All Categories Option */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelect("", "")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelect("", "");
                }
              }}
              className={cn(
                "flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors select-none",
                !selectedCategoryId
                  ? "bg-[#eff6ff] text-[#1d4ed8] font-semibold"
                  : "text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]",
              )}
            >
              <span>All Categories</span>
              {!selectedCategoryId && <Check className="size-3.5 text-[#1d4ed8]" />}
            </div>

            {isLoading && categoryOptions.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-xs text-[#64748b] gap-2">
                <Loader2 className="size-3.5 animate-spin text-[#0b63e5]" />
                <span>Searching categories...</span>
              </div>
            ) : categoryOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#64748b]">
                {searchQuery ? `No categories found matching "${searchQuery}"` : "No categories available"}
              </div>
            ) : (
              categoryOptions.map((cat) => {
                const isSelected = selectedCategoryId === cat._id;
                return (
                  <div
                    key={cat._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(cat._id, cat.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelect(cat._id, cat.name);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors select-none",
                      isSelected
                        ? "bg-[#eff6ff] text-[#1d4ed8] font-semibold"
                        : "text-[#334155] hover:bg-[#f8fafc] hover:text-[#0f172a]",
                    )}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && <Check className="size-3.5 text-[#1d4ed8] shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
