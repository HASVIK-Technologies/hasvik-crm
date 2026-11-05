import type { FollowUpItem } from "@/types/follow-up";

/**
 * Generates 10 realistic sample/dummy follow-up conversations for previewing
 * and verifying the Follow-ups Details Page conversation history.
 */
export function getDummyConversations(
  businessName = "Acme Technologies",
  businessId = "sample-business-id",
): FollowUpItem[] {
  const now = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;

  return [
    {
      id: "dummy-fu-1",
      businessId,
      businessName,
      type: "CALL",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 1).toISOString(),
      assignedToName: "Rahul Sharma",
      notes: "Followed up on pricing quotation and SLA contract terms. Client requested a 10% volume discount for an annual commitment. Agreed to send revised commercial proposal by tomorrow morning.",
    },
    {
      id: "dummy-fu-2",
      businessId,
      businessName,
      type: "MEETING",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 3).toISOString(),
      assignedToName: "Priya Patel",
      notes: "Conducted product walkthrough with CTO and sales leadership. Demonstrated automated lead routing, WhatsApp follow-up reminders, and audit history. Very positive reception; team requested security compliance deck.",
      meetingLink: "https://meet.google.com/has-vikc-rm1",
    },
    {
      id: "dummy-fu-3",
      businessId,
      businessName,
      type: "WHATSAPP",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 5).toISOString(),
      assignedToName: "Amit Verma",
      notes: "Shared updated product brochure, SOC2 compliance summary, and case studies over WhatsApp. Client confirmed receipt and forwarded to procurement.",
    },
    {
      id: "dummy-fu-4",
      businessId,
      businessName,
      type: "EMAIL",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 8).toISOString(),
      assignedToName: "Sneha Reddy",
      notes: "Sent detailed onboarding timeline, data migration blueprint from legacy spreadsheets, and verified custom domain setup requirements.",
    },
    {
      id: "dummy-fu-5",
      businessId,
      businessName,
      type: "CALL",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 11).toISOString(),
      assignedToName: "Rahul Sharma",
      notes: "Clarified team seat requirements. Client plans to start with 15 sales executive accounts and 2 manager licenses with role-based permissions.",
    },
    {
      id: "dummy-fu-6",
      businessId,
      businessName,
      type: "MEETING",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 15).toISOString(),
      assignedToName: "Priya Patel",
      notes: "Discovery session to understand current sales process bottlenecks, unassigned leads, and overdue follow-up issues. Mapped out required CRM stages.",
      meetingLink: "https://meet.google.com/has-vikc-rm2",
    },
    {
      id: "dummy-fu-7",
      businessId,
      businessName,
      type: "WHATSAPP",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 19).toISOString(),
      assignedToName: "Amit Verma",
      notes: "Followed up after initial contact. Scheduled formal discovery meeting for the following Tuesday with decision makers.",
    },
    {
      id: "dummy-fu-8",
      businessId,
      businessName,
      type: "CALL",
      status: "CANCELLED",
      scheduledAt: new Date(now - dayMs * 23).toISOString(),
      assignedToName: "Rahul Sharma",
      notes: "Client requested rescheduling due to emergency board meeting. Contact confirmed availability for the following week.",
    },
    {
      id: "dummy-fu-9",
      businessId,
      businessName,
      type: "EMAIL",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 27).toISOString(),
      assignedToName: "Sneha Reddy",
      notes: "Sent introductory email with CRM feature overview, pricing tiers, and customer testimonials. Client replied expressing interest in an end-to-end evaluation.",
    },
    {
      id: "dummy-fu-10",
      businessId,
      businessName,
      type: "CALL",
      status: "COMPLETED",
      scheduledAt: new Date(now - dayMs * 32).toISOString(),
      assignedToName: "Rahul Sharma",
      notes: "Initial outreach conversation. Verified company size, current sales tools, and confirmed interest in modernizing lead management.",
    },
  ];
}

