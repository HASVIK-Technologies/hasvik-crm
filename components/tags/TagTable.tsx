"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import TagBadge from "./TagBadge";
import TagEntityBadge from "./TagEntityBadge";
import type { TagItem } from "@/types/tag";
import { normalizeHexColor } from "@/lib/tags/api";
import { Button } from "@/components/ui/button";

export interface TagColumnsConfig {
  name: boolean;
  color: boolean;
  entity: boolean;
  description: boolean;
  actions: boolean;
}

interface TagTableProps {
  tags: TagItem[];
  isLoading?: boolean;
  total: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  visibleColumns?: TagColumnsConfig;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (tag: TagItem) => void;
  onDelete: (tag: TagItem) => void;
  onAddTag?: () => void;
}

const DEFAULT_COLUMNS: TagColumnsConfig = {
  name: true,
  color: true,
  entity: true,
  description: true,
  actions: true,
};

export default function TagTable({
  tags,
  isLoading = false,
  total,
  page,
  limit,
  sortBy,
  sortOrder,
  visibleColumns,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  onAddTag,
}: TagTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const columns = visibleColumns ?? DEFAULT_COLUMNS;

  // Calculate dynamic colspan based on visible columns
  const activeColSpan = useMemo(() => {
    let count = 1; // Checkbox column always present
    if (columns.name) count += 1;
    if (columns.color) count += 1;
    if (columns.entity) count += 1;
    if (columns.description) count += 1;
    if (columns.actions) count += 1;
    return count;
  }, [columns]);

  const allSelected = useMemo(
    () => tags.length > 0 && tags.every((t) => selectedIds.has(t.id)),
    [tags, selectedIds],
  );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tags.map((t) => t.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="size-3 text-slate-400" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="size-3 text-emerald-600 font-bold" />
    ) : (
      <ArrowDown className="size-3 text-emerald-600 font-bold" />
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-none shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-medium select-none">
              {/* Checkbox column */}
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all tags"
                  className="size-4 accent-emerald-600 rounded-none cursor-pointer"
                />
              </th>

              {/* Tag Name Column */}
              {columns.name && (
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort("name")}
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Tag Name</span>
                    {renderSortIcon("name")}
                  </button>
                </th>
              )}

              {/* Color Column */}
              {columns.color && (
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Color
                </th>
              )}

              {/* Entity Column */}
              {columns.entity && (
                <th className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort("entity")}
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Entity</span>
                    {renderSortIcon("entity")}
                  </button>
                </th>
              )}

              {/* Description Column */}
              {columns.description && (
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Description
                </th>
              )}

              {/* Actions Column */}
              {columns.actions && (
                <th className="px-4 py-3 text-right font-semibold text-slate-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={activeColSpan} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="size-6 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full" />
                    <span className="text-xs">Loading tags...</span>
                  </div>
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={activeColSpan} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="size-12 bg-slate-100 rounded-none flex items-center justify-center text-slate-400 mb-1">
                      <TagIcon className="size-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No tags found</p>
                    <p className="text-xs text-slate-500">
                      No tags matched your current search or entity filters. You can create a new tag to organize your data.
                    </p>
                    {onAddTag && (
                      <Button
                        type="button"
                        onClick={onAddTag}
                        className="mt-2 h-8 px-3 text-xs bg-[#16a34a] hover:bg-[#15803d] text-white rounded-none shadow-none font-medium"
                      >
                        + Add Tag
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              tags.map((tag) => {
                const isSelected = selectedIds.has(tag.id);
                const hexColor = normalizeHexColor(tag.color);

                return (
                  <tr
                    key={tag.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isSelected ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(tag.id)}
                        aria-label={`Select ${tag.name}`}
                        className="size-4 accent-emerald-600 rounded-none cursor-pointer"
                      />
                    </td>

                    {/* Tag Name Badge */}
                    {columns.name && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TagBadge name={tag.name} color={tag.color} />
                      </td>
                    )}

                    {/* Color Swatch & HEX */}
                    {columns.color && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className="size-3.5 border border-black/10 rounded-none shrink-0"
                            style={{ backgroundColor: hexColor }}
                          />
                          <span className="font-mono text-xs text-slate-600 uppercase font-medium">
                            {hexColor}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Entity */}
                    {columns.entity && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TagEntityBadge entity={tag.entity} />
                      </td>
                    )}

                    {/* Description */}
                    {columns.description && (
                      <td className="px-4 py-3 text-slate-600 max-w-md truncate">
                        {tag.description || <span className="text-slate-300 italic">—</span>}
                      </td>
                    )}

                    {/* Actions */}
                    {columns.actions && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(tag)}
                            title={`Edit ${tag.name}`}
                            aria-label={`Edit ${tag.name}`}
                            className="p-1.5 rounded-none bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 transition-colors border border-sky-100"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(tag)}
                            title={`Delete ${tag.name}`}
                            aria-label={`Delete ${tag.name}`}
                            className="p-1.5 rounded-none bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors border border-rose-100"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-500">
          Showing {startItem}–{endItem} of {total} tags
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1 || total === 0}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="size-7 flex items-center justify-center border border-slate-200 rounded-none text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isActive ? "page" : undefined}
                className={`size-7 text-xs font-semibold transition-colors rounded-none ${
                  isActive
                    ? "bg-[#16a34a] text-white"
                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            disabled={page >= totalPages || total === 0}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="size-7 flex items-center justify-center border border-slate-200 rounded-none text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
