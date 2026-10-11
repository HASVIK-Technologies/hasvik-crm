"use client";

import { MoreVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManagementRowActions({
  editLabel,
  actionLabel,
  actionDestructive = false,
  disabled = false,
  onEdit,
  onAction,
}: {
  editLabel: string;
  actionLabel: string;
  actionDestructive?: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
        className="size-8 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-primary"
      >
        <Pencil className="size-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`More actions for ${editLabel.replace(/^Edit /, "")}`}
            className="size-8 rounded-lg text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white">
          <DropdownMenuItem onSelect={onEdit} className="cursor-pointer text-xs">
            <Pencil className="mr-2 size-3.5" />
            {editLabel}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={onAction}
            disabled={disabled}
            className={`cursor-pointer text-xs ${actionDestructive ? "text-rose-700 focus:text-rose-700" : "text-emerald-700 focus:text-emerald-700"}`}
          >
            {actionLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
