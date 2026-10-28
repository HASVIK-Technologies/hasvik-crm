import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultBusinessFormValues } from "../lib/business/form-types.ts";
import { toCreateBusinessPayload } from "../lib/business/mappers.ts";
import { toBusinessUpdatePayload } from "../lib/business/update-payload.ts";

const values = {
  ...defaultBusinessFormValues,
  businessName: " ZZ-TEST Shop ",
  category: "cat-1",
  city: "Ballia",
  state: "Uttar Pradesh",
  pincode: "277001",
  address: "Main Market",
  status: "CONTACTED",
  description: "Sells chairs",
  leadSource: " Referral ",
  assignTo: "user-1",
  phoneNumbers: [{ value: "9876543210" }, { value: "" }],
};

test("create payload carries description, lead source and the owner, and not the ignored status", () => {
  const payload = toCreateBusinessPayload(values) as Record<string, unknown>;
  assert.equal(payload.name, "ZZ-TEST Shop");
  assert.equal(payload.assignedTo, "user-1");
  assert.equal(payload.description, "Sells chairs");
  assert.equal(payload.leadSource, "Referral");
  assert.equal("status" in payload, false);
  assert.deepEqual(payload.phoneNumbers, [{ number: "9876543210", name: "ZZ-TEST Shop", isPrimary: true }]);
});

test("create payload omits optional fields that are blank", () => {
  const payload = toCreateBusinessPayload({ ...values, description: "", leadSource: "  ", assignTo: "" }) as Record<string, unknown>;
  assert.equal("description" in payload, false);
  assert.equal("leadSource" in payload, false);
  assert.equal("assignedTo" in payload, false);
});

test("changing only the lead source sends only the lead source on update", () => {
  assert.deepEqual(toBusinessUpdatePayload({ ...values, leadSource: "Walk-in" }, values), { leadSource: "Walk-in" });
});
