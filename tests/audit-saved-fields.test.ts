import { test } from "node:test";
import assert from "node:assert/strict";
import { getSavedFields } from "../lib/audit-logs/saved-fields.ts";

test("snapshot details render even without changedFields", () => {
  const fields = getSavedFields({ id: "1", action: "CREATE", changes: {
    newData: { fullName: "Jane", role: "TENANT_ADMIN", isActive: false, password: "private", _id: "internal" },
  } });
  assert.deepEqual(fields, [
    { field: "fullName", label: "Full name", value: "Jane" },
    { field: "role", label: "Role", value: "Tenant admin" },
    { field: "isActive", label: "Active", value: "No" },
  ]);
});

test("business changes retain only recorded changed fields", () => {
  assert.deepEqual(getSavedFields({ id: "1", action: "UPDATE", changes: {
    changedFields: ["name"], newData: { name: "New business", email: "unchanged@example.com" },
  } }), [{ field: "name", label: "Name", value: "New business" }]);
});

test("after snapshots and per-field changes preserve clears and false", () => {
  assert.deepEqual(getSavedFields({ id: "1", action: "UPDATE", changes: {
    after: { email: { newValue: null }, isActive: { after: false } },
  } }), [
    { field: "email", label: "Email", value: "Not set" },
    { field: "isActive", label: "Active", value: "No" },
  ]);
});

test("direct follow-up details render readable saved values", () => {
  assert.deepEqual(getSavedFields({ id: "1", action: "STATUS_CHANGE", changes: {
    status: "COMPLETED", assignedTo: { fullName: "Jane" }, notes: "Called the customer",
  } }).map((field) => field.value), ["Completed", "Jane", "Called the customer"]);
});
