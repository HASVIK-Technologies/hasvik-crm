"use client";

import React from "react";
import { Building2, CalendarCheck2, Tag, ArrowRight } from "lucide-react";
import { BusinessStatsData } from "./types";

interface BusinessStatsProps {
  stats?: BusinessStatsData;
}

export default function BusinessStats({
  stats = {
    total: 156,
    active: 128,
    followUpToday: 18,
    categoriesCount: 24,
  },
}: BusinessStatsProps) {
  const activePercentage = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total Businesses */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#e0effe] text-[#2563eb]">
            <Building2 className="size-6.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Total Businesses</p>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">{stats.total}</h3>
          </div>
        </div>
        <div className="mt-6 border-t border-[#f1f5f9] pt-3.5">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
          >
            View all businesses
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Card 2: Active Businesses */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
            <Building2 className="size-6.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Active Businesses</p>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">{stats.active}</h3>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[#f1f5f9] pt-3.5">
          <span className="text-sm font-semibold text-[#16a34a]">{activePercentage}% of total</span>
          <div className="h-7 w-28">
            <svg viewBox="0 0 110 28" className="h-full w-full overflow-visible" fill="none">
              <path
                d="M0 24 C 20 24, 30 18, 50 14 C 70 10, 80 16, 95 6 C 102 2, 107 4, 110 2"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 24 C 20 24, 30 18, 50 14 C 70 10, 80 16, 95 6 C 102 2, 107 4, 110 2 L 110 28 L 0 28 Z"
                fill="url(#greenGrad2)"
                opacity="0.28"
              />
              <defs>
                <linearGradient id="greenGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 3: Follow-up Today */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706]">
            <CalendarCheck2 className="size-6.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Follow-up Today</p>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">{stats.followUpToday}</h3>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[#f1f5f9] pt-3.5">
          <span className="text-sm font-medium text-[#64748b]">Needs attention</span>
          <div className="h-7 w-28">
            <svg viewBox="0 0 110 28" className="h-full w-full overflow-visible" fill="none">
              <path
                d="M0 24 C 25 24, 40 22, 60 16 C 80 10, 95 12, 110 4"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 24 C 25 24, 40 22, 60 16 C 80 10, 95 12, 110 4 L 110 28 L 0 28 Z"
                fill="url(#amberGrad2)"
                opacity="0.28"
              />
              <defs>
                <linearGradient id="amberGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Card 4: Categories */}
      <div className="flex flex-col justify-between rounded-2xl border border-[#e4ecf2] bg-white p-6 shadow-[0_2px_12px_rgba(20,40,60,0.03)] transition-all hover:shadow-[0_4px_18px_rgba(20,40,60,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#9333ea]">
            <Tag className="size-6.5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#64748b]">Categories</p>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a]">{stats.categoriesCount}</h3>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-[#f1f5f9] pt-3.5">
          <span className="text-sm font-medium text-[#64748b]">Business categories</span>
          <div className="h-7 w-28">
            <svg viewBox="0 0 110 28" className="h-full w-full overflow-visible" fill="none">
              <path
                d="M0 22 C 20 25, 45 16, 70 18 C 88 20, 98 10, 110 6"
                stroke="#9333ea"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 22 C 20 25, 45 16, 70 18 C 88 20, 98 10, 110 6 L 110 28 L 0 28 Z"
                fill="url(#purpleGrad2)"
                opacity="0.28"
              />
              <defs>
                <linearGradient id="purpleGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
