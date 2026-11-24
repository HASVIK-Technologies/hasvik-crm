import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanDisplayDigits } from "../lib/business/contact-numbers.ts";
import type { CreateUserPayload, UpdateUserPayload } from "../types/user.ts";

test("cleanDisplayDigits extracts 10 digits and strips country code or prefixes", () => {
  // Plain 10 digits
  assert.equal(cleanDisplayDigits("9876543210"), "9876543210");

  // With +91 prefix
  assert.equal(cleanDisplayDigits("+91 98765 43210"), "9876543210");
  assert.equal(cleanDisplayDigits("+919876543210"), "9876543210");
  assert.equal(cleanDisplayDigits("919876543210"), "9876543210");

  // With leading 0
  assert.equal(cleanDisplayDigits("09876543210"), "9876543210");

  // User examples
  assert.equal(cleanDisplayDigits("+919473236395"), "9473236395");
  assert.equal(cleanDisplayDigits("09473236395"), "9473236395");

  // With spaces, hyphens, and parentheses
  assert.equal(cleanDisplayDigits("(+91) 98765-43210"), "9876543210");

  // Truncates to 10 digits if more digits entered
  assert.equal(cleanDisplayDigits("987654321099"), "9876543210");

  // Partial digits preserved
  assert.equal(cleanDisplayDigits("987"), "987");

  // Empty or undefined
  assert.equal(cleanDisplayDigits(""), "");
  assert.equal(cleanDisplayDigits(undefined), "");
});

test("CreateUserPayload and UpdateUserPayload support phoneNumber", () => {
  const createPayload: CreateUserPayload = {
    fullName: "Akankshya Mishra",
    email: "akankshya@hasvik.com",
    role: "ADMIN",
    password: "Password123!",
    phoneNumber: "9876543210",
  };
  assert.equal(createPayload.phoneNumber, "9876543210");

  const updatePayload: UpdateUserPayload = {
    phoneNumber: "9876543210",
  };
  assert.equal(updatePayload.phoneNumber, "9876543210");
});
