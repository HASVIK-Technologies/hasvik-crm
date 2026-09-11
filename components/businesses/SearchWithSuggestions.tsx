"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Search,
  X,
  Building2,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { BusinessItem } from "@/types/business";
import { cn } from "@/lib/utils";

export interface SuggestionItem {
  id: string;
  value: string;
  label: string;
  type: "business" | "phone";
  subtitle?: string;
}

interface SearchWithSuggestionsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchChips?: string[];
  onSearchChipsChange?: (chips: string[]) => void;
  businesses: BusinessItem[];
  placeholder?: string;
  wrapperClassName?: string;
  className?: string;
  showChips?: boolean;
}

export default function SearchWithSuggestions({
  searchTerm,
  onSearchTermChange,
  businesses,
  placeholder = "Search by business name or phone number...",
  wrapperClassName,
  className,
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute unique suggestions strictly from business name and phone numbers
  const allSuggestions = useMemo<SuggestionItem[]>(() => {
    const rawSuggestions: SuggestionItem[] = [];
    const seenValues = new Set<string>();

    const addSuggestion = (
      val: string | undefined,
      type: SuggestionItem["type"],
      subtitle?: string,
    ) => {
      if (!val) return;
      const cleanVal = val.trim();
      if (!cleanVal || seenValues.has(cleanVal.toLowerCase())) return;

      seenValues.add(cleanVal.toLowerCase());
      rawSuggestions.push({
        id: `${type}-${cleanVal}`,
        value: cleanVal,
        label: cleanVal,
        type,
        subtitle,
      });
    };

    // Populate candidates: ONLY business name and phone numbers
    for (const b of businesses) {
      if (b.name) {
        addSuggestion(
          b.name,
          "business",
          b.phone ? `Phone: ${b.phone}` : undefined,
        );
      }
      if (b.phone) {
        addSuggestion(b.phone, "phone", b.name);
      }
      if (b.alternatePhone && b.alternatePhone !== b.phone) {
        addSuggestion(b.alternatePhone, "phone", `${b.name} (Alt Phone)`);
      }
    }

    return rawSuggestions;
  }, [businesses]);

  // Filter suggestions dynamically based on active search input
  const filteredSuggestions = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return allSuggestions.slice(0, 12);
    }

    const matched = allSuggestions.filter(
      (s) =>
        s.value.toLowerCase().includes(query) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(query)),
    );

    // Prioritize prefix matches
    matched.sort((a, b) => {
      const aStarts = a.value.toLowerCase().startsWith(query);
      const bStarts = b.value.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.value.localeCompare(b.value);
    });

    return matched.slice(0, 12);
  }, [allSuggestions, searchTerm]);

  // Select suggestion directly on click: fill input and close dropdown
  const handleSelectSuggestion = (val: string) => {
    onSearchTermChange(val);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onSearchTermChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const renderIcon = (type: SuggestionItem["type"]) => {
    switch (type) {
      case "business":
        return <Building2 className="size-4 text-[#0b63e5]" />;
      case "phone":
        return <Phone className="size-4 text-emerald-600" />;
    }
  };

  const renderBadge = (type: SuggestionItem["type"]) => {
    switch (type) {
      case "business":
        return (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
            Business
          </span>
        );
      case "phone":
        return (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Phone
          </span>
        );
    }
  };

  return (
    <div className={cn("relative flex flex-col gap-2 w-full", wrapperClassName)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          {/* Search Input Box */}
          <div className="relative flex items-center w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />

            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                onSearchTermChange(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onClick={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "h-10 w-full rounded-xl border border-[#e2e8f0] bg-white pl-10 pr-9 text-sm text-[#0f172a] shadow-[0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-[#94a3b8] transition-all hover:border-[#cbd5e1] focus:border-[#0b63e5] focus:outline-none focus:ring-2 focus:ring-[#0b63e5]/20",
                Boolean(searchTerm) && "border-[#0b63e5]/40",
                className,
              )}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </PopoverAnchor>

        {/* Clean Direct-Select Suggestion Popover */}
        <PopoverContent
          className="w-[320px] sm:w-[380px] p-0 rounded-2xl border border-[#e2e8f0] bg-white shadow-2xl z-50 overflow-hidden"
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#f1f5f9] bg-[#fafafa] px-3.5 py-2.5 text-[11px] font-semibold tracking-wide text-[#64748b]">
            <span className="flex items-center gap-1.5 text-[#0f172a]">
              <Sparkles className="size-3.5 text-[#0b63e5]" />
              {searchTerm ? "Matching Suggestions" : "Available Suggestions"}
            </span>
            <span className="text-[10px] font-normal text-[#94a3b8]">
              Click to search
            </span>
          </div>

          {/* Suggestions List (Click to select immediately) */}
          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-transparent">
            {filteredSuggestions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b]">
                {searchTerm
                  ? `No matching business or phone for "${searchTerm}"`
                  : "No business data available"}
              </div>
            ) : (
              filteredSuggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item.value)}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs cursor-pointer transition-colors text-[#334155] hover:bg-[#f8fafc] hover:text-[#0b63e5] group select-none"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="shrink-0">{renderIcon(item.type)}</span>

                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-semibold text-[#0f172a] group-hover:text-[#0b63e5] transition-colors">
                        {item.label}
                      </span>
                      {item.subtitle && (
                        <span className="truncate text-[11px] text-[#64748b] mt-0.5">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0">{renderBadge(item.type)}</span>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
