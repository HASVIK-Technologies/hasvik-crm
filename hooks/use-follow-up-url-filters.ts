"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { FilterChip } from "@/components/common/ActiveFilterChips";
import { useFollowUpListStore } from "@/store/follow-up-list-store";

const KEYS = ["status", "fromDate", "toDate", "assignedTo", "type"] as const;
type Key = (typeof KEYS)[number];

const STATUS_LABEL: Record<string, string> = { SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled", OVERDUE: "Overdue" };

function dayLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(date);
}

/**
 * Keeps the follow-up list filters in the URL so dashboard cards and reports can deep-link to them and a refresh
 * keeps them. Reads the URL once on arrival, then mirrors store changes back with replaceState.
 */
export function useFollowUpUrlFilters(): { chips: FilterChip[]; clearAll: () => void } {
  const searchParams = useSearchParams();
  const store = useFollowUpListStore();
  const initialised = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const incoming = Object.fromEntries(KEYS.map((key) => [key, searchParams.get(key) ?? ""])) as Record<Key, string>;
    if (KEYS.some((key) => incoming[key])) {
      useFollowUpListStore.getState().reset();
      useFollowUpListStore.setState({ ...incoming, assignedToName: searchParams.get("assignedToName") ?? "", page: 1 });
    }
    setReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (!ready) return;
    const next = new URLSearchParams(window.location.search);
    for (const key of KEYS) {
      if (store[key]) next.set(key, store[key]);
      else next.delete(key);
    }
    const query = next.toString();
    const target = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (target !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(null, "", target);
  }, [ready, store.status, store.fromDate, store.toDate, store.assignedTo, store.type]);

  const chips = useMemo<FilterChip[]>(() => {
    const clear = (key: Key) => () => useFollowUpListStore.getState().setFilter(key, "");
    const list: FilterChip[] = [];
    if (store.status) list.push({ key: "status", label: `Status: ${STATUS_LABEL[store.status] ?? store.status}`, onRemove: clear("status") });
    if (store.fromDate || store.toDate) {
      const label = store.fromDate && store.toDate ? `${dayLabel(store.fromDate)} to ${dayLabel(store.toDate)}` : store.fromDate ? `From ${dayLabel(store.fromDate)}` : `Until ${dayLabel(store.toDate)}`;
      list.push({ key: "dates", label: `Date: ${label}`, onRemove: () => useFollowUpListStore.setState({ fromDate: "", toDate: "", page: 1 }) });
    }
    if (store.assignedTo) list.push({ key: "assignedTo", label: `Owner: ${store.assignedToName || "selected user"}`, onRemove: () => useFollowUpListStore.setState({ assignedTo: "", assignedToName: "", page: 1 }) });
    if (store.type) list.push({ key: "type", label: `Type: ${store.type.charAt(0)}${store.type.slice(1).toLowerCase()}`, onRemove: clear("type") });
    return list;
  }, [store.status, store.fromDate, store.toDate, store.assignedTo, store.assignedToName, store.type]);

  return { chips, clearAll: () => useFollowUpListStore.getState().reset() };
}
