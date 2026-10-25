"use client";

import { EmailAction, MeetingJoinAction, PhoneActionMenu, WhatsAppActionMenu } from "@/components/common/ContactActionMenu";
import { isFollowUpReadOnly } from "@/lib/follow-ups/actions";
import type { FollowUpItem } from "@/types/follow-up";

export default function FollowUpCommunicationActions({ item, className, onAction }: { item: FollowUpItem; className?: string; onAction?: () => void }) {
  if (isFollowUpReadOnly(item)) return null;
  const type = String(item.type).toUpperCase();
  if (type === "CALL") return <PhoneActionMenu numbers={item.businessPhoneNumbers} fallback={item.businessCallingNumber || item.businessPhone} className={className} onAction={onAction} />;
  if (type === "WHATSAPP") return <WhatsAppActionMenu numbers={item.businessWhatsappNumbers} fallback={item.businessWhatsappNumber} className={className} onAction={onAction} />;
  if (type === "MEETING") return <MeetingJoinAction href={item.meetingLink} className={className} onAction={onAction} />;
  if (type === "EMAIL") return <EmailAction email={item.businessEmail} className={className} onAction={onAction} />;
  return null;
}
