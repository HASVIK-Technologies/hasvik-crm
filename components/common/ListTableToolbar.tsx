"use client";

import { ArrowDownUp, ChevronDown } from "lucide-react";
import OutlinedButton from "@/components/common/OutlinedButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableHeader } from "@/components/common/DataTableLayout";

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
    <DataTableHeader title={title} total={total} actions={<DropdownMenu>
        <DropdownMenuTrigger asChild>
          <OutlinedButton>
            <ArrowDownUp />
            <span>{selectedSort?.label ?? "Sort"}</span>
            <ChevronDown />
          </OutlinedButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-surface">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onSortChange(option.value)}
              className={`cursor-pointer text-xs ${option.value === sortValue ? "font-semibold text-brand-strong" : ""}`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>} />
  );
}
