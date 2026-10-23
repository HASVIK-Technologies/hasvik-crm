"use client";

import React from "react";
import {
  Building2,
  Store,
  Flame,
  Trophy,
} from "lucide-react";
import KpiCards, { type KpiItem } from "@/components/common/KpiCards";
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

  const cards: KpiItem[] = [
    {
      label: "Total Businesses",
      value: total,
      icon: Building2,
      tone: "blue",
    },
    {
      label: "Active Businesses",
      value: active,
      icon: Store,
      tone: "green",
    },
    {
      label: "Interested",
      value: interested,
      icon: Flame,
      tone: "amber",
    },
    {
      label: "Won",
      value: won,
      icon: Trophy,
      tone: "violet",
    },
  ];

  return <KpiCards items={cards} loading={isLoading} />;
}
