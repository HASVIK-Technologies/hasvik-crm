"use client";

import { Mail, Phone, Video } from "lucide-react";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EmailAction,
  MeetingJoinAction,
  PhoneActionMenu,
  WhatsAppActionMenu,
} from "@/components/common/ContactActionMenu";
import {
  getWhatsAppUrl,
  labelFor,
  normalizeNumbers,
} from "@/lib/business/contact-numbers";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import type { FollowUpItem } from "@/types/follow-up";
import type { FollowUpActionType } from "@/components/follow-ups/LogFollowUpActivityModal";

interface FollowUpCommunicationActionsProps {
  item: FollowUpItem;
  className?: string;
  variant?: "cards" | "icons";
  onAction?: () => void;
  onLogActivity?: (type: FollowUpActionType) => void;
}

export default function FollowUpCommunicationActions({
  item,
  className,
  variant = "cards",
  onAction,
  onLogActivity,
}: FollowUpCommunicationActionsProps) {
  if (isFollowUpReadOnly(item)) return null;

  const phoneEntries = normalizeNumbers(
    item.businessPhoneNumbers,
    item.businessCallingNumber || item.businessPhone,
  );
  const whatsappEntries = normalizeNumbers(
    item.businessWhatsappNumbers,
    item.businessWhatsappNumber ||
      item.businessCallingNumber ||
      item.businessPhone,
  );

  const type = String(item.type).toUpperCase();

  // If icon-only variant is requested, keep original compact icons
  if (variant === "icons") {
    return (
      <>
        <PhoneActionMenu
          numbers={item.businessPhoneNumbers}
          fallback={item.businessCallingNumber || item.businessPhone}
          className={className}
          onAction={() => {
            onAction?.();
            onLogActivity?.("CALL");
          }}
        />
        <WhatsAppActionMenu
          numbers={item.businessWhatsappNumbers}
          fallback={
            item.businessWhatsappNumber ||
            item.businessCallingNumber ||
            item.businessPhone
          }
          className={className}
          onAction={() => {
            onAction?.();
            onLogActivity?.("WHATSAPP");
          }}
        />
        {type === "MEETING" && item.meetingLink && (
          <MeetingJoinAction
            href={item.meetingLink}
            className={className}
            onAction={onAction}
          />
        )}
        {type === "EMAIL" && item.businessEmail && (
          <EmailAction
            email={item.businessEmail}
            className={className}
            onAction={() => {
              onAction?.();
              onLogActivity?.("EMAIL");
            }}
          />
        )}
      </>
    );
  }

  // Cards variant matching reference design
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Call Card Button */}
      {phoneEntries.length > 1 ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Call lead"
                  className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                >
                  <Phone className="size-4 text-blue-600 transition-transform group-hover:scale-110" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700">
                    Call
                  </span>
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Click Call to log a follow-up</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56 bg-white p-1">
            <div className="border-b border-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Number to Call
            </div>
            {phoneEntries.map((entry, index) => (
              <DropdownMenuItem
                key={entry.digits}
                asChild
                className="cursor-pointer gap-2.5 py-2 text-xs"
              >
                <a
                  href={`tel:${entry.digits}`}
                  onClick={() => {
                    onAction?.();
                    onLogActivity?.("CALL");
                  }}
                >
                  <Phone className="size-3.5 text-blue-600" />
                  <span className="flex-1 truncate font-medium text-slate-700">
                    {entry.number}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {labelFor(entry, index)}
                  </span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : phoneEntries.length === 1 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`tel:${phoneEntries[0].digits}`}
              onClick={() => {
                onAction?.();
                onLogActivity?.("CALL");
              }}
              aria-label={`Call ${phoneEntries[0].number}`}
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              <Phone className="size-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Call
              </span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Click Call to log a follow-up</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                onAction?.();
                onLogActivity?.("CALL");
              }}
              aria-label="Call lead"
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              <Phone className="size-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Call
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Click Call to log a follow-up</TooltipContent>
        </Tooltip>
      )}

      {/* 2. Whatsapp Card Button */}
      {whatsappEntries.length > 1 ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="WhatsApp lead"
                  className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                >
                  <WhatsAppIcon className="size-4 text-[#25D366] transition-transform group-hover:scale-110" />
                  <span className="mt-1 text-[11px] font-semibold text-slate-700">
                    Whatsapp
                  </span>
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Click Whatsapp to log a follow-up</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56 bg-white p-1">
            <div className="border-b border-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select WhatsApp Number
            </div>
            {whatsappEntries.map((entry, index) => (
              <DropdownMenuItem
                key={entry.digits}
                asChild
                className="cursor-pointer gap-2.5 py-2 text-xs"
              >
                <a
                  href={getWhatsAppUrl(entry.digits)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    onAction?.();
                    onLogActivity?.("WHATSAPP");
                  }}
                >
                  <WhatsAppIcon className="size-3.5 text-[#25D366]" />
                  <span className="flex-1 truncate font-medium text-slate-700">
                    {entry.number}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {labelFor(entry, index)}
                  </span>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : whatsappEntries.length === 1 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={getWhatsAppUrl(whatsappEntries[0].digits)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onAction?.();
                onLogActivity?.("WHATSAPP");
              }}
              aria-label={`WhatsApp ${whatsappEntries[0].number}`}
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            >
              <WhatsAppIcon className="size-4 text-[#25D366] transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Whatsapp
              </span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Click Whatsapp to log a follow-up</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                onAction?.();
                onLogActivity?.("WHATSAPP");
              }}
              aria-label="WhatsApp lead"
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
            >
              <WhatsAppIcon className="size-4 text-[#25D366] transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Whatsapp
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Click Whatsapp to log a follow-up</TooltipContent>
        </Tooltip>
      )}

      {/* 3. Email Card Button */}
      {item.businessEmail ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={`mailto:${item.businessEmail}`}
              onClick={() => {
                onAction?.();
                onLogActivity?.("EMAIL");
              }}
              aria-label={`Email ${item.businessEmail}`}
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              <Mail className="size-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Email
              </span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Click Email to log a follow-up</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                onAction?.();
                onLogActivity?.("EMAIL");
              }}
              aria-label="Email lead"
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
            >
              <Mail className="size-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Email
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Click Email to log a follow-up</TooltipContent>
        </Tooltip>
      )}

      {/* Optional Meeting Join Action if type is MEETING */}
      {type === "MEETING" && item.meetingLink && (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={item.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onAction}
              aria-label="Join meeting"
              className="group flex h-14 min-w-[58px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xs"
            >
              <Video className="size-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span className="mt-1 text-[11px] font-semibold text-slate-700">
                Join
              </span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Join meeting</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
