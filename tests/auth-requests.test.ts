import { test } from "node:test";
import assert from "node:assert/strict";
import axios, { type InternalAxiosRequestConfig } from "axios";
import { attachRequestAuth } from "../lib/auth/request-auth.ts";
import { createSessionController } from "../lib/auth/session-controller.ts";

function unauthorized(config: InternalAxiosRequestConfig) {
  return new axios.AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, { data: {}, status: 401, statusText: "Unauthorized", headers: {}, config });
}
function success(config: InternalAxiosRequestConfig) { return { data: "ok", status: 200, statusText: "OK", headers: {}, config }; }

test("concurrent protected 401s refresh once and replay each request with the fresh token", async () => {
  const state = { token: "old", sessionVersion: 0, isLoggingOut: false };
  let refreshes = 0;
  let requests = 0;
  const controller = createSessionController({ version: () => state.sessionVersion, blocked: () => false,
    request: async () => { refreshes++; await new Promise((resolve) => setTimeout(resolve, 5)); return "new"; }, apply: (token) => { state.token = token; }, expire: () => assert.fail(), isUnauthorized: () => false });
  const client = axios.create({ adapter: async (config) => { requests++; if (config.headers.get("Authorization") === "Bearer old") throw unauthorized(config); return success(config); } });
  attachRequestAuth(client, { snapshot: () => state, refresh: () => controller.refresh(), expire: () => assert.fail(), notify: () => assert.fail("No toast on successful refresh") });
  await Promise.all([client.get("/businesses"), client.get("/follow-ups"), client.get("/users")]);
  assert.equal(refreshes, 1);
  assert.equal(requests, 6);
});

test("late 401 from the previous token reuses the current token without another refresh", async () => {
  const state = { token: "old", sessionVersion: 0, isLoggingOut: false };
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let refreshes = 0;
  const client = axios.create({ adapter: async (config) => {
    if (config.headers.get("Authorization") === "Bearer old") { if (config.url === "/slow") await gate; throw unauthorized(config); }
    return success(config);
  } });
  attachRequestAuth(client, { snapshot: () => state, refresh: async () => { refreshes++; state.token = "new"; return "new"; }, expire: () => assert.fail(), notify: () => assert.fail() });
  const slow = client.get("/slow");
  await client.get("/fast");
  release();
  await slow;
  assert.equal(refreshes, 1);
});

test("requests and stale responses during logout are canceled without toasts or refresh", async () => {
  const state = { token: "old" as string | null, sessionVersion: 0, isLoggingOut: false };
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const client = axios.create({ adapter: async (config) => { await gate; return success(config); } });
  attachRequestAuth(client, { snapshot: () => state, refresh: async () => { assert.fail(); }, expire: () => assert.fail(), notify: () => assert.fail() });
  const pending = client.get("/users");
  await new Promise((resolve) => setTimeout(resolve, 0));
  state.sessionVersion++;
  state.isLoggingOut = true;
  state.token = null;
  release();
  await assert.rejects(pending, (error: unknown) => axios.isCancel(error));
  await assert.rejects(client.get("/users"), (error: unknown) => axios.isCancel(error));
});

test("silent auth verification errors neither refresh nor toast", async () => {
  const client = axios.create({ adapter: async (config) => { throw unauthorized(config); } });
  attachRequestAuth(client, { snapshot: () => ({ token: "login-token", sessionVersion: 0, isLoggingOut: false }), refresh: async () => { assert.fail(); }, expire: () => assert.fail(), notify: () => assert.fail() });
  await assert.rejects(client.get("/auth/me", { skipAuthRefresh: true, silent: true }));
});

test("a failed retry ends the session rather than entering a refresh loop", async () => {
  const state = { token: "old", sessionVersion: 0, isLoggingOut: false };
  let refreshes = 0;
  let expirations = 0;
  const client = axios.create({ adapter: async (config) => { throw unauthorized(config); } });
  attachRequestAuth(client, { snapshot: () => state, refresh: async () => { refreshes++; state.token = "new"; return "new"; }, expire: () => { expirations++; state.sessionVersion++; }, notify: () => assert.fail() });
  await assert.rejects(client.get("/businesses"), (error: unknown) => axios.isCancel(error));
  assert.equal(refreshes, 1);
  assert.equal(expirations, 1);
});

test("permission errors do not expire a valid session or attempt token refresh", async () => {
  let notices = 0;
  const client = axios.create({ adapter: async (config) => {
    throw new axios.AxiosError("Forbidden", "ERR_BAD_REQUEST", config, undefined, { data: {}, status: 403, statusText: "Forbidden", headers: {}, config });
  } });
  attachRequestAuth(client, { snapshot: () => ({ token: "valid", sessionVersion: 0, isLoggingOut: false }), refresh: async () => assert.fail(), expire: () => assert.fail(), notify: () => { notices++; } });
  await assert.rejects(client.get("/admin-only"));
  assert.equal(notices, 1);
});

test("an unavailable refresh service reports a temporary failure without clearing auth", async () => {
  let notices = 0;
  const state = { token: "expired-but-retained", sessionVersion: 0, isLoggingOut: false };
  const client = axios.create({ adapter: async (config) => { throw unauthorized(config); } });
  attachRequestAuth(client, { snapshot: () => state, refresh: async () => { throw new Error("Service unavailable"); }, expire: () => assert.fail(), notify: (_error, refreshFailure) => { assert.equal(refreshFailure, true); notices++; } });
  await assert.rejects(client.get("/businesses"), /Service unavailable/);
  assert.equal(state.token, "expired-but-retained");
  assert.equal(notices, 1);
});
