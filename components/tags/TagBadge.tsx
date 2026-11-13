"use client";

import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  color: string;
  className?: string;
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

export default function TagBadge({ name, color, className }: TagBadgeProps) {
  const safeColor = color.startsWith("#") ? color : `#${color}`;
  const backgroundColor = hexToRgba(safeColor, 0.12);
  const borderColor = hexToRgba(safeColor, 0.3);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors",
        className,
      )}
      style={{
        backgroundColor,
        color: safeColor,
        borderColor,
      }}
    >
      <Tag className="size-3 shrink-0" style={{ color: safeColor }} />
      <span>{name}</span>
    </span>
  );
}

