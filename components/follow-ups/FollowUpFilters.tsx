"use client";

import { Filter, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const active = Boolean(
    filters.businessId ||
    filters.assignedTo ||
    filters.status ||
    filters.type ||
    (usesDateRange && (filters.fromDate || filters.toDate)),
  );
  const moreFiltersActive = Boolean(
    filters.status ||
      filters.type ||
      (usesDateRange && (filters.fromDate || filters.toDate)),
  );
  const extraFilters = (
    <>
      <div className="w-full">
        <FollowUpStatusSelect value={filters.status} onChange={(value) => setFilter("status", value)} />
      </div>
      <div className="w-full">
        <Select value={filters.type || "ALL"} onValueChange={(value) => setFilter("type", value === "ALL" ? "" : value)}>
          <SelectTrigger className="h-10 bg-white text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-white"><SelectItem value="ALL">All Types</SelectItem><SelectItem value="CALL">Call</SelectItem><SelectItem value="MEETING">Meeting</SelectItem><SelectItem value="EMAIL">Email</SelectItem><SelectItem value="WHATSAPP">WhatsApp</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent>
        </Select>
      </div>
      {usesDateRange && (
        <div className="w-full">
          <FollowUpDateRange
            from={filters.fromDate}
            to={filters.toDate}
            onChange={(from, to) => {
              setFilter("tab", "all");
              setFilter("fromDate", from);
              setFilter("toDate", to);
            }}
          />
          <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
            Choosing a custom range switches the list to All follow-ups.
          </p>
        </div>
      )}
    </>
  );
  return (
    <div
      data-filter-controls
      className="flex w-full flex-wrap items-center gap-2.5"
    >
      <div className="w-full sm:w-48 xl:w-52">
        <FollowUpAutocomplete
          kind="business"
          value={filters.businessId}
          label={filters.businessName}
          onChange={(option) => setOption("business", option)}
          placeholder="All Businesses"
        />
      </div>
      <div className="w-full sm:w-44 xl:w-48">
        <AssigneeAutocomplete
          value={filters.assignedTo}
          label={filters.assignedToName}
          onChange={(option) => setOption("user", option)}
          placeholder="All Team Members"
        />
      </div>
      <div className="hidden lg:flex lg:items-center lg:gap-2.5">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={`inline-flex h-10 items-center gap-2 border px-3.5 text-xs font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors ${moreFiltersActive ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"}`}>
              <Filter className="size-3.5 text-[#64748b]" /> More Filters
              {moreFiltersActive && <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{[filters.status, filters.type, usesDateRange && (filters.fromDate || filters.toDate)].filter(Boolean).length}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[22rem] space-y-4 border border-slate-200 bg-white p-4 shadow-xl"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div><h4 className="text-xs font-bold text-slate-900">More Filters</h4><p className="mt-0.5 text-[10px] text-slate-500">{usesDateRange ? "Narrow the list by status, type, or date." : "The calendar period is selected above the calendar."}</p></div>{moreFiltersActive && <button type="button" onClick={() => { setFilter("status", ""); setFilter("type", ""); if (usesDateRange) { setFilter("fromDate", ""); setFilter("toDate", ""); } }} className="text-[11px] font-medium text-brand-blue hover:underline">Reset Extra</button>}</div><div className="flex flex-col gap-3">{extraFilters}</div></PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full flex-col gap-2.5 lg:hidden">{extraFilters}</div>
      {active && (
        <button
          type="button"
          onClick={reset}
          data-inline-filter-reset
          className="inline-flex h-10 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      )}
    </div>
  );
}
