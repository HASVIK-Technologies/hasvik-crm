"use client";

import { CalendarClock, Check, Eye, MoreVertical, Pencil, Power, UserRoundCog } from "lucide-react";
import { useRouter } from "next/navigation";
import RecordLink from "@/components/common/RecordLink";
import { ActivityStateText } from "@/components/common/ActivityStateText";
import { PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { relativeDay } from "@/lib/analytics/relative";
import { STATUS_OPTIONS } from "@/lib/business/form-options";
import { cn } from "@/lib/utils";
import type { BusinessItem } from "@/types/business";

const TONE: Record<string, string> = {
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
  brand: "bg-brand-soft text-brand-strong",
  muted: "bg-surface-2 text-ink-soft",
};

export interface LeadCardProps {
  business: BusinessItem;
  highlighted?: boolean;
  /** A stage change for this lead is in flight. */
  pending?: boolean;
  /** Desktop board only: the card can be dragged to another stage. */
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
  onDragEnd?: () => void;
  dragging?: boolean;
  onOpen: () => void;
  onTouched: () => void;
  onMove: (stage: string) => void;
  onAssign: () => void;
  onActivate: () => void;
}

/** The lead card used on the pipeline board and in the phone list, so a lead looks the same everywhere. */
export default function LeadCard({ business, highlighted, pending, draggable, onDragStart, onDragEnd, dragging, onOpen, onTouched, onMove, onAssign, onActivate }: LeadCardProps) {
  const router = useRouter();
  const active = business.status === "Active";
  const stage = business.leadStatus?.toUpperCase() || "NEW";
  const next = relativeDay(business.nextFollowupDate, new Date());
  const place = [business.category, business.city].filter(Boolean).join(" · ");

  return (
    <article
      data-business-item-id={String(business.id)}
      draggable={draggable && active && !pending}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => active && onOpen()}
      aria-busy={pending}
      className={cn(
        "group relative rounded-2xl border bg-surface p-3.5 shadow-card transition-[border-color,box-shadow,transform] duration-200",
        highlighted ? "border-brand bg-brand-soft/60 ring-2 ring-brand/20" : "border-line",
        active ? "cursor-pointer hover:border-brand/50 hover:shadow-pop" : "opacity-60",
        draggable && active && !pending && "sm:cursor-grab sm:active:cursor-grabbing",
        dragging && "scale-[1.02] shadow-float ring-2 ring-brand/40",
        pending && "pointer-events-none opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0 bg-brand-soft text-brand-strong">
          <AvatarFallback className="bg-transparent text-xs font-bold text-inherit">{business.initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <RecordLink
            href={`/businesses/${business.id}`}
            onClick={(event) => { event.stopPropagation(); onTouched(); }}
            className="line-clamp-2 text-base leading-snug font-semibold text-ink hover:text-brand-strong"
            title={business.name}
          >
            {business.name}
          </RecordLink>
          {place && <p className="mt-0.5 truncate text-sm text-muted">{place}</p>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              aria-label={`More actions for ${business.name}`}
              className="-mt-1 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink sm:size-9"
            >
              <MoreVertical className="size-5" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-surface" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem onSelect={onOpen} className="gap-2"><Eye className="size-4" />View details</DropdownMenuItem>
            {active && (
              <>
                <DropdownMenuItem onSelect={() => { onTouched(); router.push(`/businesses/form/${business.id}`); }} className="gap-2"><Pencil className="size-4" />Edit business</DropdownMenuItem>
                <DropdownMenuItem onSelect={onAssign} className="gap-2"><UserRoundCog className="size-4" />{business.assignedToId ? "Reassign owner" : "Assign owner"}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold text-muted">Move to</DropdownMenuLabel>
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.value} onSelect={() => onMove(option.value)} disabled={option.value === stage} className="gap-2">
                    <span className="grid size-4 place-items-center">{option.value === stage && <Check className="size-4 text-brand-strong" aria-hidden />}</span>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            {!active && <DropdownMenuItem onSelect={onActivate} className="gap-2 text-ok"><Power className="size-4" />Activate business</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {business.owner ? (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-2 py-1 pr-2.5 pl-1 text-sm text-ink-soft">
            <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-btn text-xs font-bold text-white">{business.owner.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
            <span className="truncate">{business.owner}</span>
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-warn-soft px-2.5 py-1 text-sm font-semibold text-warn">Unassigned</span>
        )}
        {next && (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold", TONE[next.tone])} title={business.nextFollowUp}>
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            {next.label}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2" onClick={(event) => event.stopPropagation()}>
        {active ? (
          <div className="-ml-1 flex items-center">
            <PhoneActionMenu numbers={business.phoneNumbers} fallback={business.phone} onAction={onTouched} />
            <WhatsAppActionMenu numbers={business.whatsappNumbers} fallback={business.alternatePhone} onAction={onTouched} />
          </div>
        ) : (
          <ActivityStateText active={false} />
        )}
        {pending && <span className="text-sm font-semibold text-brand-strong">Moving…</span>}
      </div>
    </article>
  );
}
