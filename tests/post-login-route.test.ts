import { test } from "node:test";
import assert from "node:assert/strict";
import { getPostLoginPath } from "../lib/auth/post-login-route.ts";

test("a new workspace admin returning from sign-up goes to Subscriptions", () => {
  assert.equal(getPostLoginPath("ADMIN", "?welcome=subscription"), "/subscriptions");
});

test("the role check ignores case and stray spaces", () => {
  assert.equal(getPostLoginPath("admin", "?welcome=subscription"), "/subscriptions");
  assert.equal(getPostLoginPath(" Admin ", "?welcome=subscription"), "/subscriptions");
});

test("everyone else goes to the dashboard", () => {
  assert.equal(getPostLoginPath("MANAGER", "?welcome=subscription"), "/dashboard");
  assert.equal(getPostLoginPath("USER", "?welcome=subscription"), "/dashboard");
  assert.equal(getPostLoginPath("SUPERADMIN", "?welcome=subscription"), "/dashboard");
});

test("an admin signing in normally goes to the dashboard", () => {
  assert.equal(getPostLoginPath("ADMIN", ""), "/dashboard");
  assert.equal(getPostLoginPath("ADMIN", "?welcome=other"), "/dashboard");
  assert.equal(getPostLoginPath("ADMIN", "?next=/subscriptions"), "/dashboard");
});
