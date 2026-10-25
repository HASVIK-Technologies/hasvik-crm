import { test } from "node:test";
import assert from "node:assert/strict";
import { isRecordInactive, canUpdateRecord } from "../lib/records/activity.ts";
import { getUserTenant } from "../lib/users/tenant.ts";
import { canEditFollowUp, canCompleteFollowUp, canCancelFollowUp, canCreateNextFollowUp } from "../lib/follow-ups/actions.ts";
import type { FollowUpItem } from "../types/follow-up.ts";

test("inactive records allow activation alone, never mixed edit and activate payloads", () => {
  for (const record of [{ isActive: false }, { status: "Inactive" }, { status: "INACTIVE" }]) {
    assert.equal(isRecordInactive(record), true);
    assert.equal(canUpdateRecord(record, { name: "Changed" }), false);
    assert.equal(canUpdateRecord(record, { isActive: true, name: "Changed" }), false);
    assert.equal(canUpdateRecord(record, { isActive: true }), true);
  }
  assert.equal(canUpdateRecord({ isActive: true }, { name: "Changed" }), true);
});

test("super-admin tenant display resolves populated and ID-only user tenants", () => {
  const base = { fullName: "Jane", email: "jane@example.com", role: "USER" };
  assert.deepEqual(getUserTenant({ ...base, tenantId: { _id: "tenant-1", name: "School", isActive: false } }, []), { name: "School", isActive: false });
  assert.deepEqual(getUserTenant({ ...base, tenantId: "tenant-1" }, [{ id: "tenant-1", name: "School", isActive: true }]), { name: "School", isActive: true });
  assert.equal(getUserTenant(base, []).name, "No tenant");
  assert.equal(getUserTenant({ ...base, tenantId: "internal-id" }, []).name, "Tenant unavailable");
});

test("inactive parent records remove every follow-up mutation action", () => {
  for (const flags of [{ isActive: false }, { businessIsActive: false }, { tenantIsActive: false }]) {
    const scheduled = { id: "followup-1", status: "SCHEDULED", ...flags } as FollowUpItem;
    assert.equal(canEditFollowUp(scheduled), false);
    assert.equal(canCancelFollowUp(scheduled), false);
    assert.equal(canCompleteFollowUp(scheduled), false);
    assert.equal(canCreateNextFollowUp({ ...scheduled, status: "COMPLETED" }), false);
  }
});
