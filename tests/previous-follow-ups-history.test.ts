import { test, describe } from "node:test";
import assert from "node:assert";
import { selectPreviousFollowUps } from "../lib/follow-ups/history.ts";
import { getDummyConversations } from "../lib/follow-ups/dummy-conversations.ts";
import type { FollowUpItem } from "../types/follow-up.ts";

function createMockFollowUp(id: string, date: string, status = "COMPLETED", notes = ""): FollowUpItem {
  return {
    id,
    businessId: "biz-123",
    businessName: "Acme Corp",
    type: "CALL",
    status,
    scheduledAt: date,
    assignedToName: "Jane Doe",
    notes,
  };
}

describe("selectPreviousFollowUps", () => {
  test("returns empty array for empty inputs", () => {
    assert.deepStrictEqual(selectPreviousFollowUps([]), []);
    assert.deepStrictEqual(selectPreviousFollowUps(undefined as unknown as FollowUpItem[]), []);
  });

  test("excludes the current follow-up by ID", () => {
    const list = [
      createMockFollowUp("fu-1", "2026-10-01T10:00:00Z"),
      createMockFollowUp("fu-current", "2026-10-05T10:00:00Z"),
      createMockFollowUp("fu-2", "2026-10-02T10:00:00Z"),
    ];

    const result = selectPreviousFollowUps(list, {
      currentFollowUpId: "fu-current",
    });

    assert.strictEqual(result.length, 2);
    assert.ok(!result.some((item) => item.id === "fu-current"));
    assert.strictEqual(result[0].id, "fu-2");
    assert.strictEqual(result[1].id, "fu-1");
  });

  test("limits results to maximum 10 items", () => {
    const list = Array.from({ length: 15 }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return createMockFollowUp(`fu-${i + 1}`, `2026-09-${day}T10:00:00Z`, "COMPLETED", `Note ${i + 1}`);
    });

    const result = selectPreviousFollowUps(list, {
      currentFollowUpId: "fu-current",
    });

    assert.strictEqual(result.length, 10);
    // Newest first
    assert.strictEqual(result[0].id, "fu-15");
    assert.strictEqual(result[9].id, "fu-6");
  });

  test("prioritizes previous or completed follow-ups relative to current scheduledAt", () => {
    const list = [
      createMockFollowUp("fu-past-1", "2026-10-01T10:00:00Z", "COMPLETED", "Past call"),
      createMockFollowUp("fu-past-2", "2026-10-03T10:00:00Z", "COMPLETED", "Second past call"),
      createMockFollowUp("fu-current", "2026-10-05T10:00:00Z", "SCHEDULED"),
      createMockFollowUp("fu-future", "2026-10-20T10:00:00Z", "SCHEDULED", "Future call"),
    ];

    const result = selectPreviousFollowUps(list, {
      currentFollowUpId: "fu-current",
      currentScheduledAt: "2026-10-05T10:00:00Z",
    });

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].id, "fu-past-2");
    assert.strictEqual(result[1].id, "fu-past-1");
    assert.strictEqual(result[0].notes, "Second past call");
  });

  test("falls back to all other follow-ups if none are strictly prior", () => {
    const list = [
      createMockFollowUp("fu-current", "2026-10-01T10:00:00Z", "SCHEDULED"),
      createMockFollowUp("fu-future-1", "2026-10-05T10:00:00Z", "SCHEDULED", "Future 1"),
      createMockFollowUp("fu-future-2", "2026-10-10T10:00:00Z", "SCHEDULED", "Future 2"),
    ];

    const result = selectPreviousFollowUps(list, {
      currentFollowUpId: "fu-current",
      currentScheduledAt: "2026-10-01T10:00:00Z",
    });

    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].id, "fu-future-2");
    assert.strictEqual(result[1].id, "fu-future-1");
  });
});

describe("getDummyConversations", () => {
  test("returns exactly 10 dummy conversations with rich notes", () => {
    const dummy = getDummyConversations("Test Enterprise", "test-biz-id");
    assert.strictEqual(dummy.length, 10);
    for (const item of dummy) {
      assert.strictEqual(item.businessName, "Test Enterprise");
      assert.strictEqual(item.businessId, "test-biz-id");
      assert.ok(item.notes && item.notes.length > 10, "Each dummy conversation must have descriptive notes");
      assert.ok(item.assignedToName, "Each dummy conversation must have an assigned representative");
      assert.ok(item.type, "Each dummy conversation must have a type");
      assert.ok(item.status, "Each dummy conversation must have a status");
      assert.ok(!Number.isNaN(Date.parse(item.scheduledAt)), "Each dummy conversation must have a valid scheduled date");
    }
  });
});
