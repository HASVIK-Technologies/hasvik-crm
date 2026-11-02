"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFollowUpListStore } from "@/store/follow-up-list-store";

const KEYS = ["status", "fromDate", "toDate", "assignedTo", "assignedToName", "type"] as const;
type Key = (typeof KEYS)[number];

export function useFollowUpUrlFilters() {
  const searchParams = useSearchParams();
  const initialised = useRef(false);
  const [ready, setReady] = useState(false);
  const status = useFollowUpListStore((state) => state.status);
  const fromDate = useFollowUpListStore((state) => state.fromDate);
  const toDate = useFollowUpListStore((state) => state.toDate);
  const assignedTo = useFollowUpListStore((state) => state.assignedTo);
  const assignedToName = useFollowUpListStore((state) => state.assignedToName);
  const type = useFollowUpListStore((state) => state.type);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const incoming = Object.fromEntries(
      KEYS.map((key) => [key, searchParams.get(key) ?? ""]),
    ) as Record<Key, string>;
    if (KEYS.some((key) => incoming[key])) {
      useFollowUpListStore.getState().reset();
      useFollowUpListStore.setState({ ...incoming, page: 1, tab: "all", view: "table" });
    }
    setReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (!ready) return;
    const current: Record<Key, string> = {
      status,
      fromDate,
      toDate,
      assignedTo,
      assignedToName,
      type,
    };
    const next = new URLSearchParams(window.location.search);
    for (const key of KEYS) {
      if (current[key]) next.set(key, current[key]);
      else next.delete(key);
    }
    const query = next.toString();
    const target = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    if (target !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", target);
    }
  }, [ready, status, fromDate, toDate, assignedTo, assignedToName, type]);
}
