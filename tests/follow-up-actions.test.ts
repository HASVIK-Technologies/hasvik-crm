import { test, describe } from "node:test";
import assert from "node:assert";
import {
  canCompleteFollowUp,
  canCancelFollowUp,
  canEditFollowUp,
  canCreateNextFollowUp,
} from "../lib/follow-ups/actions.ts";
import { formatFollowUpType } from "../lib/business/form-options.ts";
import type { FollowUpItem } from "../types/follow-up.ts";

function makeFollowUp(status: string): FollowUpItem {
  return {
    id: "test-1",
    businessId: "biz-1",
    businessName: "Test Business",
    businessCity: "Mumbai",
    type: "Call",
    status: status as FollowUpItem["status"],
    scheduledAt: "2026-10-20T10:00:00Z",
    assignedToId: "user-1",
    assignedToName: "Test User",
    notes: "Follow up note",
  };
}

describe("Follow-up Action Rules", () => {
  test("canCompleteFollowUp allows SCHEDULED and OVERDUE", () => {
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("SCHEDULED")), true);
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("scheduled")), true);
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("OVERDUE")), true);
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("overdue")), true);
  });

  test("canCompleteFollowUp rejects CANCELLED and COMPLETED", () => {
    // CANCELLED follow-ups must NOT be allowed to be completed
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("CANCELLED")), false);
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("cancelled")), false);
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("COMPLETED")), false);
    assert.strictEqual(canCompleteFollowUp(makeFollowUp("completed")), false);
  });

  test("canCancelFollowUp allows only SCHEDULED and OVERDUE", () => {
    assert.strictEqual(canCancelFollowUp(makeFollowUp("SCHEDULED")), true);
    assert.strictEqual(canCancelFollowUp(makeFollowUp("OVERDUE")), true);
    assert.strictEqual(canCancelFollowUp(makeFollowUp("CANCELLED")), false);
    assert.strictEqual(canCancelFollowUp(makeFollowUp("COMPLETED")), false);
  });

  test("canEditFollowUp allows only SCHEDULED and OVERDUE", () => {
    assert.strictEqual(canEditFollowUp(makeFollowUp("SCHEDULED")), true);
    assert.strictEqual(canEditFollowUp(makeFollowUp("OVERDUE")), true);
    assert.strictEqual(canEditFollowUp(makeFollowUp("CANCELLED")), false);
    assert.strictEqual(canEditFollowUp(makeFollowUp("COMPLETED")), false);
  });

  test("canCreateNextFollowUp allows only COMPLETED", () => {
    assert.strictEqual(canCreateNextFollowUp(makeFollowUp("COMPLETED")), true);
    assert.strictEqual(canCreateNextFollowUp(makeFollowUp("completed")), true);
    assert.strictEqual(canCreateNextFollowUp(makeFollowUp("SCHEDULED")), false);
    assert.strictEqual(canCreateNextFollowUp(makeFollowUp("OVERDUE")), false);
    assert.strictEqual(canCreateNextFollowUp(makeFollowUp("CANCELLED")), false);
  });

  describe("formatFollowUpType", () => {
    test("maps CALL to Call", () => {
      assert.strictEqual(formatFollowUpType("CALL"), "Call");
      assert.strictEqual(formatFollowUpType("call"), "Call");
    });

    test("maps WHATSAPP to WhatsApp", () => {
      assert.strictEqual(formatFollowUpType("WHATSAPP"), "WhatsApp");
      assert.strictEqual(formatFollowUpType("whatsapp"), "WhatsApp");
    });

    test("maps MEETING to Meeting", () => {
      assert.strictEqual(formatFollowUpType("MEETING"), "Meeting");
      assert.strictEqual(formatFollowUpType("meeting"), "Meeting");
    });

    test("maps EMAIL to Email", () => {
      assert.strictEqual(formatFollowUpType("EMAIL"), "Email");
      assert.strictEqual(formatFollowUpType("email"), "Email");
    });

    test("handles empty/null/fallback values gracefully", () => {
      assert.strictEqual(formatFollowUpType(null), "-");
      assert.strictEqual(formatFollowUpType(undefined), "-");
      assert.strictEqual(formatFollowUpType(""), "-");
      assert.strictEqual(formatFollowUpType("-"), "-");
    });
  });
});
