"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
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
import FollowUpDateRange from "@/components/follow-ups/FollowUpDateRange";
import type {
  FollowUpFilters as Filters,
  FollowUpOption,
} from "@/types/follow-up";

interface Props {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  reset: () => void;
}
export default function FollowUpFilters({ filters, setFilter, reset }: Props) {
  const setOption = (key: "business" | "user", option?: FollowUpOption) => {
    if (key === "business") {
      setFilter("businessId", option?.id ?? "");
      setFilter("businessName", option?.label ?? "");
    } else {
      setFilter("assignedTo", option?.id ?? "");
      setFilter("assignedToName", option?.label ?? "");
    }
  };
  const active = Boolean(
    filters.businessId ||
    filters.assignedTo ||
    filters.status ||
    filters.type ||
    filters.fromDate ||
    filters.toDate,
  );
  const moreFiltersActive = Boolean(filters.status || filters.type || filters.fromDate || filters.toDate);
  const extraFilters = (
    <>
      <div className="w-full sm:w-40">
        <FollowUpStatusSelect value={filters.status} onChange={(value) => setFilter("status", value)} />
      </div>
      <div className="w-full sm:w-36">
        <Select value={filters.type || "ALL"} onValueChange={(value) => setFilter("type", value === "ALL" ? "" : value)}>
          <SelectTrigger className="h-10 rounded-xl bg-white text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-white"><SelectItem value="ALL">All Types</SelectItem><SelectItem value="CALL">Call</SelectItem><SelectItem value="MEETING">Meeting</SelectItem><SelectItem value="EMAIL">Email</SelectItem><SelectItem value="WHATSAPP">WhatsApp</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-56"><FollowUpDateRange from={filters.fromDate} to={filters.toDate} onChange={(from, to) => { setFilter("fromDate", from); setFilter("toDate", to); }} /></div>
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
        <FollowUpAutocomplete
          kind="user"
          value={filters.assignedTo}
          label={filters.assignedToName}
          onChange={(option) => setOption("user", option)}
          placeholder="All Team Members"
        />
      </div>
      <div className="hidden lg:flex lg:items-center lg:gap-2.5">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${moreFiltersActive ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#e2e8f0] bg-white text-[#334155] hover:bg-[#f8fafc]"}`}>
              <SlidersHorizontal className="size-3.5 text-[#64748b]" /> More Filters
              {moreFiltersActive && <span className="flex size-4.5 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">{[filters.status, filters.type, filters.fromDate || filters.toDate].filter(Boolean).length}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[22rem] space-y-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xl"><div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2.5"><h4 className="text-xs font-bold text-[#0f172a]">More Filters</h4>{moreFiltersActive && <button type="button" onClick={() => { setFilter("status", ""); setFilter("type", ""); setFilter("fromDate", ""); setFilter("toDate", ""); }} className="text-[11px] font-medium text-[#2563eb] hover:underline">Reset Extra</button>}</div><div className="flex flex-col gap-3">{extraFilters}</div></PopoverContent>
        </Popover>
      </div>
      <div className="flex w-full flex-col gap-2.5 lg:hidden">{extraFilters}</div>
      {active && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-[#cbd5e1] px-3 text-xs font-semibold text-[#64748b] hover:border-red-300 hover:text-red-600"
        >
          <RotateCcw className="size-3" /> Reset
        </button>
      )}
    </div>
  );
}
