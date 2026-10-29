import {
  CalendarCheck2,
  Clock3,
  ListChecks,
  TriangleAlert,
} from "lucide-react";
import type { FollowUpKpis } from "@/types/follow-up";
import KpiCards, { type KpiItem } from "@/components/common/KpiCards";

const cards = [
  {
    key: "total",
    label: "Total follow-ups",
    icon: ListChecks,
    tone: "blue",
  },
  {
    key: "today",
    label: "Today",
    icon: CalendarCheck2,
    tone: "green",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: Clock3,
    tone: "amber",
  },
  {
    key: "overdue",
    label: "Overdue",
    icon: TriangleAlert,
    tone: "red",
  },
] satisfies Array<Omit<KpiItem, "value"> & { key: keyof FollowUpKpis }>;

export type FollowUpStatsTab = keyof FollowUpKpis;

/** Tapping a card opens that tab of the table; tapping the selected one again goes back to all follow-ups. */
export default function FollowUpStats({
  data,
  loading,
  selected = null,
  onSelect,
}: {
  data: FollowUpKpis;
  loading?: boolean;
  selected?: FollowUpStatsTab | null;
  onSelect?: (tab: FollowUpStatsTab) => void;
}) {
  return (
    <KpiCards
      loading={loading}
      items={cards.map(({ key, ...card }) => ({
        ...card,
        value: data[key],
        active: selected === key,
        onClick: onSelect ? () => onSelect(selected === key ? "total" : key) : undefined,
      }))}
    />
  );
}
