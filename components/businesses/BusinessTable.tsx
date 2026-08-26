"use client";

import React, { useState } from "react";
import { Download, SlidersHorizontal, ChevronDown, Phone, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { BusinessItem } from "./types";

// Official SVG WhatsApp Icon Component
function WhatsAppIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

interface BusinessTableProps {
  businesses: BusinessItem[];
  totalCount?: number;
  onExport?: () => void;
  sortOrder?: string;
  onSortOrderChange?: (sort: string) => void;
}

export default function BusinessTable({
  businesses,
  totalCount,
  onExport,
  sortOrder = "Latest First",
  onSortOrderChange,
}: BusinessTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState("10 per page");

  const displayCount = totalCount !== undefined ? totalCount : businesses.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4ecf2] bg-white shadow-[0_2px_12px_rgba(20,40,60,0.03)]">
      {/* Table Card Top Bar */}
      <div className="flex flex-col gap-3.5 border-b border-[#f1f5f9] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[#0f172a]">
          Businesses <span className="font-medium text-[#64748b]">({displayCount})</span>
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExport}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc]"
          >
            <Download className="size-4 text-[#64748b]" />
            Export
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const nextSort = sortOrder === "Latest First" ? "Oldest First" : "Latest First";
                if (onSortOrderChange) onSortOrderChange(nextSort);
              }}
              className="flex h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#334155] transition-colors hover:bg-[#f8fafc]"
            >
              <SlidersHorizontal className="size-4 text-[#64748b]" />
              <span>{sortOrder}</span>
              <ChevronDown className="size-4 text-[#64748b]" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-[#f8fafc] text-[13px] font-semibold text-[#475569]">
            <tr className="border-b border-[#f1f5f9]">
              <th className="py-4 pl-6 pr-4">Business Name</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">City</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Last Follow-up</th>
              <th className="px-4 py-4">Next Follow-up</th>
              <th className="py-4 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] text-sm text-[#334155]">
            {businesses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-[#64748b]">
                  No businesses found matching the current filters.
                </td>
              </tr>
            ) : (
              businesses.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[#f8fafc]/80"
                >
                  {/* Business Name + Avatar + Phone */}
                  <td className="py-4.5 pl-6 pr-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex size-10.5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.avatarBg} ${item.avatarTextColor}`}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[#64748b]">{item.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4.5 text-sm text-[#475569]">{item.category}</td>

                  {/* City */}
                  <td className="px-4 py-4.5 text-sm text-[#475569]">{item.city}</td>

                  {/* Status */}
                  <td className="px-4 py-4.5">
                    {item.status === "Active" ? (
                      <span className="inline-flex items-center rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48]">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-[#f2f4f7] px-3 py-1 text-xs font-semibold text-[#667085]">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Last Follow-up */}
                  <td className="px-4 py-4.5 text-sm text-[#475569]">{item.lastFollowUp}</td>

                  {/* Next Follow-up */}
                  <td className="px-4 py-4.5">
                    {item.nextFollowUpType === "today" ? (
                      <span className="inline-flex items-center rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48]">
                        Today
                      </span>
                    ) : item.nextFollowUpType === "tomorrow" ? (
                      <span className="inline-flex items-center rounded-md bg-[#eff8ff] px-3 py-1 text-xs font-semibold text-[#175cd3]">
                        Tomorrow
                      </span>
                    ) : item.nextFollowUpType === "date" ? (
                      <span className="inline-flex items-center rounded-md bg-[#eff8ff] px-3 py-1 text-xs font-semibold text-[#175cd3]">
                        {item.nextFollowUp}
                      </span>
                    ) : (
                      <span className="text-[#94a3b8]">-</span>
                    )}
                  </td>

                  {/* Actions (Call, WhatsApp, 3 dots) */}
                  <td className="py-4.5 pl-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      {/* Phone Call */}
                      <a
                        href={`tel:${item.phone}`}
                        title={`Call ${item.name}`}
                        className="flex size-8.5 items-center justify-center rounded-lg text-[#059669] transition-colors hover:bg-[#ecfdf3]"
                      >
                        <Phone className="size-4.5" />
                      </a>

                      {/* Official WhatsApp */}
                      <a
                        href={`https://wa.me/91${item.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`WhatsApp ${item.name}`}
                        className="flex size-8.5 items-center justify-center rounded-lg text-[#16a34a] transition-colors hover:bg-[#ecfdf3]"
                      >
                        <WhatsAppIcon className="size-4.5" />
                      </a>

                      {/* 3 Dots Menu */}
                      <button
                        type="button"
                        title="More Actions"
                        className="flex size-8.5 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#f1f5f9] hover:text-[#334155]"
                      >
                        <MoreVertical className="size-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-4 border-t border-[#f1f5f9] px-6 py-4.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#64748b]">
          Showing <span className="font-semibold text-[#0f172a]">1</span> to{" "}
          <span className="font-semibold text-[#0f172a]">{Math.min(10, displayCount)}</span> of{" "}
          <span className="font-semibold text-[#0f172a]">{displayCount}</span> results
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#cbd5e1] transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`flex size-8.5 items-center justify-center rounded-lg text-sm font-semibold shadow-sm ${
                currentPage === 1 ? "bg-[#0b63e5] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`flex size-8.5 items-center justify-center rounded-lg text-sm font-semibold shadow-sm ${
                currentPage === 2 ? "bg-[#0b63e5] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`flex size-8.5 items-center justify-center rounded-lg text-sm font-semibold shadow-sm ${
                currentPage === 3 ? "bg-[#0b63e5] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(4)}
              className={`flex size-8.5 items-center justify-center rounded-lg text-sm font-semibold shadow-sm ${
                currentPage === 4 ? "bg-[#0b63e5] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              4
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(5)}
              className={`flex size-8.5 items-center justify-center rounded-lg text-sm font-semibold shadow-sm ${
                currentPage === 5 ? "bg-[#0b63e5] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              5
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              className="flex size-8.5 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
              className="h-8.5 appearance-none rounded-lg border border-[#e2e8f0] bg-white pl-3.5 pr-8 text-xs font-medium text-[#334155] hover:border-[#cbd5e1] focus:outline-none"
            >
              <option>10 per page</option>
              <option>25 per page</option>
              <option>50 per page</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#64748b]" />
          </div>
        </div>
      </div>
    </div>
  );
}
