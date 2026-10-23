"use client";

import { useEffect } from "react";
import { useListActionStore } from "@/store/list-action-store";

export function useListActionHighlight(scope: string) {
  const current = useListActionStore((state) => state.highlights[scope]);
  const highlight = useListActionStore((state) => state.highlight);
  const clear = useListActionStore((state) => state.clear);

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => clear(scope, current.revision), 3500);
    return () => window.clearTimeout(timer);
  }, [clear, current, scope]);

  return {
    highlightItem: (id: string | number) => highlight(scope, id),
    isItemHighlighted: (id: string | number) => current?.id === String(id),
  };
}
