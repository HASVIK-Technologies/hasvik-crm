"use client";

import React from "react";
import {
  Building2,
  Store,
  Flame,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BusinessKpisResponse } from "@/types/business-api";

interface BusinessStatsProps {
  stats?: BusinessKpisResponse;
  isLoading?: boolean;
}

export default function BusinessStats({
  stats,
  isLoading = false,
}: BusinessStatsProps) {
  const total = stats?.total ?? 0;
  const active = stats?.active ?? 0;
  const interested = stats?.interested ?? 0;
  const won = stats?.won ?? 0;

  const cards = [
    {
      label: "Total Businesses",
      value: total,
      icon: Building2,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Active Businesses",
      value: active,
      icon: Store,
      iconBg: "bg-brand-green/10",
      iconColor: "text-brand-green-strong",
    },
    {
      label: "Interested",
      value: interested,
      icon: Flame,
      iconBg: "bg-[#fef3c7]",
      iconColor: "text-[#d97706]",
    },
    {
      label: "Won",
      value: won,
      icon: Trophy,
      iconBg: "bg-[#ede9fe]",
      iconColor: "text-[#7c3aed]",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.label}
            className="flex flex-col justify-between rounded-2xl bg-white p-3 md:p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 ${card.iconBg} ${card.iconColor}`}
              >
                <Icon className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-[#64748b] sm:text-xs">
                  {card.label}
                </p>
                {isLoading ? (
                  <div className="mt-1.5 h-7 w-14 animate-pulse rounded-md bg-[#f1f5f9]" />
                ) : (
                  <h3 className="mt-0.5 text-xl font-bold tracking-tight text-[#0f172a] sm:mt-1 sm:text-2xl">
                    {card.value}
                  </h3>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
