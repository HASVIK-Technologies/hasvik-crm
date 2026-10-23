"use client";

import Link from "next/link";
import { CircleDot, MoreVertical } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import OutlinedButton from "./OutlinedButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface ActionItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  desktopOnly?: boolean;
}

interface ActionsProps {
  primary: ActionItem;
  secondary?: ActionItem[];
  menuItems?: ActionItem[];
  className?: string;
}

function ActionMenuItem({ action }: { action: ActionItem }) {
  const className = cn(
    "text-xs",
    action.destructive
      ? "cursor-pointer text-destructive focus:text-destructive"
      : "cursor-pointer",
    action.disabled &&
      "cursor-not-allowed text-slate-400 opacity-40 select-none pointer-events-none hover:bg-transparent focus:bg-transparent"
  );

  if (action.href && !action.disabled) {
    return (
      <DropdownMenuItem
        asChild
        className={className}
        disabled={action.disabled}
      >
        <Link href={action.href}>
          <span className="mr-2 flex size-4 shrink-0 items-center justify-center">{action.icon ?? <CircleDot className="size-3.5" />}</span>
          <span>{action.label}</span>
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      onSelect={action.disabled ? undefined : action.onSelect}
      disabled={action.disabled}
      className={className}
    >
      <span className="mr-2 flex size-4 shrink-0 items-center justify-center">{action.icon ?? <CircleDot className="size-3.5" />}</span>
      <span>{action.label}</span>
    </DropdownMenuItem>
  );
}

function ActionButton({ action }: { action: ActionItem }) {
  const content = (
    <>
      {action.icon}
      {action.label}
    </>
  );

  if (action.disabled) {
    return (
      <PrimaryButton disabled className="opacity-50 pointer-events-none">
        {content}
      </PrimaryButton>
    );
  }

  if (action.href) {
    return (
      <PrimaryButton asChild>
        <Link href={action.href}>{content}</Link>
      </PrimaryButton>
    );
  }

  return <PrimaryButton onClick={action.onSelect}>{content}</PrimaryButton>;
}

export default function Actions({
  primary,
  secondary = [],
  menuItems = [],
  className = "",
}: ActionsProps) {
  const secondaryActions = [...secondary, ...menuItems];
  const allActions = [
    primary,
    ...secondaryActions.filter((action) => !action.desktopOnly),
  ];

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <div className="hidden items-center gap-2 lg:flex">
        <ActionButton action={primary} />
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild>
                <OutlinedButton size="icon" aria-label="More actions">
                  <MoreVertical className="size-4" />
                </OutlinedButton>
            </DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
            <DropdownMenuContent align="end" className="w-44 bg-white">
              {secondaryActions.map((action) => (
                <ActionMenuItem key={action.label} action={action} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <ActionButton action={primary} />
        {secondaryActions.filter((action) => !action.desktopOnly).length > 0 && <DropdownMenu>
          <Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild>
              <OutlinedButton size="icon" aria-label="More actions">
                <MoreVertical className="size-4" />
              </OutlinedButton>
          </DropdownMenuTrigger></TooltipTrigger><TooltipContent>More actions</TooltipContent></Tooltip>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            {allActions.slice(1).map((action) => (
              <ActionMenuItem key={action.label} action={action} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
    </div>
  );
}
