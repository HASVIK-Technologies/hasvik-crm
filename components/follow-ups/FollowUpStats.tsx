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
    label: "Total Follow-ups",
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

export default function FollowUpStats({
  data,
  loading,
}: {
  data: FollowUpKpis;
  loading?: boolean;
}) {
  return (
    <KpiCards
      loading={loading}
      items={cards.map(({ key, ...card }) => ({ ...card, value: data[key] }))}
    />
  );
}
