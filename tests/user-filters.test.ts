import { test } from "node:test";
import assert from "node:assert/strict";
import { userRequestParams } from "../lib/users/query-params.ts";
import { canUpdateRecord } from "../lib/records/activity.ts";

test("tenant filtering composes with pagination, search, role, and inactive status", () => {
  assert.deepEqual(userRequestParams({ tenantId: " tenant-1 ", isActive: false, page: 3, limit: 20, search: " Jane ", role: "MANAGER", sortBy: "email", sortOrder: "desc" }), {
    tenantId: "tenant-1", isActive: false, page: 3, limit: 20, search: "Jane", role: "MANAGER", sortBy: "email", sortOrder: "desc",
  });
});

test("clearing tenant, status, and role filters omits those API parameters", () => {
  const params = userRequestParams({ tenantId: " ", role: "ALL" });
  assert.equal("tenantId" in params, false);
  assert.equal("isActive" in params, false);
  assert.equal("role" in params, false);
});

test("user activation is allowed while combined activation and editing remains blocked", () => {
  const inactiveUser = { isActive: false };
  assert.equal(canUpdateRecord(inactiveUser, { isActive: true }), true);
  assert.equal(canUpdateRecord(inactiveUser, { isActive: true, role: "ADMIN" }), false);
  assert.equal(canUpdateRecord({ isActive: true }, { isActive: false }), true);
});
