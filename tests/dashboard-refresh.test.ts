import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver, focusManager, onlineManager } from "@tanstack/react-query";
import { DASHBOARD_REFRESH_INTERVAL, dashboardQueryPolicy, isDashboardQuery, shouldAutoRefreshDashboard } from "../lib/dashboard/refresh.ts";

test("auto refresh requires auto mode, a visible online page and no pending request", () => {
  assert.equal(DASHBOARD_REFRESH_INTERVAL, 60_000);
  for (const mode of ["manual", "auto"] as const) {
    for (const visible of [true, false]) for (const online of [true, false]) for (const fetching of [true, false]) {
      assert.equal(shouldAutoRefreshDashboard(mode, visible, online, fetching), mode === "auto" && visible && online && !fetching);
    }
  }
});

test("manual dashboard queries do not refetch on mount, focus or reconnect", async () => {
  const client = new QueryClient();
  let requests = 0;
  const options = { queryKey: ["businesses", "dashboard", "test"], queryFn: async () => ++requests, ...dashboardQueryPolicy };
  await client.fetchQuery(options);
  client.mount();
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  try {
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(requests, 1);
    assert.equal(observer.getCurrentResult().isStale, false);
  } finally {
    unsubscribe(); client.unmount(); client.clear(); focusManager.setFocused(undefined); onlineManager.setOnline(true);
  }
});

test("refresh targets active dashboard queries without refreshing unrelated shell queries", async () => {
  const client = new QueryClient();
  let dashboardRequests = 0;
  let shellRequests = 0;
  const options = { queryKey: ["subscriptions", "dashboard", "user-1"], queryFn: async () => ++dashboardRequests, ...dashboardQueryPolicy };
  await client.fetchQuery(options);
  await client.fetchQuery({ queryKey: ["subscriptions", "list", "user-1"], queryFn: async () => ++shellRequests });
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  try {
    await client.refetchQueries({ predicate: isDashboardQuery, type: "active" });
    assert.equal(dashboardRequests, 2);
    assert.equal(shellRequests, 1);
    assert.equal(isDashboardQuery({ meta: { dashboard: true } }), true);
    assert.equal(isDashboardQuery({}), false);
  } finally { unsubscribe(); client.clear(); }
});
