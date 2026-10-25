import { test } from "node:test";
import assert from "node:assert/strict";
import { collectTenantPages, readTenantsPage } from "../lib/tenants/pagination.ts";
import type { TenantQueryParams } from "../types/tenant.ts";

test("tenant page preserves server total rather than current page length", () => {
  assert.deepEqual(readTenantsPage({ data: [{ _id: "tenant-11", name: "Tenant 11", isActive: true }], total: 25 }), {
    data: [{ id: "tenant-11", name: "Tenant 11", isActive: true, fullName: undefined, contactEmail: undefined, contactPhone: undefined, createdAt: undefined, updatedAt: undefined }], total: 25,
  });
  assert.equal(readTenantsPage({ data: [], total: 25 }).total, 25);
  assert.equal(readTenantsPage([]).total, 0);
});

test("global lookup/search collects subsequent pages and both statuses", async () => {
  const calls: TenantQueryParams[] = [];
  const tenants = await collectTenantPages(async (params) => {
    calls.push(params);
    const total = params.isActive ? 105 : 3;
    const offset = ((params.page ?? 1) - 1) * (params.limit ?? 100);
    return {
      total,
      data: Array.from({ length: Math.max(0, Math.min(params.limit ?? 100, total - offset)) }, (_, index) => ({
        id: `${params.isActive}-${offset + index}`, name: `Tenant ${offset + index}`, isActive: Boolean(params.isActive),
      })),
    };
  });
  assert.equal(tenants.length, 108);
  assert.ok(calls.some((call) => call.page === 2 && call.isActive === true));
  assert.ok(calls.some((call) => call.isActive === false));
  assert.equal(tenants.filter((tenant) => tenant.isActive).length, 105);
});

test("a backend that repeats a page fails instead of looping forever", async () => {
  await assert.rejects(collectTenantPages(async (params) => ({
    total: 2, data: [{ id: String(params.isActive), name: "Repeated", isActive: Boolean(params.isActive) }],
  })), /pagination did not advance/);
});
