import { test } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { businessQueryKeys } from "../lib/query/query-keys.ts";

test("business actions and note actions refetch visible activity despite staleTime", async () => {
  const client = new QueryClient();
  let requests = 0;
  const options = {
    queryKey: businessQueryKeys.activity("business-1"),
    queryFn: async () => ++requests,
    staleTime: 15_000,
  };
  await client.fetchQuery(options);
  const observer = new QueryObserver(client, options);
  const unsubscribe = observer.subscribe(() => {});
  try {
    await client.invalidateQueries({ queryKey: businessQueryKeys.all });
    assert.equal(requests, 2);
    await client.invalidateQueries({ queryKey: businessQueryKeys.activities() });
    assert.equal(requests, 3);
  } finally {
    unsubscribe();
    client.clear();
  }
});

test("business activity remains invalidated while its view is closed", async () => {
  const client = new QueryClient();
  const key = businessQueryKeys.activity("business-1");
  try {
    client.setQueryData(key, []);
    await client.invalidateQueries({ queryKey: businessQueryKeys.all });
    assert.equal(client.getQueryState(key)?.isInvalidated, true);
  } finally {
    client.clear();
  }
});
