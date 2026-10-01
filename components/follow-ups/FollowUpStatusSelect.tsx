"use client";

import { Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useFollowUpStatusesQuery } from "@/hooks/use-follow-ups";

interface FollowUpStatusSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function FollowUpStatusSelect({ value = "", onChange, className }: FollowUpStatusSelectProps) {
  const { data: statuses = {} } = useFollowUpStatusesQuery();
  return (
    <Select value={value || "ALL"} onValueChange={(next) => onChange?.(next === "ALL" ? "" : next)}>
      <SelectTrigger className={`h-10 w-full rounded-xl border-[#e2e8f0] bg-white text-xs font-medium ${className ?? ""}`}>
        <div className="flex min-w-0 flex-1 items-center gap-2"><Activity className="size-3.5 shrink-0 text-[#64748b]" /><span className="truncate text-left">{value ? statuses[value] ?? value : "All Follow-up Statuses"}</span></div>
      </SelectTrigger>
      <SelectContent className="bg-white"><SelectItem value="ALL" className="text-xs">All Follow-up Statuses</SelectItem>{Object.entries(statuses).map(([key, label]) => <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>)}</SelectContent>
    </Select>
  );
}