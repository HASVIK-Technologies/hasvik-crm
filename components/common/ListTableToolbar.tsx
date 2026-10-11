"use client";

import { ArrowDownUp, ChevronDown } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ListSortOption = { value: string; label: string };

export default function ListTableToolbar({
  title,
  total,
  sortValue,
  sortOptions,
  onSortChange,
}: {
  title: string;
  total: number;
  sortValue: string;
  sortOptions: ListSortOption[];
  onSortChange: (value: string) => void;
}) {
  const selectedSort = sortOptions.find((option) => option.value === sortValue);

  return (
    <div className="flex flex-col gap-3.5 border-b border-[#f1f5f9] p-3 sm:flex-row sm:items-center sm:justify-between md:p-4">
      <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">
        {title} <span className="font-medium text-[#64748b]">({total})</span>
      </h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <OutlinedButton>
            <ArrowDownUp />
            <span>{selectedSort?.label ?? "Sort"}</span>
            <ChevronDown />
          </OutlinedButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-white">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onSortChange(option.value)}
              className={`cursor-pointer text-xs ${option.value === sortValue ? "font-semibold text-primary" : ""}`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
