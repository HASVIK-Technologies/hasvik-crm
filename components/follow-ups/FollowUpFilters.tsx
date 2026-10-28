"use client";

import ResponsiveFilters, { type ResponsiveFilter } from "@/components/common/ResponsiveFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FollowUpStatusSelect from "@/components/follow-ups/FollowUpStatusSelect";
import FollowUpAutocomplete from "@/components/follow-ups/FollowUpAutocomplete";
import AssigneeAutocomplete from "@/components/common/AssigneeAutocomplete";
import FollowUpDateRange from "@/components/follow-ups/FollowUpDateRange";
import type {
  FollowUpFilters as Filters,
  FollowUpOption,
} from "@/types/follow-up";
import type { FollowUpView } from "@/components/follow-ups/FollowUpViewToggle";

interface Props {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
  view: FollowUpView;
}
export default function FollowUpFilters({ filters, setFilter, reset, view }: Props) {
  const setOption = (key: "business" | "user", option?: FollowUpOption) => {
    if (key === "business") {
      setFilter("businessId", option?.id ?? "");
      setFilter("businessName", option?.label ?? "");
    } else {
      setFilter("assignedTo", option?.id ?? "");
      setFilter("assignedToName", option?.label ?? "");
    }
  };
  const usesDateRange = view === "table";
  const fields: ResponsiveFilter[] = [
    { key: "business", label: "Business", active: Boolean(filters.businessId), reset: () => setOption("business"), control: <FollowUpAutocomplete kind="business" value={filters.businessId} label={filters.businessName} onChange={(option) => setOption("business", option)} placeholder="All Businesses" /> },
    { key: "assignee", label: "Team member", active: Boolean(filters.assignedTo), reset: () => setOption("user"), control: <AssigneeAutocomplete value={filters.assignedTo} label={filters.assignedToName} onChange={(option) => setOption("user", option)} placeholder="All Team Members" /> },
    { key: "status", label: "Status", active: Boolean(filters.status), reset: () => setFilter("status", ""), control: <FollowUpStatusSelect value={filters.status} onChange={(value) => setFilter("status", value)} /> },
    { key: "type", label: "Type", active: Boolean(filters.type), reset: () => setFilter("type", ""), control: <Select value={filters.type || "ALL"} onValueChange={(value) => setFilter("type", value === "ALL" ? "" : value)}>
      <SelectTrigger aria-label="Follow-up type" className="w-full bg-surface"><SelectValue /></SelectTrigger>
      <SelectContent className="bg-surface"><SelectItem value="ALL">All Types</SelectItem><SelectItem value="CALL">Call</SelectItem><SelectItem value="MEETING">Meeting</SelectItem><SelectItem value="EMAIL">Email</SelectItem><SelectItem value="WHATSAPP">WhatsApp</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent>
    </Select> },
  ];
  if (usesDateRange) fields.push({ key: "dates", label: "Date range", active: Boolean(filters.fromDate || filters.toDate), reset: () => { setFilter("fromDate", ""); setFilter("toDate", ""); }, control: <>
    <FollowUpDateRange from={filters.fromDate} to={filters.toDate} onChange={(from, to) => { setFilter("tab", "all"); setFilter("fromDate", from); setFilter("toDate", to); }} />
    <p className="mt-1.5 text-[11px] leading-4 text-muted">Choosing a custom range switches to All follow-ups.</p>
  </> });
  return <ResponsiveFilters fields={fields} onReset={reset} />;
}
