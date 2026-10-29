import React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ChevronRight, Edit2, Power, Slash } from "lucide-react";
import { useModalStore } from "@/store/business-modal-store";
import { PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";

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

  const phone = business?.phone ? cleanNumber(business.phone) : "";

  return (
    <div className="flex flex-col rounded-2xl border border-line/80 bg-surface p-5 shadow-sm">
      <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-muted">
        Quick Actions
      </h3>

      <div className="flex flex-col gap-2.5">
        {!isInactive && <>
        {/* Edit Business */}
        <Link
          href={`/businesses/form/${business?.id}`}
          className="group flex items-center justify-between rounded-xl border border-line/90 bg-surface p-3 transition-all hover:border-brand/30 hover:bg-btn/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-btn/10 text-brand-strong transition-colors group-hover:bg-btn/15">
              <Edit2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink group-hover:text-brand-strong">
                Edit Business
              </p>
              <p className="text-[11px] text-muted">
                Update business details
              </p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-strong" />
        </Link>

        {/* Call & WhatsApp (2 Columns) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 border border-line bg-surface p-2.5"><PhoneActionMenu numbers={business?.phoneNumbers} fallback={phone} /><span className="text-xs font-semibold text-ink-soft">Call</span></div>
          <div className="flex items-center gap-2 border border-line bg-surface p-2.5"><WhatsAppActionMenu numbers={business?.whatsappNumbers} fallback={business?.alternatePhone} /><span className="text-xs font-semibold text-ink-soft">WhatsApp</span></div>
        </div>

        {/* Divider */}
        <div className="my-0.5 border-t border-surface-2" />
        </>}

        {/* Activate / Deactivate Toggle */}
        <button
          type="button"
          onClick={() => openDeactivateModal(business?.id)}
          className={`group flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
            isInactive
              ? "border-accent/30 bg-surface-2/5 hover:bg-surface-2/10 hover:border-accent/40"
              : "border-line/90 bg-surface hover:border-bad/30 hover:bg-bad-soft/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isInactive
                  ? "bg-surface-2/15 text-accent-strong"
                  : "bg-surface-2 text-muted group-hover:bg-bad-soft group-hover:text-bad"
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
                    ? "text-accent-strong"
                    : "text-ink group-hover:text-bad"
                }`}
              >
                {isInactive ? "Activate business" : "Deactivate business"}
              </p>
              <p className="text-[11px] text-muted">
                {isInactive
                  ? "Restore full access & status"
                  : "Pause operations for this business"}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`size-4 transition-transform group-hover:translate-x-0.5 ${
              isInactive
                ? "text-accent-strong/70 group-hover:text-accent-strong"
                : "text-muted group-hover:text-bad"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
