import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeAuthUser } from "../lib/auth/normalize-user.ts";

test("accepts the /auth/me MongoDB document without firstName or lastName", () => {
  const user = normalizeAuthUser({
    _id: "user-1", email: "admin@example.com", fullName: "Hasvik Admin",
    role: "SUPERADMIN", isActive: true, tenantId: "tenant-1",
    hasActiveSubscription: true, createdAt: "2026-09-20T07:53:29.430Z", __v: 0,
  });
  assert.deepEqual(user, {
    userId: "user-1", email: "admin@example.com", fullName: "Hasvik Admin",
    role: "SUPERADMIN", firstName: "", lastName: "", tenantId: "tenant-1", phoneNumber: undefined,
  });
});

test("normalizes supported user identifiers and response envelopes", () => {
  for (const key of ["userId", "_id", "id", "sub"]) {
    const user = { [key]: "user-1", email: "user@example.com", role: "ADMIN", fullName: "Test User" };
    for (const payload of [user, { user }, { data: user }, { data: { user } }]) {
      const normalized = normalizeAuthUser(payload);
      assert.equal(normalized.userId, "user-1");
      assert.equal(normalized.email, "user@example.com");
      assert.equal(normalized.role, "ADMIN");
      assert.equal(normalized.fullName, "Test User");
    }
  }
});

test("normalizes populated tenants and optional profile fields", () => {
  const user = { _id: "user-1", email: "user@example.com", role: " sales ", firstName: "Test", lastName: "User" };
  for (const tenantId of ["tenant-1", { _id: "tenant-1" }, { id: "tenant-1" }]) {
    const normalized = normalizeAuthUser({ ...user, tenantId });
    assert.equal(normalized.tenantId, "tenant-1");
    assert.equal(normalized.role, "SALES");
    assert.equal(normalized.fullName, "Test User");
  }
  assert.equal(normalizeAuthUser(user).tenantId, undefined);
});

test("rejects malformed users without fabricating an identity or permissions", () => {
  for (const payload of [null, [], {}, { data: [] },
    { userId: "", email: "a@b.com", role: "ADMIN" },
    { userId: "user-1", email: "a@b.com" },
    { userId: "user-1", email: "a@b.com", role: {} },
    { userId: "user-1", role: "ADMIN" }]) {
    assert.throws(() => normalizeAuthUser(payload), /invalid user/);
  }
});
