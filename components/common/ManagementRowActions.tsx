"use client";

import { MoreVertical, Pencil, Power, Trash2 } from "lucide-react";
import TableActionButton from "@/components/common/TableActionButton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  showEdit = true,
  onEdit,
  onAction,
}: {
  editLabel: string;
  actionLabel?: string;
  actionDestructive?: boolean;
  disabled?: boolean;
  showEdit?: boolean;
  onEdit: () => void;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {showEdit && (
        <TableActionButton
          tooltip={editLabel}
          tone="brand"
          onClick={onEdit}
          aria-label={editLabel}
        >
          <Pencil className="size-4" />
        </TableActionButton>
      )}
      {actionLabel && onAction && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`More actions for ${editLabel.replace(/^Edit /, "")}`}
                  className="size-8 border border-transparent text-slate-500 shadow-none hover:bg-slate-100 hover:text-slate-800"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">More actions</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-40 bg-white">
            <DropdownMenuItem
              onSelect={onAction}
              disabled={disabled}
              className={`cursor-pointer gap-2 text-xs ${actionDestructive ? "text-rose-700 focus:text-rose-700" : "text-emerald-700 focus:text-emerald-700"}`}
            >
              {actionDestructive ? <Trash2 className="size-3.5" /> : <Power className="size-3.5" />}
              <span>{actionLabel}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
