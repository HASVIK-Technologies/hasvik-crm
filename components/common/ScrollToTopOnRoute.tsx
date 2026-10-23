"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function resetDocumentScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Resets entry position for destination pages that should always open at the
 * beginning. The next-frame pass wins over browser history scroll restoration
 * without changing restoration behavior on list pages.
 */
export default function ScrollToTopOnRoute() {
  const pathname = usePathname();

  useEffect(() => {
    resetDocumentScroll();
    const frame = window.requestAnimationFrame(resetDocumentScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
