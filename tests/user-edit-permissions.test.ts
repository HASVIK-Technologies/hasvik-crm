import { test } from "node:test";
import assert from "node:assert/strict";
import { canEditManagedUser } from "../types/auth.ts";

test("admins can edit every non-superadmin role and superadmins can edit all roles", () => {
  for (const role of ["ADMIN", "MANAGER", "SALES", "USER", "SUPERADMIN"]) {
    assert.equal(canEditManagedUser({ role: "ADMIN" }, { role }), role !== "SUPERADMIN");
    assert.equal(canEditManagedUser({ role: "SUPERADMIN" }, { role }), true);
    for (const actor of ["MANAGER", "SALES", "USER"]) {
      assert.equal(canEditManagedUser({ role: actor }, { role }), false);
    }
  }
  assert.equal(canEditManagedUser({ role: " admin " }, { role: " superadmin " }), false);
  assert.equal(canEditManagedUser(null, { role: "USER" }), false);
  assert.equal(canEditManagedUser({ role: "ADMIN" }, null), false);
});
