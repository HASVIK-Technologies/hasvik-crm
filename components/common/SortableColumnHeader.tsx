"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export default function SortableColumnHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}) {
  const Icon =
    sortBy !== field ? ChevronsUpDown : sortOrder === "asc" ? ChevronUp : ChevronDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-left font-bold uppercase tracking-wide text-slate-400 transition-colors hover:text-slate-700"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
}
