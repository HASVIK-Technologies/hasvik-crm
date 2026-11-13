"use client";

import { EmailAction, MeetingJoinAction, PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import type { FollowUpItem } from "@/types/follow-up";

export default function FollowUpCommunicationActions({ item, className, onAction }: { item: FollowUpItem; className?: string; onAction?: () => void }) {
  if (isFollowUpReadOnly(item)) return null;
  const type = String(item.type).toUpperCase();
  return (
    <>
      <PhoneActionMenu
        numbers={item.businessPhoneNumbers}
        fallback={item.businessCallingNumber || item.businessPhone}
        className={className}
        onAction={onAction}
      />
      <WhatsAppActionMenu
        numbers={item.businessWhatsappNumbers}
        fallback={item.businessWhatsappNumber || item.businessCallingNumber || item.businessPhone}
        className={className}
        onAction={onAction}
      />
      {type === "MEETING" && item.meetingLink && (
        <MeetingJoinAction href={item.meetingLink} className={className} onAction={onAction} />
      )}
      {type === "EMAIL" && item.businessEmail && (
        <EmailAction email={item.businessEmail} className={className} onAction={onAction} />
      )}
    </>
  );
}
