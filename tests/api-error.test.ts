import { test } from "node:test";
import assert from "node:assert/strict";
import { AxiosError } from "axios";
import { getApiErrorMessage, getApiFieldErrors } from "../lib/api/api-error.ts";

function failure(status: number, data: unknown) {
  return new AxiosError("fail", "ERR_BAD_REQUEST", undefined, undefined, { status, data, statusText: "", headers: {}, config: {} as never });
}

test("validation arrays become readable sentences instead of a generic 400 message", () => {
  const error = failure(400, { message: ["email must be an email", "password must be longer than or equal to 8 characters"] });
  assert.equal(getApiErrorMessage(error), "Email must be an email. Password must be longer than or equal to 8 characters.");
});

test("field errors are mapped to the field they name, the rest go to the form", () => {
  const error = failure(400, { message: ["email must be an email", "something else broke"] });
  assert.deepEqual(getApiFieldErrors(error, ["email", "password"]), { email: "Email must be an email.", _form: "Something else broke." });
  assert.deepEqual(getApiFieldErrors(new Error("x"), ["email"]), {});
});
