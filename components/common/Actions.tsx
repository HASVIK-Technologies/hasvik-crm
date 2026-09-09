"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import OutlinedButton from "./OutlinedButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
  destructive?: boolean;
}

interface ActionsProps {
  primary: ActionItem;
  secondary?: ActionItem[];
  menuItems?: ActionItem[];
  className?: string;
}

function ActionMenuItem({ action }: { action: ActionItem }) {
  const className = action.destructive
    ? "cursor-pointer text-xs text-destructive focus:text-destructive"
    : "cursor-pointer text-xs";

  if (action.href) {
    return (
      <DropdownMenuItem asChild className={className}>
        <Link href={action.href}>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem onSelect={action.onSelect} className={className}>
      {action.icon && <span className="mr-2">{action.icon}</span>}
      {action.label}
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
  const allActions = [primary, ...secondaryActions];

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <div className="hidden items-center gap-2 lg:flex">
        <ActionButton action={primary} />
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <OutlinedButton size="icon" aria-label="More actions">
                <MoreVertical className="size-4" />
              </OutlinedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white">
              {secondaryActions.map((action) => (
                <ActionMenuItem key={action.label} action={action} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <OutlinedButton size="icon" aria-label="More actions">
              <MoreVertical className="size-4" />
            </OutlinedButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            {allActions.map((action) => (
              <ActionMenuItem key={action.label} action={action} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
