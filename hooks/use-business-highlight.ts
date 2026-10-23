"use client";

import { useEffect } from "react";
import { useBusinessListStore } from "@/store/business-list-store";

const HIGHLIGHT_DURATION_MS = 3500;

export function useBusinessHighlight() {
  const highlightedBusinessId = useBusinessListStore(
    (state) => state.highlightedBusinessId,
  );
  const highlightRevision = useBusinessListStore(
    (state) => state.highlightRevision,
  );
  const scrollToHighlightedBusiness = useBusinessListStore(
    (state) => state.scrollToHighlightedBusiness,
  );
  const highlightBusiness = useBusinessListStore(
    (state) => state.highlightBusiness,
  );
  const clearBusinessHighlight = useBusinessListStore(
    (state) => state.clearBusinessHighlight,
  );

  useEffect(() => {
    if (!highlightedBusinessId) return;
    let clearTimer: number | undefined;
    let attempts = 0;
    const findItem = () => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-business-item-id="${CSS.escape(highlightedBusinessId)}"]`,
        ),
      );
      const item = candidates.find((candidate) => candidate.getClientRects().length > 0);
      if (item) {
        if (scrollToHighlightedBusiness) {
          item.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
            block: "center",
            inline: "nearest",
          });
        }
        clearTimer = window.setTimeout(
          () => clearBusinessHighlight(highlightRevision),
          HIGHLIGHT_DURATION_MS,
        );
      } else if (attempts++ < 40) {
        clearTimer = window.setTimeout(findItem, 100);
      }
    };
    findItem();
    return () => {
      if (clearTimer) window.clearTimeout(clearTimer);
    };
  }, [clearBusinessHighlight, highlightRevision, highlightedBusinessId, scrollToHighlightedBusiness]);

  return {
    highlightBusiness,
    isBusinessHighlighted: (id: string | number) =>
      highlightedBusinessId === String(id),
  };
}
