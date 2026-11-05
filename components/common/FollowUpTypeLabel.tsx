"use client";

import { MapPin } from "lucide-react";
import { formatFollowUpType } from "@/lib/business/form-options";
import { cn } from "@/lib/utils";

export default function FollowUpTypeLabel({
  type,
  className,
}: {
  type?: string | null;
  className?: string;
}) {
  const isVisit = type?.trim().toUpperCase() === "VISIT";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      {isVisit && <MapPin className="size-3.5 shrink-0" aria-hidden="true" />}
      {formatFollowUpType(type)}
    </span>
  );
}
