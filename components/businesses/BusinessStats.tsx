"use client";

import { Building2, CalendarCheck2, Tag, Store, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BusinessStatsData } from "@/types/business";

interface BusinessStatsProps {
  stats?: BusinessStatsData;
}

export default function BusinessStats({
  stats = {
    total: 156,
    active: 128,
    deactivated: 28,
    followUpToday: 18,
    categoriesCount: 24,
  },
}: BusinessStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Card 1: Total Businesses */}
      <Card className="flex flex-col justify-between rounded-2xl bg-white p-3 md:p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#e0effe] text-[#2563eb]">
            <Building2 className="size-5 sm:size-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-[#64748b]">Total Businesses</p>
            <h3 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">{stats.total}</h3>
          </div>
        </div>
      </Card>

      {/* Card 2: Active Businesses */}
      <Card className="flex flex-col justify-between rounded-2xl bg-white p-3 md:p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
            <Store className="size-5 sm:size-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-[#64748b]">Active Businesses</p>
            <h3 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">{stats.active}</h3>
          </div>
        </div>
      </Card>

      {/* Card 3: Deactivated Businesses */}
      <Card className="flex flex-col justify-between rounded-2xl bg-white p-3 md:p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#fee2e2] text-[#dc2626]">
            <AlertCircle className="size-5 sm:size-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-[#64748b]">Deactivated Businesses</p>
            <h3 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">{stats.deactivated ?? 0}</h3>
          </div>
        </div>
      </Card>

      {/* Card 4: Follow-up Today */}
      <Card className="flex flex-col justify-between rounded-2xl bg-white p-3 md:p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] text-[#d97706]">
            <CalendarCheck2 className="size-5 sm:size-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-[#64748b]">Follow-up Today</p>
            <h3 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">{stats.followUpToday}</h3>
          </div>
        </div>
      </Card>

      {/* Card 5: Categories */}
      <Card className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col justify-between rounded-2xl bg-white p-3 md:p-4 transition-all hover:shadow-md">
        <div className="flex items-start gap-3 sm:gap-3.5">
          <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#9333ea]">
            <Tag className="size-5 sm:size-6" />
          </div>
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-[#64748b]">Business Categories</p>
            <h3 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">{stats.categoriesCount}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
