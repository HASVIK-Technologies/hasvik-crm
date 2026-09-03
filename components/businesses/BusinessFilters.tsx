"use client";

import React, { useState } from "react";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";

interface BusinessFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
  onAddBusiness?: () => void;
  categories?: string[];
  statuses?: string[];
  cities?: string[];
}

export default function BusinessFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedCity,
  onCityChange,
  onAddBusiness,
  categories = [
    "All Categories",
    "Furniture Shop",
    "Hardware Store",
    "Construction",
    "Electrical Shop",
    "Kirana Store",
    "Service Center",
    "Medical Store",
  ],
  statuses = ["All Status", "Active", "Inactive"],
  cities = ["All Cities", "Ballia", "Buxar", "Ghazipur", "Varanasi"],
}: BusinessFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mobile Search & Filter Button Row */}
      <div className="flex items-center gap-2.5 sm:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-white pl-10 pr-10 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-primary"
          />
          <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
        </div>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white transition-colors hover:bg-[#f8fafc] ${
            showMobileFilters ? "border-primary text-primary" : "text-[#64748b]"
          }`}
        >
          <SlidersHorizontal className="size-4.5" />
        </Button>
      </div>

      {/* Mobile Expandable Filters */}
      {showMobileFilters && (
        <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-[#e4ecf2] bg-white p-3 md:p-4 shadow-sm sm:hidden">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-10 w-full rounded-lg border border-[#e2e8f0] bg-white pl-3 pr-3 text-xs font-medium text-[#334155]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 w-full rounded-lg border border-[#e2e8f0] bg-white pl-3 pr-3 text-xs font-medium text-[#334155]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {statuses.map((stat) => (
                <SelectItem key={stat} value={stat} className="text-xs">
                  {stat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger className="h-10 w-full rounded-lg border border-[#e2e8f0] bg-white pl-3 pr-3 text-xs font-medium text-[#334155]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="text-xs">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Desktop / Tablet Filters (Hidden on Mobile) */}
      <div className="hidden rounded-2xl border border-[#e4ecf2] bg-white p-3 md:p-4 shadow-[0_2px_12px_rgba(20,40,60,0.03)] sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3.5">
        <div className="flex flex-1 flex-wrap items-center gap-3.5">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-white pl-4.5 pr-11 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Search className="pointer-events-none absolute right-4 top-1/2 size-4.5 -translate-y-1/2 text-[#94a3b8]" />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-11 w-auto min-w-[145px] rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-3.5 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-primary focus-visible:ring-1 focus-visible:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="cursor-pointer">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-11 w-auto min-w-[125px] rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-3.5 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-primary focus-visible:ring-1 focus-visible:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {statuses.map((stat) => (
                <SelectItem key={stat} value={stat} className="cursor-pointer">
                  {stat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Cities Filter */}
          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger className="h-11 w-auto min-w-[125px] rounded-xl border border-[#e2e8f0] bg-white pl-4 pr-3.5 text-sm font-medium text-[#334155] hover:border-[#cbd5e1] focus:border-primary focus-visible:ring-1 focus-visible:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {cities.map((city) => (
                <SelectItem key={city} value={city} className="cursor-pointer">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Business Button (Desktop) */}
        <PrimaryButton
          type="button"
          onClick={onAddBusiness}
        >
          <Plus className="size-4.5 stroke-[2.5]" />
          Add Business
        </PrimaryButton>
      </div>
    </div>
  );
}
