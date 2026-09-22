"use client";

import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useBusinessStatuses } from "@/hooks/use-filter-options";

interface LeadStatusSelectProps { value?: string; onChange?: (value: string) => void; className?: string; }

export default function LeadStatusSelect({ value = "", onChange, className }: LeadStatusSelectProps) {
  const { data: statuses = {} } = useBusinessStatuses();
  return <Select value={value || "ALL"} onValueChange={(next) => onChange?.(next === "ALL" ? "" : next)}><SelectTrigger className={`h-10 w-full rounded-xl bg-white border-[#e2e8f0] text-xs font-medium ${className ?? ""}`}><div className="flex min-w-0 flex-1 items-center gap-2"><Users className="size-3.5 shrink-0 text-[#64748b]" /><span className="truncate text-left">{value ? statuses[value] ?? value : "All Leads"}</span></div></SelectTrigger><SelectContent className="bg-white"><SelectItem value="ALL" className="text-xs">All Leads</SelectItem>{Object.entries(statuses).map(([key, displayName]) => <SelectItem key={key} value={key} className="text-xs">{displayName}</SelectItem>)}</SelectContent></Select>;
}