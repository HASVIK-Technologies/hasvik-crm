import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_DEFAULT_TAGS,
  filterTags,
  getTagAssociations,
  hexToRgba,
  normalizeHexColor,
  normalizeTagEntity,
  removeDeletedTagAssociations,
  sortTags,
  toTagEntityEnum,
} from "../lib/tags/utils.ts";

test("initializes with the 8 default tags from reference screenshot", () => {
  assert.equal(INITIAL_DEFAULT_TAGS.length, 8);

  const tagNames = INITIAL_DEFAULT_TAGS.map((t) => t.name);
  assert.ok(tagNames.includes("Hot Lead"));
  assert.ok(tagNames.includes("Proposal Sent"));
  assert.ok(tagNames.includes("Follow-up Today"));
  assert.ok(tagNames.includes("Demo"));
  assert.ok(tagNames.includes("Not Interested"));
  assert.ok(tagNames.includes("Renewal"));
  assert.ok(tagNames.includes("Long Term"));
  assert.ok(tagNames.includes("Closed Won"));
});

test("normalizes colors and hex values correctly", () => {
  assert.equal(normalizeHexColor("#20b83f"), "#20B83F");
  assert.equal(normalizeHexColor("0876d1"), "#0876D1");
  assert.equal(normalizeHexColor(""), "#20B83F");
});

test("normalizes entity values between display and enum correctly", () => {
  assert.equal(normalizeTagEntity("BUSINESS"), "Business");
  assert.equal(normalizeTagEntity("FOLLOW_UP"), "Follow-up");
  assert.equal(normalizeTagEntity("Follow-up"), "Follow-up");
  assert.equal(normalizeTagEntity("Business"), "Business");

  assert.equal(toTagEntityEnum("Business"), "BUSINESS");
  assert.equal(toTagEntityEnum("Follow-up"), "FOLLOW_UP");
  assert.equal(toTagEntityEnum("FOLLOW_UP"), "FOLLOW_UP");
});

test("converts hex to valid translucent rgba string", () => {
  const rgba = hexToRgba("#20B83F", 0.12);
  assert.match(rgba, /^rgba\(\d+,\s*\d+,\s*\d+,\s*0\.12\)$/);
});

test("filters tags by entity", () => {
  const allResult = filterTags(INITIAL_DEFAULT_TAGS, undefined, "ALL");
  assert.equal(allResult.length, 8);

  const businessResult = filterTags(INITIAL_DEFAULT_TAGS, undefined, "BUSINESS");
  assert.ok(businessResult.length > 0);
  assert.ok(businessResult.every((t) => toTagEntityEnum(t.entity) === "BUSINESS"));

  const followUpResult = filterTags(INITIAL_DEFAULT_TAGS, undefined, "FOLLOW_UP");
  assert.ok(followUpResult.length > 0);
  assert.ok(followUpResult.every((t) => toTagEntityEnum(t.entity) === "FOLLOW_UP"));
});

test("searches tags by name or description", () => {
  const searchByName = filterTags(INITIAL_DEFAULT_TAGS, "Proposal");
  assert.ok(searchByName.some((t) => t.name === "Proposal Sent"));

  const searchByDesc = filterTags(INITIAL_DEFAULT_TAGS, "immediate follow-up");
  assert.ok(searchByDesc.some((t) => t.name === "Hot Lead"));
});

test("supports sorting by name ascending and descending", () => {
  const ascResult = sortTags(INITIAL_DEFAULT_TAGS, "name", "asc");
  const descResult = sortTags(INITIAL_DEFAULT_TAGS, "name", "desc");

  assert.ok(ascResult[0].name.localeCompare(ascResult[1].name) <= 0);
  assert.ok(descResult[0].name.localeCompare(descResult[1].name) >= 0);
});

test("supports sorting by entity", () => {
  const entitySort = sortTags(INITIAL_DEFAULT_TAGS, "entity", "asc");
  assert.equal(entitySort.length, 8);
  assert.equal(normalizeTagEntity(entitySort[0].entity), "Business");
});

test("Delete Tags: detects assigned leads and follow-ups associations", () => {
  const hotLead = INITIAL_DEFAULT_TAGS.find((t) => t.name === "Hot Lead");
  assert.ok(hotLead);

  const associations = getTagAssociations(hotLead);
  assert.equal(associations.leadsCount, 14);
  assert.equal(associations.followUpsCount, 5);
  assert.equal(associations.total, 19);

  const unassignedTag = {
    id: "tag-test-empty",
    name: "Unused Tag",
    color: "#20B83F",
    entity: "BUSINESS" as const,
  };
  const emptyAssociations = getTagAssociations(unassignedTag);
  assert.equal(emptyAssociations.leadsCount, 0);
  assert.equal(emptyAssociations.followUpsCount, 0);
  assert.equal(emptyAssociations.total, 0);
});

test("Delete Tags: safely handles unlinking associations without error", () => {
  const res = removeDeletedTagAssociations("tag-1", "Hot Lead");
  assert.equal(typeof res.businessesUpdated, "number");
  assert.equal(typeof res.followUpsUpdated, "number");
});
