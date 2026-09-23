import {
  CalendarCheck2,
  Clock3,
  ListChecks,
  TriangleAlert,
} from "lucide-react";
import type { FollowUpKpis } from "@/types/follow-up";

const cards = [
  {
    key: "total",
    label: "Total Follow-ups",
    icon: ListChecks,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    key: "today",
    label: "Today",
    icon: CalendarCheck2,
    tone: "bg-green-50 text-green-600",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: Clock3,
    tone: "bg-orange-50 text-orange-600",
  },
  {
    key: "overdue",
    label: "Overdue",
    icon: TriangleAlert,
    tone: "bg-red-50 text-red-600",
  },
] as const;

export default function FollowUpStats({
  data,
  loading,
}: {
  data: FollowUpKpis;
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-2xl border border-[#e7edf3] bg-white p-4 shadow-[0_2px_10px_rgba(20,40,60,0.03)]"
        >
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#0f172a]">
              {loading ? "-" : data[key]}
            </p>
            <p className="text-[11px] font-medium text-[#64748b]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
