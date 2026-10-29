import { test } from "node:test";
import assert from "node:assert/strict";
import { areaNames, cleanCities, fold, matchState } from "../lib/location/normalise.ts";
import { STATE_OPTIONS } from "../lib/business/form-options.ts";

test("fold ignores case, accents and surrounding space", () => {
  assert.equal(fold("  Āgra "), "agra");
  assert.equal(fold("Allahābād"), "allahabad");
});

test("cleanCities keeps one spelling per place, prefers the plain one, and sorts", () => {
  assert.deepEqual(cleanCities(["Āgra", "Agra", "Ballia", "  ", "Alīgarh", "Aligarh", "Azamgarh", "Āzamgarh"]), ["Agra", "Aligarh", "Azamgarh", "Ballia"]);
  assert.deepEqual(cleanCities(["Bāh"]), ["Bāh"]);
});

test("matchState maps postal names, including older ones, to the list the form uses", () => {
  assert.equal(matchState("Uttar Pradesh", STATE_OPTIONS), "Uttar Pradesh");
  assert.equal(matchState("uttar pradesh", STATE_OPTIONS), "Uttar Pradesh");
  assert.equal(matchState("Orissa", STATE_OPTIONS), "Odisha");
  assert.equal(matchState("Jammu & Kashmir", STATE_OPTIONS), "Jammu and Kashmir");
  assert.equal(matchState("Atlantis", STATE_OPTIONS), "");
});

test("areaNames drops the bracketed district suffix and duplicates", () => {
  assert.deepEqual(areaNames(["Baheri (Ballia)", "Ballia", "Ballia City", "Ballia"]), ["Baheri", "Ballia", "Ballia City"]);
});
