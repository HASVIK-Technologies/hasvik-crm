import { test, describe } from "node:test";
import assert from "node:assert";
import {
  extractLatestCompletedFollowUpDate,
  extractNextFollowUpDate,
  formatFollowUpDate,
  toBusinessItem,
} from "../lib/business/mappers.ts";
import { formatLeadStatus, getLeadStatusLabel } from "../lib/business/form-options.ts";
import {
  validateFutureDateTime,
  validateFutureDate,
  fromDateTimeLocalValue,
} from "../lib/forms/date-time.ts";
import {
  getLocationData,
  getValidLocationQuery,
} from "../lib/business/location.ts";
import { toFollowUpPayload } from "../lib/business/form-types.ts";
import type { ApiBusiness } from "../types/business-api.ts";
import type { BusinessFormValues } from "../lib/business/form-types.ts";

describe("Business Follow-up & Date Validation", () => {
  describe("extractLatestCompletedFollowUpDate", () => {
    test("returns latest completed follow-up date from followUps array", () => {
      const business: ApiBusiness = {
        _id: "biz-1",
        name: "Test Business",
        followUps: [
          {
            id: "fu-1",
            status: "COMPLETED",
            completedAt: "2026-05-10T10:00:00Z",
          },
          {
            id: "fu-2",
            status: "COMPLETED",
            completedAt: "2026-08-15T15:30:00Z",
          },
          {
            id: "fu-3",
            status: "SCHEDULED",
            scheduledAt: "2026-12-01T10:00:00Z",
          },
        ],
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      assert.ok(result.includes("2026"));
      assert.ok(result.includes("Aug") || result.includes("08"));
    });

    test("combines completedFollowUps and followUps and picks the latest completed", () => {
      const business: ApiBusiness = {
        _id: "biz-2",
        name: "Test Business 2",
        completedFollowUps: [
          {
            id: "fu-1",
            status: "COMPLETED",
            completedAt: "2026-04-01T10:00:00Z",
          },
        ],
        followUps: [
          {
            id: "fu-2",
            status: "COMPLETED",
            completedAt: "2026-09-20T11:00:00Z",
          },
        ],
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      assert.ok(result.includes("Sep") || result.includes("09"));
    });

    test("ignores non-completed follow-ups (SCHEDULED, CANCELLED) and returns '-' when no completed exist", () => {
      const business: ApiBusiness = {
        _id: "biz-3",
        name: "Test Business 3",
        createdAt: "2026-01-01T00:00:00Z",
        followUps: [
          {
            id: "fu-1",
            status: "SCHEDULED",
            scheduledAt: "2026-10-30T10:00:00Z",
          },
          {
            id: "fu-2",
            status: "CANCELLED",
            scheduledAt: "2026-09-01T10:00:00Z",
          },
        ],
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.strictEqual(result, "-", "Must return '-' and NEVER substitute createdAt or scheduled follow-up");
    });

    test("uses single completed followUp object on business", () => {
      const business: ApiBusiness = {
        _id: "biz-4",
        name: "Test Business 4",
        followUp: {
          status: "COMPLETED",
          completedAt: "2026-06-15T09:00:00Z",
        },
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      assert.ok(result.includes("Jun") || result.includes("06"));
    });

    test("uses explicit lastCompletedFollowUpDate field if present", () => {
      const business: ApiBusiness = {
        _id: "biz-5",
        name: "Test Business 5",
        lastCompletedFollowUpDate: "2026-07-20T14:00:00Z",
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      assert.ok(result.includes("Jul") || result.includes("07"));
    });

    test("extracts lastFollowup when provided as string from API", () => {
      const business = {
        _id: "biz-6",
        name: "Test Business 6",
        lastFollowup: "2026-09-12T10:00:00Z",
      } as unknown as ApiBusiness;

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      assert.ok(result.includes("Sep") || result.includes("09"));
    });

    test("extracts lastFollowup when provided as object with date/completedAt", () => {
      const business = {
        _id: "biz-7",
        name: "Test Business 7",
        lastFollowup: {
          date: "2026-08-10T14:30:00Z",
        },
      } as unknown as ApiBusiness;

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      assert.ok(result.includes("Aug") || result.includes("08"));
    });

    test("extracts authoritative lastFollowup with only id and scheduledAt", () => {
      const business = {
        _id: "biz-last-response-shape",
        name: "Response Shape Business",
        lastFollowup: {
          _id: "follow-up-123",
          scheduledAt: "2026-10-03T14:27:00.000Z",
        },
      } as ApiBusiness;

      const item = toBusinessItem(business);
      assert.notStrictEqual(item.lastFollowUp, "-");
      assert.ok(item.lastFollowUp.includes("Oct") || item.lastFollowUp.includes("10"));
      assert.strictEqual(item.lastFollowUpId, "follow-up-123");
    });

    test("shows completed follow-up date instead of business creation date", () => {
      const business: ApiBusiness = {
        _id: "biz-8",
        name: "Test Business 8",
        createdAt: "2024-01-15T08:00:00Z",
        followUps: [
          {
            id: "fu-8",
            status: "COMPLETED",
            createdAt: "2026-02-01T10:00:00Z",
            completedAt: "2026-09-18T14:00:00Z",
          },
        ],
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.notStrictEqual(result, "-");
      // Must reflect September 2026, never January 2024 or February 2026
      assert.ok(result.includes("Sep") || result.includes("09"), "Must show completed date in September");
      assert.ok(!result.includes("Jan") && !result.includes("2024"), "Must NOT show business creation date");

      const item = toBusinessItem(business);
      assert.strictEqual(item.lastFollowUp, result);
      assert.ok(!item.lastFollowUp.includes("2024"), "BusinessItem lastFollowUp must NOT show business creation date");
    });

    test("returns '-' when business has creation date but no completed follow-ups", () => {
      const business: ApiBusiness = {
        _id: "biz-9",
        name: "Test Business 9",
        createdAt: "2024-03-20T10:00:00Z",
        followUps: [
          {
            id: "fu-9",
            status: "SCHEDULED",
            createdAt: "2024-03-20T10:00:00Z",
            scheduledAt: "2026-12-25T11:00:00Z",
          },
        ],
      };

      const result = extractLatestCompletedFollowUpDate(business);
      assert.strictEqual(result, "-");

      const item = toBusinessItem(business);
      assert.strictEqual(item.lastFollowUp, "-", "Last Follow-up column must be '-' and not business creation date");
    });

    test("ignores non-completed follow-up object in lastFollowup", () => {
      const business = {
        _id: "biz-10",
        name: "Test Business 10",
        createdAt: "2024-05-10T10:00:00Z",
        lastFollowup: {
          status: "SCHEDULED",
          scheduledAt: "2026-11-20T10:00:00Z",
          createdAt: "2024-05-10T10:00:00Z",
        },
      } as unknown as ApiBusiness;

      const result = extractLatestCompletedFollowUpDate(business);
      assert.strictEqual(result, "-");
    });
  });

  describe("extractNextFollowUpDate and toBusinessItem mapping", () => {
    test("extracts nextFollowups when provided as array of objects", () => {
      const business = {
        _id: "biz-next-1",
        name: "Next Biz",
        nextFollowups: [
          {
            scheduledAt: "2026-11-20T10:00:00Z",
            status: "SCHEDULED",
          },
        ],
      } as unknown as ApiBusiness;

      const dateStr = extractNextFollowUpDate(business);
      assert.strictEqual(dateStr, "2026-11-20T10:00:00Z");

      const item = toBusinessItem(business);
      assert.notStrictEqual(item.nextFollowUp, "-");
      assert.ok(item.nextFollowUp.includes("2026"));
    });

    test("extracts nextFollowups when provided as single object", () => {
      const business = {
        _id: "biz-next-2",
        name: "Next Biz 2",
        nextFollowups: {
          scheduledAt: "2026-12-05T15:00:00Z",
        },
      } as unknown as ApiBusiness;

      const dateStr = extractNextFollowUpDate(business);
      assert.strictEqual(dateStr, "2026-12-05T15:00:00Z");

      const item = toBusinessItem(business);
      assert.notStrictEqual(item.nextFollowUp, "-");
    });

    test("maps lastFollowup and nextFollowups together on toBusinessItem", () => {
      const business = {
        _id: "biz-full",
        name: "Full Followup Biz",
        lastFollowup: "2026-10-01T10:00:00Z",
        nextFollowups: [
          {
            scheduledAt: "2026-11-15T12:00:00Z",
            status: "SCHEDULED",
          },
        ],
      } as unknown as ApiBusiness;

      const item = toBusinessItem(business);
      assert.notStrictEqual(item.lastFollowUp, "-");
      assert.ok(item.lastFollowUp.includes("Oct") || item.lastFollowUp.includes("10"));
      assert.notStrictEqual(item.nextFollowUp, "-");
      assert.ok(item.nextFollowUp.includes("Nov") || item.nextFollowUp.includes("11"));
    });
  });

  describe("formatFollowUpDate", () => {
    test("handles valid ISO strings and Date objects", () => {
      const formatted = formatFollowUpDate("2026-10-20T10:00:00Z");
      assert.ok(formatted.includes("2026"));
      const fromObj = formatFollowUpDate(new Date("2026-10-20T10:00:00Z"));
      assert.ok(fromObj.includes("2026"));
    });

    test("handles null, undefined, empty string and '-' gracefully", () => {
      assert.strictEqual(formatFollowUpDate(null), "-");
      assert.strictEqual(formatFollowUpDate(undefined), "-");
      assert.strictEqual(formatFollowUpDate(""), "-");
      assert.strictEqual(formatFollowUpDate("-"), "-");
    });
  });

  describe("validateFutureDateTime", () => {
    test("rejects past dates/times", () => {
      const past = "2020-01-01T10:00";
      assert.strictEqual(
        validateFutureDateTime(past),
        "Follow-up date and time cannot be in the past.",
      );
    });

    test("rejects empty or invalid inputs", () => {
      assert.strictEqual(validateFutureDateTime(""), "Enter a valid date and time.");
      assert.strictEqual(validateFutureDateTime("invalid-date"), "Enter a valid date and time.");
    });

    test("accepts future dates/times", () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const isoLocal = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}T${String(future.getHours()).padStart(2, "0")}:${String(future.getMinutes()).padStart(2, "0")}`;
      assert.strictEqual(validateFutureDateTime(isoLocal), true);
    });
  });

  describe("validateFutureDate", () => {
    test("rejects past date string", () => {
      assert.strictEqual(
        validateFutureDate("2020-01-01"),
        "Next follow-up date cannot be in the past.",
      );
    });

    test("accepts future date string", () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const y = future.getFullYear();
      const m = String(future.getMonth() + 1).padStart(2, "0");
      const d = String(future.getDate()).padStart(2, "0");
      assert.strictEqual(validateFutureDate(`${y}-${m}-${d}`), true);
    });
  });

  describe("Location URL and Fallback to Name/Address", () => {
    test("prioritizes saved locationUrl when valid", () => {
      const business = {
        name: "Super Mart",
        address: "MG Road",
        city: "Bengaluru",
        locationUrl: "https://maps.google.com/?q=MG+Road+Bengaluru",
      };
      const result = getLocationData(business);
      assert.strictEqual(result.isAvailable, true);
      assert.strictEqual(result.mapLink, "https://maps.google.com/?q=MG+Road+Bengaluru");
      assert.ok(result.embedSrc?.includes("output=embed"));
    });

    test("falls back to business name and address when locationUrl is missing", () => {
      const business = {
        name: "Tech Solutions",
        address: "Sector 62, Noida",
        city: "Noida",
      };
      const query = getValidLocationQuery(business);
      assert.strictEqual(query, "Tech Solutions, Sector 62, Noida, Noida");

      const result = getLocationData(business);
      assert.strictEqual(result.isAvailable, true);
      assert.ok(result.mapLink?.includes("Tech%20Solutions"));
      assert.ok(result.embedSrc?.includes("Tech%20Solutions"));
    });
  });

  describe("toFollowUpPayload & Date-only Protection", () => {
    test("rejects date-only value (without time) and prevents 12:00 AM UTC", () => {
      const values = {
        assignTo: "user-1",
        followUpType: "Call",
        nextFollowupDate: "2026-10-25",
        reminder: "15",
      } as unknown as BusinessFormValues;

      assert.throws(() => {
        toFollowUpPayload(values);
      }, /Both follow-up date and time are required/);
    });

    test("fromDateTimeLocalValue returns undefined for date-only values", () => {
      assert.strictEqual(fromDateTimeLocalValue("2026-10-25"), undefined);
      assert.strictEqual(fromDateTimeLocalValue("2026-10-25T"), undefined);
    });

    test("accepts valid date and time string", () => {
      const values = {
        assignTo: "user-1",
        followUpType: "Call",
        nextFollowupDate: "2026-10-25T14:30",
        reminder: "15",
      } as unknown as BusinessFormValues;

      const payload = toFollowUpPayload(values);
      assert.strictEqual(payload.assignedTo, "user-1");
      assert.strictEqual(payload.type, "Call");
      assert.ok(payload.scheduledAt);
      assert.strictEqual(payload.reminderInMinutes, 15);
    });
  });

  describe("lead status display labels", () => {
    test("uses the canonical user-friendly label for every backend lead status", () => {
      assert.strictEqual(getLeadStatusLabel("NEW"), "New Lead");
      assert.strictEqual(getLeadStatusLabel("CONTACTED"), "Contacted");
      assert.strictEqual(
        getLeadStatusLabel("PROPOSAL_AND_NEGOTIATION"),
        "Proposal & Negotiation",
      );
      assert.strictEqual(getLeadStatusLabel("INTERESTED"), "Interested");
      assert.strictEqual(getLeadStatusLabel("WON"), "Won");
      assert.strictEqual(getLeadStatusLabel("LOST"), "Lost");
    });

    test("does not leak raw enum values when API labels are raw or missing", () => {
      assert.strictEqual(
        formatLeadStatus("PROPOSAL_AND_NEGOTIATION", {
          PROPOSAL_AND_NEGOTIATION: "PROPOSAL_AND_NEGOTIATION",
        }),
        "Proposal & Negotiation",
      );
      assert.strictEqual(formatLeadStatus("FOLLOW_UP_REQUIRED"), "Follow Up Required");
    });
  });
});
