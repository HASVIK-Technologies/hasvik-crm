import { test } from "node:test";
import assert from "node:assert/strict";
import { splitFilters, visibleFilterCount } from "../lib/filters/responsive.ts";

test("filter breakpoints cover mobile, tablet, large and extra-large screens", () => {
  for (const width of [320, 375, 768, 1023]) assert.equal(visibleFilterCount(width), 0);
  for (const width of [1024, 1100, 1279]) assert.equal(visibleFilterCount(width), 2);
  for (const width of [1280, 1440, 1920]) assert.equal(visibleFilterCount(width), 3);
});

test("resizing preserves filter order and places every remaining filter in More Filters", () => {
  const fields = ["category", "lead-status", "city", "activity"];
  assert.deepEqual(splitFilters(fields, visibleFilterCount(1024)), { visible: fields.slice(0, 2), more: fields.slice(2) });
  assert.deepEqual(splitFilters(fields, visibleFilterCount(1280)), { visible: fields.slice(0, 3), more: ["activity"] });
  assert.deepEqual(splitFilters(fields, visibleFilterCount(768)), { visible: [], more: fields });
});

test("pages with fewer filters have no empty More Filters group", () => {
  for (const width of [1024, 1280]) {
    assert.deepEqual(splitFilters(["status"], visibleFilterCount(width)), { visible: ["status"], more: [] });
  }
});
