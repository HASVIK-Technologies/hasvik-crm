import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNumbers, getWhatsAppUrl } from "../lib/business/contact-numbers.ts";

test("normalizeNumbers handles single and multiple contact entries cleanly", () => {
  const numbers = [
    { number: "+91 94732 36395", isPrimary: true },
    { number: "09473236395" }, // duplicate canonical
    { number: "9876543210", name: "Work" },
  ];
  const normalized = normalizeNumbers(numbers);
  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].digits, "919473236395");
  assert.equal(normalized[1].digits, "9876543210");
});

test("getWhatsAppUrl generates correct wa.me link with digits", () => {
  const url = getWhatsAppUrl("9473236395");
  assert.equal(url, "https://wa.me/919473236395");

  const urlWithCountry = getWhatsAppUrl("919473236395");
  assert.equal(urlWithCountry, "https://wa.me/919473236395");
});

test("activity log content formatting combines outcome, customer intent, and notes", () => {
  function formatActivityNote({
    title,
    outcome,
    intent,
    notes,
  }: {
    title: string;
    outcome: string;
    intent?: string;
    notes?: string;
  }) {
    const lines: string[] = [];
    lines.push(`[${title}] Outcome: ${outcome}`);
    if (intent) {
      lines.push(`Customer Intent: ${intent}`);
    }
    if (notes?.trim()) {
      lines.push(`Notes: ${notes.trim()}`);
    }
    return lines.join("\n");
  }

  const callNote = formatActivityNote({
    title: "Call Follow up",
    outcome: "Connected",
    intent: "Demo Request",
    notes: "Customer interested in bulk pricing and requested a live demo.",
  });

  assert.ok(callNote.includes("[Call Follow up] Outcome: Connected"));
  assert.ok(callNote.includes("Customer Intent: Demo Request"));
  assert.ok(callNote.includes("Notes: Customer interested in bulk pricing"));

  const whatsappNote = formatActivityNote({
    title: "WhatsApp Follow up",
    outcome: "Message Sent",
  });
  assert.equal(whatsappNote, "[WhatsApp Follow up] Outcome: Message Sent");
});
