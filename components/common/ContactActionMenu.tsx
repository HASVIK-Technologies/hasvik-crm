"use client";

import { Mail, Phone, Video } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import PlainButton from "@/components/common/PlainButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ContactNumber {
  number?: string;
  name?: string;
  type?: string;
  isPrimary?: boolean;
}

function normalizeNumbers(values?: Array<ContactNumber | string>, fallback?: string) {
  const seen = new Set<string>();
  return [...(values ?? []), ...(fallback ? [fallback] : [])].flatMap((value) => {
    const entry = typeof value === "string" ? { number: value } : value;
    const number = String(entry.number ?? "").trim();
    const digits = number.replace(/\D/g, "");
    if (!digits || seen.has(digits)) return [];
    seen.add(digits);
    return [{ ...entry, number, digits }];
  });
}

function labelFor(entry: ContactNumber, index: number) {
  return entry.name || entry.type || (entry.isPrimary ? "Primary" : `Number ${index + 1}`);
}

function ActionShell({ label, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <Tooltip><TooltipTrigger asChild>{children}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>;
}

export function PhoneActionMenu({ numbers, fallback, className, onAction }: { numbers?: Array<ContactNumber | string>; fallback?: string; className?: string; onAction?: () => void }) {
  const entries = normalizeNumbers(numbers, fallback);
  if (!entries.length) return null;
  const buttonClass = cn("flex size-8 items-center justify-center border border-transparent text-ok hover:bg-ok-soft hover:text-ok", className);
  if (entries.length === 1) return <ActionShell label={`Call ${entries[0].number}`} icon={null}><a href={`tel:${entries[0].digits}`} onClick={onAction} aria-label={`Call ${entries[0].number}`} className={buttonClass}><Phone className="size-4" /></a></ActionShell>;
  return <DropdownMenu><ActionShell label="Choose a phone number" icon={null}><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label="Choose a phone number" className={buttonClass}><Phone className="size-4" /></PlainButton></DropdownMenuTrigger></ActionShell><DropdownMenuContent align="end" className="w-64 bg-surface"><div className="border-b border-surface-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted">Call a number</div>{entries.map((entry, index) => <DropdownMenuItem key={entry.digits} asChild className="gap-3"><a href={`tel:${entry.digits}`} onClick={onAction}><Phone className="size-4 text-ok" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{entry.number}</span><span className="block text-[11px] text-muted">{labelFor(entry, index)}</span></span></a></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;
}

export function WhatsAppActionMenu({ numbers, fallback, className, onAction }: { numbers?: Array<ContactNumber | string>; fallback?: string; className?: string; onAction?: () => void }) {
  const entries = normalizeNumbers(numbers, fallback);
  if (!entries.length) return null;
  const url = (digits: string) => `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
  const buttonClass = cn("flex size-8 items-center justify-center border border-transparent text-ok hover:bg-ok-soft hover:text-ok", className);
  if (entries.length === 1) return <ActionShell label={`WhatsApp ${entries[0].number}`} icon={null}><a href={url(entries[0].digits)} target="_blank" rel="noopener noreferrer" onClick={onAction} aria-label={`WhatsApp ${entries[0].number}`} className={buttonClass}><WhatsAppIcon className="size-4" /></a></ActionShell>;
  return <DropdownMenu><ActionShell label="Choose a WhatsApp number" icon={null}><DropdownMenuTrigger asChild><PlainButton size="icon-sm" aria-label="Choose a WhatsApp number" className={buttonClass}><WhatsAppIcon className="size-4" /></PlainButton></DropdownMenuTrigger></ActionShell><DropdownMenuContent align="end" className="w-64 bg-surface"><div className="border-b border-surface-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted">Message on WhatsApp</div>{entries.map((entry, index) => <DropdownMenuItem key={entry.digits} asChild className="gap-3"><a href={url(entry.digits)} target="_blank" rel="noopener noreferrer" onClick={onAction}><WhatsAppIcon className="size-4 text-ok" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{entry.number}</span><span className="block text-[11px] text-muted">{labelFor(entry, index)}</span></span></a></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;
}

export function MeetingJoinAction({ href, className, onAction }: { href?: string; className?: string; onAction?: () => void }) {
  if (!href) return null;
  return <ActionShell label="Join meeting" icon={null}><a href={href} target="_blank" rel="noopener noreferrer" onClick={onAction} aria-label="Join meeting" className={cn("flex size-8 items-center justify-center border border-transparent text-brand-strong hover:bg-brand-soft", className)}><Video className="size-4" /></a></ActionShell>;
}

export function EmailAction({ email, className, onAction }: { email?: string; className?: string; onAction?: () => void }) {
  if (!email) return null;
  return <ActionShell label={`Email ${email}`}><a href={`mailto:${email}`} onClick={onAction} aria-label={`Email ${email}`} className={cn("flex size-8 items-center justify-center border border-transparent text-ink-soft hover:bg-surface-2", className)}><Mail className="size-4" /></a></ActionShell>;
}
