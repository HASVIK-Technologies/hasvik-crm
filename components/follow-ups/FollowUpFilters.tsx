"use client";

import SelectField from "@/components/common/SelectField";
import ResponsiveFilters, { type ResponsiveFilter } from "@/components/common/ResponsiveFilters";
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
    { key: "business", label: "Business", active: Boolean(filters.businessId), reset: () => setOption("business"), control: <FollowUpAutocomplete kind="business" value={filters.businessId} label={filters.businessName} onChange={(option) => setOption("business", option)} placeholder="All businesses" /> },
    { key: "assignee", label: "Team member", active: Boolean(filters.assignedTo), reset: () => setOption("user"), control: <AssigneeAutocomplete value={filters.assignedTo} label={filters.assignedToName} onChange={(option) => setOption("user", option)} placeholder="All team members" /> },
    { key: "status", label: "Status", active: Boolean(filters.status), reset: () => setFilter("status", ""), control: <FollowUpStatusSelect value={filters.status} onChange={(value) => setFilter("status", value)} /> },
    { key: "type", label: "Type", active: Boolean(filters.type), reset: () => setFilter("type", ""), control: <SelectField ariaLabel="Follow-up type" value={filters.type || "ALL"} onChange={(value) => setFilter("type", value === "ALL" ? "" : value)} options={[{ value: "ALL", label: "All types" }, { value: "CALL", label: "Call" }, { value: "MEETING", label: "Meeting" }, { value: "EMAIL", label: "Email" }, { value: "WHATSAPP", label: "WhatsApp" }, { value: "OTHER", label: "Other" }]} /> },
  ];
  if (usesDateRange) fields.push({ key: "dates", label: "Date range", active: Boolean(filters.fromDate || filters.toDate), reset: () => { setFilter("fromDate", ""); setFilter("toDate", ""); }, control: <>
    <FollowUpDateRange from={filters.fromDate} to={filters.toDate} onChange={(from, to) => { setFilter("tab", "all"); setFilter("fromDate", from); setFilter("toDate", to); }} />
    <p className="mt-1.5 text-xs leading-4 text-muted">Choosing a custom range switches to All follow-ups.</p>
  </> });
  return <ResponsiveFilters fields={fields} onReset={reset} />;
}
