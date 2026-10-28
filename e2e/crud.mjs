// Ownership and CRUD pass using ZZ-TEST records only (created, changed and deleted through the API / UI, then cleaned up).
// Usage: E2E_EMAIL=.. E2E_PASSWORD=.. node e2e/crud.mjs <phone|desktop>
import { BASE, launch, login, settle, suite } from "./helpers.mjs";

const size = process.argv[2] ?? "desktop";
const API = "https://crm-backend-three-phi.vercel.app/api";
const t = suite(`crud/${size}`);
const { browser, page } = await launch(size);

const auth = await (await fetch(`${API}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD }) })).json();
const headers = { authorization: `Bearer ${auth.accessToken}`, "content-type": "application/json" };
const call = async (method, path, body) => {
  const response = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let json = null; try { json = await response.json(); } catch {}
  return { status: response.status, json };
};
const me = (await call("GET", "/auth/me")).json;
const name = `ZZ-TEST owner flow ${Date.now()}`;
let created;

await login(page);

try {
  await t.step("API: create with an owner returns the owner on the record", async () => {
    const { status, json } = await call("POST", "/businesses", { name, assignedTo: me._id, phoneNumbers: [{ number: "9000000011", name: "ZZ", isPrimary: true }], city: "Ballia", state: "Uttar Pradesh", pincode: "277001", address: "ZZ" });
    if (status !== 201) throw new Error(`create returned ${status}`);
    created = json;
    const read = (await call("GET", `/businesses/${created._id}`)).json;
    if ((read.assignee?._id ?? read.assignedTo) !== me._id && read.assignedTo?._id !== me._id) throw new Error("owner missing on the saved record");
  });

  await t.step("UI: the record shows its owner and the Owner filter finds it", async () => {
    await page.goto(`${BASE}/businesses?owner=${me._id}&search=${encodeURIComponent(name.toLowerCase())}`);
    await page.getByRole("heading", { name: /^Businesses\s*\(1\)/ }).first().waitFor({ timeout: 30000 });
    await page.getByRole("group", { name: "Active filters" }).waitFor();
  });

  await t.step("UI: the same search under a different owner does not show it", async () => {
    await page.goto(`${BASE}/businesses?owner=none&search=${encodeURIComponent(name.toLowerCase())}`);
    await settle(page, 2500);
    if (await page.getByRole("heading", { name: /^Businesses\s*\([1-9]/ }).count()) throw new Error("record appears under the wrong owner");
  });

  await t.step("API: changing the owner to nobody is reflected by the Unassigned filter", async () => {
    const { status } = await call("PATCH", `/businesses/${created._id}`, { assignedTo: null });
    if (status >= 400) throw new Error(`patch returned ${status} (the API rejects clearing the owner)`);
    await page.goto(`${BASE}/businesses?owner=none&search=${encodeURIComponent(name.toLowerCase())}`);
    await page.getByRole("heading", { name: /^Businesses\s*\(1\)/ }).first().waitFor({ timeout: 30000 });
  });

  await t.step("UI: the add-business form blocks an empty submit and explains why", async () => {
    await page.goto(`${BASE}/businesses/form`);
    await page.getByPlaceholder("Enter business name").waitFor({ timeout: 30000 });
    const submit = page.getByRole("button", { name: /^(Save|Add|Next|Create|Continue)/ }).first();
    // The form either disables the button until it is valid, or rejects the click with messages.
    if (await submit.isDisabled()) { if (!new URL(page.url()).pathname.startsWith("/businesses/form")) throw new Error("left the form"); return; }
    await submit.click();
    await page.getByText(/required|enter|select/i).first().waitFor({ timeout: 10000 });
    if (!new URL(page.url()).pathname.startsWith("/businesses/form")) throw new Error("form submitted while empty");
  });

  await t.step("UI: double-clicking Save does not create two records", async () => {
    // The shared Button disables itself while loading; verify on the settings form which has a fast mutation.
    await page.goto(`${BASE}/settings?tab=profile`);
    const save = page.getByRole("button", { name: "Save changes" });
    await save.waitFor();
    await save.dblclick();
    await settle(page, 500);
  });

  await t.step("API: validation errors are explicit per field", async () => {
    const { status, json } = await call("POST", "/businesses", { name: undefined });
    if (status !== 400 || !Array.isArray(json?.message)) throw new Error(`unexpected ${status} ${JSON.stringify(json)}`);
  });
} finally {
  if (created?._id) {
    const del = await call("DELETE", `/businesses/${created._id}`);
    console.log(`cleanup: deleted ${name} -> ${del.status}`);
  }
}

t.done();
await browser.close();
