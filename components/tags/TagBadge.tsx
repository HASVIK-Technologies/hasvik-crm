"use client";

import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getColorCode } from "@/lib/tags/api";

interface TagBadgeProps {
  name: string;
  color: string;
  className?: string;
  compact?: boolean;
}

export function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return `rgba(32, 184, 63, ${alpha})`;
  }
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function TagBadge({ name, color, className, compact = false }: TagBadgeProps) {
  const safeColor = getColorCode(color);
  const backgroundColor = hexToRgba(safeColor, 0.12);
  const borderColor = hexToRgba(safeColor, 0.3);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold transition-colors",
        compact ? "gap-1 px-2 py-1 text-[11px] leading-none" : "gap-1.5 px-2.5 py-1 text-xs",
        className,
      )}
      style={{
        backgroundColor,
        color: safeColor,
        borderColor,
      }}
    >
      <Tag className={compact ? "size-2.5 shrink-0" : "size-3 shrink-0"} style={{ color: safeColor }} />
      <span className={compact ? "leading-none" : undefined}>{name}</span>
    </span>
  );
}

