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

/** Which card is filtering the list below. "total" means no stage or activity filter. */
export type BusinessStatsFilter = "total" | "active" | "interested" | "won";

interface BusinessStatsProps {
  stats?: BusinessKpisResponse;
  isLoading?: boolean;
  /** The card matching the current filters, or null when the filters are something no card represents. */
  selected?: BusinessStatsFilter | null;
  /** Tapping a card filters the list; tapping the selected one again goes back to all businesses. */
  onSelect?: (filter: BusinessStatsFilter) => void;
}

export default function BusinessStats({
  stats,
  isLoading = false,
  selected = null,
  onSelect,
}: BusinessStatsProps) {
  const total = stats?.total ?? 0;
  const active = stats?.active ?? 0;
  const interested = stats?.interested ?? 0;
  const won = stats?.won ?? 0;

  const pick = (filter: BusinessStatsFilter) =>
    onSelect ? () => onSelect(selected === filter ? "total" : filter) : undefined;

  const cards: KpiItem[] = [
    {
      label: "Total businesses",
      value: total,
      icon: Building2,
      tone: "blue",
      onClick: pick("total"),
      active: selected === "total",
    },
    {
      label: "Active businesses",
      value: active,
      icon: Store,
      tone: "green",
      onClick: pick("active"),
      active: selected === "active",
    },
    {
      label: "Interested",
      value: interested,
      icon: Flame,
      tone: "amber",
      onClick: pick("interested"),
      active: selected === "interested",
    },
    {
      label: "Won",
      value: won,
      icon: Trophy,
      tone: "green",
      onClick: pick("won"),
      active: selected === "won",
    },
  ];

  return <KpiCards items={cards} loading={isLoading} />;
}
