"use client";

import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useBusinessStatuses } from "@/hooks/use-filter-options";
import FieldLabel from "@/components/businesses/FieldLabel";

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
  return <div className="w-full">{label && <FieldLabel htmlFor={id} required={required} invalid={invalid}>{label}</FieldLabel>}<Select value={value || "ALL"} onValueChange={(next) => onChange?.(next === "ALL" ? "" : next)}><SelectTrigger id={id} aria-invalid={invalid} className={`h-9 w-full rounded-lg bg-white border-input text-sm font-medium ${className ?? ""}`}><div className="flex min-w-0 flex-1 items-center gap-2"><Users className="size-3.5 shrink-0 text-[#64748b]" /><span className="truncate text-left">{value ? statuses[value] ?? value : "All Leads"}</span></div></SelectTrigger><SelectContent className="bg-white"><SelectItem value="ALL" className="text-xs">All Leads</SelectItem>{Object.entries(statuses).map(([key, displayName]) => <SelectItem key={key} value={key} className="text-xs">{displayName}</SelectItem>)}</SelectContent></Select></div>;
}