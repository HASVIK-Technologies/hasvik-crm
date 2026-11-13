import { test, describe } from "node:test";
import assert from "node:assert";
import {
  getInitials,
  parseNoteContent,
  formatNoteTypeTitle,
  formatCardDateHeading,
  formatActivityTimestamp,
} from "../lib/follow-ups/timeline-utils.ts";

describe("Follow-up Conversation Timeline Utils", () => {
  describe("getInitials", () => {
    test("extracts initials from full names", () => {
      assert.strictEqual(getInitials("Aakriti Singh"), "AS");
      assert.strictEqual(getInitials("Rahul Sharma"), "RS");
      assert.strictEqual(getInitials("Priya"), "PR");
      assert.strictEqual(getInitials("Mohammad Ali Jinnah"), "MJ");
      assert.strictEqual(getInitials(""), "AS");
      assert.strictEqual(getInitials(null), "AS");
    });
  });

  describe("parseNoteContent", () => {
    test("parses tagged notes into correct type and title", () => {
      const call = parseNoteContent("[Call Note] Spoke with Principal Sir. Shared proposal.");
      assert.strictEqual(call.type, "CALL");
      assert.strictEqual(call.title, "Call Note");
      assert.strictEqual(call.cleanContent, "Spoke with Principal Sir. Shared proposal.");

      const wa = parseNoteContent("[WhatsApp Note] Sent website proposal PDF on WhatsApp.");
      assert.strictEqual(wa.type, "WHATSAPP");
      assert.strictEqual(wa.title, "WhatsApp Note");
      assert.strictEqual(wa.cleanContent, "Sent website proposal PDF on WhatsApp.");

      const internal = parseNoteContent("[Internal Note] Principal requested a revised quote.");
      assert.strictEqual(internal.type, "INTERNAL");
      assert.strictEqual(internal.title, "Internal Note");
      assert.strictEqual(internal.cleanContent, "Principal requested a revised quote.");

      const email = parseNoteContent("[Email Note] Sent onboarding timeline.");
      assert.strictEqual(email.type, "EMAIL");
      assert.strictEqual(email.title, "Email Note");
      assert.strictEqual(email.cleanContent, "Sent onboarding timeline.");
    });

    test("falls back to default type when note is untagged", () => {
      const untagged = parseNoteContent("Untagged quick note", "CALL");
      assert.strictEqual(untagged.type, "CALL");
      assert.strictEqual(untagged.title, "Call Note");
      assert.strictEqual(untagged.cleanContent, "Untagged quick note");
    });

    test("handles empty and malformed content safely", () => {
      const empty = parseNoteContent("");
      assert.strictEqual(empty.type, "INTERNAL");
      assert.strictEqual(empty.cleanContent, "");
    });
  });

  describe("formatNoteTypeTitle", () => {
    test("maps note types to user-friendly titles", () => {
      assert.strictEqual(formatNoteTypeTitle("CALL"), "Call Note");
      assert.strictEqual(formatNoteTypeTitle("WHATSAPP"), "WhatsApp Note");
      assert.strictEqual(formatNoteTypeTitle("INTERNAL"), "Internal Note");
      assert.strictEqual(formatNoteTypeTitle("EMAIL"), "Email Note");
    });
  });

  describe("formatCardDateHeading", () => {
    test("formats date strings into clean D MMM YYYY", () => {
      const past = formatCardDateHeading("2026-10-28T10:00:00Z");
      assert.strictEqual(past.formattedDate, "28 Oct 2026");
      assert.strictEqual(past.tag, undefined);
    });

    test("handles empty or invalid dates gracefully", () => {
      assert.strictEqual(formatCardDateHeading("").formattedDate, "Date unavailable");
      assert.strictEqual(formatCardDateHeading(null).formattedDate, "Date unavailable");
      assert.strictEqual(formatCardDateHeading("invalid").formattedDate, "Date unavailable");
    });
  });

  describe("formatActivityTimestamp", () => {
    test("formats timestamps with date and 12-hour time", () => {
      const ts = formatActivityTimestamp("2026-10-28T16:30:00.000Z");
      assert.ok(ts.includes("28 Oct 2026"));
      assert.ok(ts.includes("pm") || ts.includes("am"));
    });

    test("handles empty or invalid timestamps", () => {
      assert.strictEqual(formatActivityTimestamp(""), "Time unavailable");
      assert.strictEqual(formatActivityTimestamp(null), "Time unavailable");
    });
  });
});

