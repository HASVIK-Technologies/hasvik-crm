import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultBusinessFormValues } from "../lib/business/form-types.ts";
import { toBusinessUpdatePayload } from "../lib/business/update-payload.ts";

const original = {
  ...defaultBusinessFormValues,
  businessName: "ABC Furniture",
  category: "category-1",
  email: "hello@example.com",
  website: "https://example.com",
  assignTo: "user-1",
  phoneNumbers: [{ value: "9876543210" }],
};

test("unchanged forms and normalized equivalent values produce no PATCH fields", () => {
  assert.deepEqual(toBusinessUpdatePayload(structuredClone(original), original), {});
  assert.deepEqual(toBusinessUpdatePayload({
    ...original, businessName: " ABC Furniture ", website: "example.com",
    categoryName: "Different display label", assignToName: "Owner label",
    phoneNumbers: [...original.phoneNumbers, { value: "" }],
  }, original), {});
});

test("a name edit sends only the name, including edits restored from drafts", () => {
  assert.deepEqual(toBusinessUpdatePayload({ ...original, businessName: "New name" }, original), { name: "New name" });
});

test("explicit clears are retained and unrelated fields are omitted", () => {
  assert.deepEqual(toBusinessUpdatePayload({
    ...original, email: "", website: "", assignTo: "", phoneNumbers: [{ value: "" }],
  }, original), { email: null, website: null, assignedTo: null, phoneNumbers: [] });
});

test("changed number arrays and category use only their API field names", () => {
  assert.deepEqual(toBusinessUpdatePayload({
    ...original, category: "category-2", phoneNumbers: [{ value: "9123456780" }],
  }, original), {
    categoryId: "category-2", phoneNumbers: [{ number: "9123456780", isPrimary: true }],
  });
});
