"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStateCities, lookupPincode } from "@/lib/location/api";

// Postal data hardly ever changes, so each answer is kept for the whole visit.
const forever = { staleTime: Infinity, gcTime: 24 * 60 * 60_000, retry: 1, refetchOnWindowFocus: false } as const;

export function usePincodeLookup(pincode: string) {
  const valid = /^\d{6}$/.test(pincode);
  return useQuery({
    queryKey: ["location", "pincode", pincode],
    queryFn: ({ signal }) => lookupPincode(pincode, signal),
    enabled: valid,
    ...forever,
  });
}

export function useStateCities(state: string, enabled = true) {
  return useQuery({
    queryKey: ["location", "cities", state],
    queryFn: ({ signal }) => fetchStateCities(state, signal),
    enabled: enabled && Boolean(state.trim()),
    ...forever,
  });
}
