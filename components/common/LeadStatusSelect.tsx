"use client";

import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import FieldLabel from "@/components/businesses/FieldLabel";
import { formatLeadStatus, getLeadStatusVisual, STATUS_OPTIONS } from "@/lib/business/form-options";

interface LeadStatusSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  id?: string;
  label?: string;
  required?: boolean;
  invalid?: boolean;
}

export default function LeadStatusSelect({ value = "", onChange, className, id, label, required, invalid }: LeadStatusSelectProps) {
  const { data: statuses = {} } = useBusinessStatuses();
  const statusKeys = Object.keys(statuses).length > 0
    ? Object.keys(statuses)
    : STATUS_OPTIONS.map((option) => option.value);
  return <div className="w-full">{label && <FieldLabel htmlFor={id} required={required} invalid={invalid}>{label}</FieldLabel>}<Select value={value || "ALL"} onValueChange={(next) => onChange?.(next === "ALL" ? "" : next)}><SelectTrigger id={id} aria-invalid={invalid} className={`h-10 w-full bg-surface text-sm font-medium ${className ?? ""}`}><div className="flex min-w-0 flex-1 items-center gap-2">{value ? <span className={`size-2 shrink-0 ${getLeadStatusVisual(value).dot}`} /> : <Users className="size-3.5 shrink-0 text-muted" />}<span className="truncate text-left">{value ? formatLeadStatus(value, statuses) : "All Leads"}</span></div></SelectTrigger><SelectContent className="bg-surface"><SelectItem value="ALL" className="text-xs">All Leads</SelectItem>{statusKeys.map((key) => <SelectItem key={key} value={key} className="text-xs"><span className="flex items-center gap-2"><span className={`size-2 shrink-0 ${getLeadStatusVisual(key).dot}`} />{formatLeadStatus(key, statuses)}</span></SelectItem>)}</SelectContent></Select></div>;
}
