"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Search, X, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CityMultiSelectProps {
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
  cities: string[];
  cityCounts?: Record<string, number>;
  placeholder?: string;
  className?: string;
  showChips?: boolean;
}

export default function CityMultiSelect({
  selectedCities,
  onCitiesChange,
  cities,
  cityCounts = {},
  placeholder = "All Cities",
  className,
  showChips = true,
}: CityMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize available cities (exclude "All Cities" placeholder from selectable list)
  const normalizedCities = useMemo(() => {
    return cities.filter(
      (city) => Boolean(city) && city !== "All Cities" && city !== "all",
    );
  }, [cities]);

  // Filtered cities based on search input
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return normalizedCities;
    const query = searchQuery.toLowerCase().trim();
    return normalizedCities.filter((city) =>
      city.toLowerCase().includes(query),
    );
  }, [normalizedCities, searchQuery]);

  // Toggle single city
  const handleToggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      onCitiesChange(selectedCities.filter((c) => c !== city));
    } else {
      onCitiesChange([...selectedCities, city]);
    }
  };

  // Select all currently filtered cities
  const handleSelectAllFiltered = () => {
    const combined = Array.from(
      new Set([...selectedCities, ...filteredCities]),
    );
    onCitiesChange(combined);
  };

  // Clear all selections
  const handleClearAll = () => {
    onCitiesChange([]);
  };

  // Remove individual city
  const handleRemoveCity = (cityToRemove: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onCitiesChange(selectedCities.filter((c) => c !== cityToRemove));
  };

  // Trigger button label
  const triggerLabel = useMemo(() => {
    if (selectedCities.length === 0) {
      return placeholder;
    }
    if (selectedCities.length === 1) {
      return selectedCities[0];
    }
    return `${selectedCities.length} Cities`;
  }, [selectedCities, placeholder]);

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
              selectedCities.length > 0 && "border-[#0b63e5]/50 bg-[#f8faff]",
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="size-4 shrink-0 text-[#64748b]" />
              <span
                className={cn(
                  "truncate text-left",
                  selectedCities.length === 0
                    ? "text-[#64748b]"
                    : "font-medium text-[#0f172a]",
                )}
              >
                {triggerLabel}
              </span>
              {selectedCities.length > 1 && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0b63e5] text-[10px] font-semibold text-white">
                  {selectedCities.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {selectedCities.length > 0 && (
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
                  title="Clear all selected cities"
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
          className="w-[280px] sm:w-[300px] p-0 rounded-2xl border border-[#e2e8f0] bg-white shadow-xl overflow-hidden z-50"
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
                placeholder="Search cities..."
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
              <span>{selectedCities.length} selected</span>
              <div className="flex items-center gap-2">
                {filteredCities.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="font-medium text-[#0b63e5] hover:underline"
                  >
                    Select all
                  </button>
                )}
                {selectedCities.length > 0 && (
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

          {/* Cities List */}
          <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-transparent">
            {filteredCities.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b]">
                No cities found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredCities.map((city) => {
                const isChecked = selectedCities.includes(city);
                const count = cityCounts[city];

                return (
                  <div
                    key={city}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleCity(city)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleCity(city);
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
                      <span className="truncate">{city}</span>
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

          {/* Footer */}
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
      {showChips && selectedCities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {selectedCities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#1e40af] transition-all hover:bg-[#dbeafe]"
            >
              <span className="truncate max-w-[130px]">{city}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveCity(city, e)}
                aria-label={`Remove ${city}`}
                className="rounded-full p-0.5 hover:bg-[#bfdbfe] hover:text-[#1e3a8a] transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {selectedCities.length >= 2 && (
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
