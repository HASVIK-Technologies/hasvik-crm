import { test } from "node:test";
import assert from "node:assert/strict";
import { BUSINESS_PROFILE_FIELDS, getLeadKind, getLeadNameLabel, hasBusinessProfileFields, isIndividualCategory } from "../lib/business/lead-type.ts";

test("the category named individual marks a B2C lead, whatever its casing or spacing", () => {
  for (const name of ["individual", "Individual", "INDIVIDUAL", "  Individual  "]) {
    assert.equal(isIndividualCategory(name), true, name);
  }
});

test("any other category, or none, is not an individual", () => {
  for (const name of ["Retail", "Individuals", "Individual Traders", "", "   ", undefined, null]) {
    assert.equal(isIndividualCategory(name), false, String(name));
  }
});

test("lead kind is unknown until a category is chosen", () => {
  assert.equal(getLeadKind(""), "unknown");
  assert.equal(getLeadKind(undefined), "unknown");
  assert.equal(getLeadKind("Uncategorized"), "unknown");
  assert.equal(getLeadKind("Retail"), "business");
  assert.equal(getLeadKind("individual"), "individual");
});

test("the name field is worded for the kind of lead", () => {
  assert.equal(getLeadNameLabel("individual"), "Full Name");
  assert.equal(getLeadNameLabel("business"), "Business Name");
  assert.equal(getLeadNameLabel("unknown"), "Name");
});

test("website and description are hidden for individuals only", () => {
  assert.equal(hasBusinessProfileFields("individual"), false);
  assert.equal(hasBusinessProfileFields("Individual"), false);
  assert.equal(hasBusinessProfileFields("Retail"), true);
  assert.equal(hasBusinessProfileFields(""), true);
  assert.equal(hasBusinessProfileFields(undefined), true);
});

test("the business-only fields are website and description, and nothing else", () => {
  assert.deepEqual([...BUSINESS_PROFILE_FIELDS], ["website", "description"]);
});
