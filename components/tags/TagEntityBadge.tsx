"use client";

import { Building2, Calendar } from "lucide-react";
import { normalizeTagEntity } from "@/lib/tags/api";
import { cn } from "@/lib/utils";

interface TagEntityBadgeProps {
  entity?: string;
  className?: string;
}

export default function TagEntityBadge({ entity, className }: TagEntityBadgeProps) {
  const display = normalizeTagEntity(entity);
  const isBusiness = display === "Business";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border border-slate-200 bg-slate-50/70 text-slate-700",
        className,
      )}
    >
      {isBusiness ? (
        <Building2 className="size-3.5 text-slate-500 shrink-0" />
      ) : (
        <Calendar className="size-3.5 text-slate-500 shrink-0" />
      )}
      <span>{display}</span>
    </span>
  );
}

