import { test } from "node:test";
import assert from "node:assert/strict";
import { STATUS_OPTIONS } from "../lib/business/form-options.ts";
import { STAGES, STAGE_LABELS } from "../lib/analytics/metrics.ts";

test("the pipeline stages are in the same order, with the same names, on the board, forms and reports", () => {
  assert.deepEqual(STATUS_OPTIONS.map((stage) => stage.value), [...STAGES]);
  assert.deepEqual(STATUS_OPTIONS.map((stage) => stage.label.toLowerCase()), STAGES.map((stage) => STAGE_LABELS[stage].toLowerCase()).map((label) => (label === "new" ? "new lead" : label)));
});
