"use client";

import { useEffect } from "react";
import { useFollowUpListStore } from "@/store/follow-up-list-store";

export function useFollowUpHighlight() {
  const id = useFollowUpListStore((state) => state.highlightedFollowUpId);
  const revision = useFollowUpListStore((state) => state.highlightRevision);
  const date = useFollowUpListStore((state) => state.highlightedFollowUpDate);
  const shouldScroll = useFollowUpListStore(
    (state) => state.scrollToHighlightedFollowUp,
  );
  const highlightFollowUp = useFollowUpListStore(
    (state) => state.highlightFollowUp,
  );
  const clearHighlight = useFollowUpListStore(
    (state) => state.clearFollowUpHighlight,
  );

  useEffect(() => {
    if (!id && !date) return;
    let timer: number | undefined;
    let attempts = 0;
    const findItem = () => {
      const item = Array.from(
        document.querySelectorAll<HTMLElement>(
          `[data-follow-up-item-id="${CSS.escape(id ?? "")}"]`,
        ),
      ).find((candidate) => candidate.getClientRects().length > 0) ?? (date ? Array.from(document.querySelectorAll<HTMLElement>(`[data-follow-up-date="${CSS.escape(date)}"]`)).find((candidate) => candidate.getClientRects().length > 0) : undefined);
      if (item) {
        if (shouldScroll) {
          item.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
            block: "center",
            inline: "nearest",
          });
        }
        timer = window.setTimeout(() => clearHighlight(revision), 3500);
      } else if (attempts++ < 40) {
        timer = window.setTimeout(findItem, 100);
      } else {
        clearHighlight(revision);
      }
    };
    findItem();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [clearHighlight, id, date, revision, shouldScroll]);

  return {
    highlightFollowUp,
    isFollowUpHighlighted: (itemId: string) => itemId === id,
    isDayHighlighted: (day: string) => day === date,
  };
}
