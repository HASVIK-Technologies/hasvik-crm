import { test } from "node:test";
import assert from "node:assert/strict";
import { getActivityMessages } from "../lib/audit-logs/activity-messages.ts";
import { getSavedFields } from "../lib/audit-logs/saved-fields.ts";

test("one timeline event describes every saved change with readable names and status", () => {
  const fields = getSavedFields({ id: "multi-field", action: "UPDATE", changes: {
    changedFields: ["assignedTo", "status", "email"],
    newData: { status: "PROPOSAL_AND_NEGOTIATION", email: null },
    assignedTo: { oldValue: null, newValue: { fullName: "Hasvik Admin" } },
  } });
  assert.deepEqual(getActivityMessages("UPDATE", fields), [
    "Assigned to Hasvik Admin",
    "Lead status changed to Proposal and negotiation",
    "Email cleared",
  ]);
});

test("updates describe assignment, activation and business name", () => {
  assert.deepEqual(getActivityMessages("UPDATE", [
    { field: "assignedTo", label: "Assigned to", value: "Abhishek Gupta" },
    { field: "isActive", label: "Active", value: "No" },
    { field: "name", label: "Business name", value: "ABC Furniture" },
  ]), ["Assigned to Abhishek Gupta", "Business deactivated", "Business name changed to ABC Furniture"]);
  assert.deepEqual(getActivityMessages("UPDATE", [{ field: "isActive", label: "Active", value: "Yes" }]), ["Business activated"]);
});

test("clears, missing values and unresolved IDs have useful fallbacks", () => {
  assert.deepEqual(getActivityMessages("UPDATE", [
    { field: "assignedTo", label: "Assigned to", value: "Not set" },
    { field: "email", label: "Email", value: "Not set" },
    { field: "assignedTo", label: "Assigned to", value: "6acce8d66133771d62ca1e2e" },
    { field: "status", label: "Lead status", value: "Value unavailable" },
  ]), ["Business unassigned", "Email cleared", "Business assignment updated", "Lead status updated"]);
});

test("creation keeps its original event title", () => {
  assert.deepEqual(getActivityMessages("CREATE", [{ field: "name", label: "Business name", value: "ABC" }]), []);
});

test("other entity updates use their own names and statuses", () => {
  for (const entity of ["Follow-up", "User", "Category", "Subscription", "Tenant"]) {
    assert.deepEqual(getActivityMessages("UPDATE", [
      { field: "name", label: "Name", value: "New name" },
      { field: "status", label: "Status", value: "Active" },
      { field: "isActive", label: "Active", value: "No" },
    ], entity), [`${entity} name changed to New name`, `${entity} status changed to Active`, `${entity} deactivated`]);
  }
});
