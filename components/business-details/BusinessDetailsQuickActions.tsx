import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ChevronRight, Edit2, Phone, Power, Slash } from "lucide-react";
import { useModalStore } from "@/store/business-modal-store";
import { WhatsAppIcon } from "@/components/common/WhatsAppIcon";

interface QuickActionsProps {
  business: any;
  cleanNumber: (num: string) => string;
}

export default function BusinessDetailsQuickActions({
  business,
  cleanNumber,
}: QuickActionsProps) {
  const { openDeactivateModal } = useModalStore();

  const isInactive = business?.isActive === false;

  const disabledStyles = isInactive
    ? "opacity-50 pointer-events-none cursor-not-allowed"
    : "";

  const phone = business?.phone ? cleanNumber(business.phone) : "";

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        Quick Actions
      </h3>

      <div className="flex flex-col gap-2.5">
        {/* Edit Business */}
        <Link
          href={`/businesses/form/${business?.id}`}
          className={`group flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 transition-all hover:border-primary/30 hover:bg-primary/5 ${disabledStyles}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Edit2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 group-hover:text-primary">
                Edit Business
              </p>
              <p className="text-[11px] text-slate-400">Update business details</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        {/* Call & WhatsApp (2 Columns) */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={phone ? `tel:${phone}` : undefined}
            className={`group flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2.5 transition-all hover:border-brand-green/30 hover:bg-brand-green/5 ${
              !phone || isInactive ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-strong transition-colors group-hover:bg-brand-green/15">
              <Phone className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-brand-green-strong">
                Call
              </p>
              <p className="truncate text-[10px] text-slate-400">Direct phone</p>
            </div>
          </a>

          <a
            href={phone ? `https://wa.me/91${phone}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2.5 transition-all hover:border-brand-green/30 hover:bg-brand-green/5 ${
              !phone || isInactive ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-strong transition-colors group-hover:bg-brand-green/15">
              <WhatsAppIcon className="size-3.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-brand-green-strong">
                WhatsApp
              </p>
              <p className="truncate text-[10px] text-slate-400">Open chat</p>
            </div>
          </a>
        </div>

        {/* Divider */}
        <div className="my-0.5 border-t border-slate-100" />

        {/* Activate / Deactivate Toggle */}
        <button
          type="button"
          onClick={() => openDeactivateModal(business?.id)}
          className={`group flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
            isInactive
              ? "border-brand-green/30 bg-brand-green/5 hover:bg-brand-green/10 hover:border-brand-green/40"
              : "border-slate-200/90 bg-white hover:border-red-200 hover:bg-red-50/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isInactive
                  ? "bg-brand-green/15 text-brand-green-strong"
                  : "bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600"
              }`}
            >
              {isInactive ? (
                <Power className="size-4" />
              ) : (
                <Slash className="size-4" />
              )}
            </div>
            <div>
              <p
                className={`text-xs font-semibold ${
                  isInactive
                    ? "text-brand-green-strong"
                    : "text-slate-800 group-hover:text-red-600"
                }`}
              >
                {isInactive ? "Activate Business" : "Deactivate Business"}
              </p>
              <p className="text-[11px] text-slate-400">
                {isInactive
                  ? "Restore full access & status"
                  : "Pause operations for this business"}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`size-4 transition-transform group-hover:translate-x-0.5 ${
              isInactive
                ? "text-brand-green/70 group-hover:text-brand-green-strong"
                : "text-slate-300 group-hover:text-red-400"
            }`}
          />
        </button>
      </div>
    </div>
  );
}