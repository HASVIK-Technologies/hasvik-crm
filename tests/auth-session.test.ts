import { test } from "node:test";
import assert from "node:assert/strict";
import { createSessionController, SessionChangedError, SessionExpiredError } from "../lib/auth/session-controller.ts";
import { tokenExpiresAt, tokenRefreshDelay } from "../lib/auth/token-expiry.ts";
import { restoreSession } from "../lib/auth/restore-session.ts";
import { revokeSession } from "../lib/auth/logout-session.ts";
import { sameSessionIdentity } from "../lib/auth/session-identity.ts";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test("simultaneous refreshes share one request and apply one token", async () => {
  const pending = deferred<string>();
  let requests = 0;
  const tokens: string[] = [];
  const controller = createSessionController({ version: () => 0, blocked: () => false,
    request: () => { requests++; return pending.promise; }, apply: (token) => tokens.push(token), expire: () => assert.fail("Must not expire"), isUnauthorized: () => false });
  const first = controller.refresh();
  const second = controller.refresh();
  assert.equal(first, second);
  await Promise.resolve();
  assert.equal(requests, 1);
  pending.resolve("new-token");
  assert.deepEqual(await Promise.all([first, second]), ["new-token", "new-token"]);
  assert.deepEqual(tokens, ["new-token"]);
});

test("temporary refresh failures preserve the session and permit retry", async () => {
  let attempts = 0;
  let expired = false;
  const controller = createSessionController({ version: () => 0, blocked: () => false,
    request: async () => { if (++attempts === 1) throw new Error("Offline"); return "recovered"; },
    apply: () => {}, expire: () => { expired = true; }, isUnauthorized: () => false });
  await assert.rejects(controller.refresh(), /Offline/);
  assert.equal(expired, false);
  assert.equal(await controller.refresh(), "recovered");
});

test("confirmed refresh rejection expires the session once", async () => {
  let expired = 0;
  const controller = createSessionController({ version: () => 0, blocked: () => false,
    request: async () => { throw new Error("Refresh cookie rejected"); }, apply: () => assert.fail(), expire: () => { expired++; }, isUnauthorized: () => true });
  const first = controller.refresh();
  const second = controller.refresh();
  await assert.rejects(first, SessionExpiredError);
  await assert.rejects(second, SessionExpiredError);
  assert.equal(expired, 1);
});

test("a delayed refresh cannot resurrect a logged-out session or replace a new login", async () => {
  const pending = deferred<string>();
  let version = 0;
  let token = "old";
  const controller = createSessionController({ version: () => version, blocked: () => false,
    request: () => pending.promise, apply: (next) => { token = next; }, expire: () => assert.fail(), isUnauthorized: () => false });
  const refresh = controller.refresh();
  await Promise.resolve();
  version++;
  token = "new-account-token";
  controller.cancel();
  pending.resolve("late-old-account-token");
  await assert.rejects(refresh, SessionChangedError);
  assert.equal(token, "new-account-token");
});

test("blocked restoration never starts another refresh", async () => {
  const controller = createSessionController({ version: () => 0, blocked: () => true,
    request: async () => { assert.fail("No refresh after intentional logout"); }, apply: () => assert.fail(), expire: () => assert.fail(), isUnauthorized: () => false });
  await assert.rejects(controller.refresh(), SessionChangedError);
});

test("JWT expiry is used instead of resetting the access lifetime to fifteen minutes", () => {
  const jwt = `header.${btoa(JSON.stringify({ exp: 1900000000 })).replaceAll("=", "")}.signature`;
  assert.equal(tokenExpiresAt(jwt, 1000), 1900000000000);
  assert.equal(tokenExpiresAt("opaque-token", 1000), 901000);
  const expired = `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`;
  assert.equal(tokenExpiresAt(expired, 999999), 1000);
});

test("short-lived tokens refresh before expiry without a one-second refresh storm", () => {
  assert.equal(tokenRefreshDelay(30_000, 0), 15_000);
  assert.equal(tokenRefreshDelay(15 * 60_000, 0), 14 * 60_000);
  assert.equal(tokenRefreshDelay(0, 1000), 1000);
});

test("a fresh portal visit restores its cookie session and authenticates only after user verification", async () => {
  const state = { token: null as string | null, sessionVersion: 0 };
  const user = { userId: "user-1" };
  let committed = false;
  const result = await restoreSession({ snapshot: () => state,
    refresh: async () => { state.token = "cookie-restored-token"; return state.token; },
    getUser: async () => { assert.equal(committed, false); return user; },
    commit: () => { committed = true; },
  });
  assert.deepEqual(result, { accessToken: "cookie-restored-token", user });
  assert.equal(committed, true);
});

test("a background /me refresh returns the newest token rather than caching the original token", async () => {
  const state = { token: "old", sessionVersion: 0 };
  const result = await restoreSession({ snapshot: () => state, refresh: async () => assert.fail(),
    getUser: async () => { state.token = "renewed-during-me"; return { userId: "user-1" }; }, commit: () => {},
  });
  assert.equal(result.accessToken, "renewed-during-me");
});

test("session restoration cannot commit identity after logout or when user verification fails", async () => {
  const state = { token: "old", sessionVersion: 0 };
  await assert.rejects(restoreSession({ snapshot: () => state, refresh: async () => assert.fail(),
    getUser: async () => { state.sessionVersion++; return { userId: "old-user" }; }, commit: () => assert.fail("Must not restore a logged-out user"),
  }), SessionChangedError);
  await assert.rejects(restoreSession({ snapshot: () => state, refresh: async () => assert.fail(),
    getUser: async () => { throw new Error("Server unavailable"); }, commit: () => assert.fail("Must verify identity first"),
  }), /Server unavailable/);
});

test("logout renews an expired bearer only to revoke it, without reviving local auth", async () => {
  const requests: string[] = [];
  await revokeSession({ token: "expired", logout: async (token) => { requests.push(`logout:${token}`); if (token === "expired") throw new Error("Unauthorized"); },
    refresh: async () => { requests.push("refresh-for-revocation"); return "fresh"; }, isUnauthorized: () => true });
  assert.deepEqual(requests, ["logout:expired", "refresh-for-revocation", "logout:fresh"]);
});

test("logout does not refresh after a network error or loop on another rejection", async () => {
  await assert.rejects(revokeSession({ token: "token", logout: async () => { throw new Error("Offline"); }, refresh: async () => assert.fail(), isUnauthorized: () => false }), /Offline/);
  let attempts = 0;
  await assert.rejects(revokeSession({ token: "token", logout: async () => { attempts++; throw new Error("Unauthorized"); }, refresh: async () => "fresh", isUnauthorized: () => true }), /Unauthorized/);
  assert.equal(attempts, 2);
});

test("cookie/account, tenant, or permission changes cannot reuse the previous auth context", () => {
  const current = { userId: "user-a", tenantId: "tenant-a", role: "ADMIN" };
  assert.equal(sameSessionIdentity(current, { ...current, role: " admin " }), true);
  assert.equal(sameSessionIdentity(current, { ...current, userId: "user-b" }), false);
  assert.equal(sameSessionIdentity(current, { ...current, tenantId: "tenant-b" }), false);
  assert.equal(sameSessionIdentity(current, { ...current, role: "USER" }), false);
});
