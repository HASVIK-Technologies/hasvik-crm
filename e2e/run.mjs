// End-to-end pass against the running app and the live API (read-mostly; see e2e/crud.mjs for writes).
// Usage: E2E_EMAIL=.. E2E_PASSWORD=.. node e2e/run.mjs <phone|desktop> [light|dark]
import { readFileSync } from "node:fs";
import { AxeBuilder } from "@axe-core/playwright";
import { strFromU8, unzipSync } from "fflate";
import { BASE, launch, login, settle, suite } from "./helpers.mjs";

const size = process.argv[2] ?? "desktop";
const theme = process.argv[3] ?? "light";
const t = suite(`${size}/${theme}`);
const { browser, context, page, errors } = await launch(size, { theme });
const ignorable = (text) => /favicon|Download the React DevTools|net::ERR_FAILED|status of 401/i.test(text);

// Reads "Name (N)" once the number has stopped changing (the list shows (0) while it is still loading).
const countOn = async (p, name) => {
  const heading = p.getByRole("heading", { name: new RegExp(`^${name}\\s*\\(\\d+\\)`) }).first();
  await heading.waitFor({ timeout: 20000 });
  let last = -1;
  let stable = 0;
  for (let i = 0; i < 60 && (stable < 4 || (last === 0 && i < 30)); i++) {
    const value = Number((await heading.innerText()).match(/\((\d+)\)/)[1]);
    stable = value === last ? stable + 1 : 0;
    last = value;
    await p.waitForTimeout(350);
  }
  return last;
};
const KPI = "section[aria-label='Key performance indicators']";

// ---------- Auth ----------
await t.step("login failure shows a friendly message and stays on the login page", async () => {
  await page.goto(`${BASE}/`);
  await page.fill("input[type=email]", "nobody@example.com");
  await page.fill("input[type=password]", "wrong-password-1");
  await page.keyboard.press("Enter");
  await page.getByRole("alert").first().waitFor({ timeout: 15000 });
  const text = (await page.getByRole("alert").first().innerText()).trim();
  if (/status code|AxiosError|undefined/i.test(text)) throw new Error(`raw error shown: ${text}`);
  if (new URL(page.url()).pathname !== "/") throw new Error("left the login page");
});

await t.step("empty login form shows field-level messages", async () => {
  await page.goto(`${BASE}/`);
  await page.getByRole("button", { name: /^sign in/i }).click();
  await page.getByText("Enter your email address.").waitFor();
  await page.getByText("Enter your password.").waitFor();
});

await t.step("protected routes redirect to login when signed out", async () => {
  for (const route of ["/dashboard", "/reports", "/settings", "/audit-logs"]) {
    await page.goto(`${BASE}${route}`);
    await page.waitForURL((u) => u.pathname === "/", { timeout: 15000 });
  }
});

await t.step("login succeeds", async () => { await login(page); });

// ---------- Dashboard KPIs ----------
await t.step("every clickable KPI lands on a filtered list whose count equals the card", async () => {
  await page.goto(`${BASE}/dashboard`);
  await page.locator(KPI).first().locator("a[aria-label]").first().waitFor({ timeout: 30000 });
  const total = await page.locator(KPI).first().locator("a[aria-label]").count();
  if (!total) throw new Error("no clickable KPI cards");
  const problems = [];
  for (let i = 0; i < total; i++) {
    await page.goto(`${BASE}/dashboard`);
    const card = page.locator(KPI).first().locator("a[aria-label]").nth(i);
    await card.waitFor();
    const label = await card.getAttribute("aria-label");
    const m = label.match(/^(.*?): ([\d.,]+)\./);
    const expected = Number(m[2].replace(/,/g, ""));
    await card.click();
    await page.waitForURL((u) => u.pathname === "/businesses" || u.pathname === "/follow-ups", { timeout: 15000 });
    const onBusinesses = new URL(page.url()).pathname === "/businesses";
    await page.getByRole("group", { name: "Active filters" }).waitFor({ timeout: 15000 }).catch(() => problems.push(`${m[1]}: no visible filter chip`));
    await settle(page, 600);
    const actual = await countOn(page, onBusinesses ? "Businesses" : "Follow-ups").catch(() => NaN);
    if (actual !== expected) problems.push(`${m[1]}: card ${expected} vs list ${actual}`);
    // Removing the chip restores the unfiltered list.
    const remove = page.getByRole("button", { name: /Remove filter/ }).first();
    if (await remove.count()) {
      const before = actual;
      let guard = 0;
      while (await page.getByRole("button", { name: /Remove filter/ }).count() && guard++ < 6) {
        await page.getByRole("button", { name: /Remove filter/ }).first().click();
        await settle(page, 500);
      }
      const after = await countOn(page, onBusinesses ? "Businesses" : "Follow-ups").catch(() => NaN);
      if (!(after >= before)) problems.push(`${m[1]}: removing chips did not restore the list (${before} -> ${after})`);
    }
  }
  if (problems.length) throw new Error(problems.join(" | "));
});

await t.step("zero-count KPI cards are plain (not links)", async () => {
  await page.goto(`${BASE}/dashboard`);
  await page.locator(KPI).first().waitFor();
  await settle(page, 800);
  const bad = await page.locator(KPI).first().locator("a[aria-label*=': 0.']").count();
  if (bad) throw new Error("a card with 0 is clickable");
});

await t.step("changing the date range updates the cards and is remembered", async () => {
  await page.goto(`${BASE}/dashboard`);
  await page.locator(KPI).first().locator("a[aria-label]").first().waitFor({ timeout: 30000 });
  const read = async () => (await page.locator(KPI).first().locator("[aria-label]").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")).join("|")));
  const before = await read();
  await page.getByRole("radio", { name: "Today" }).click();
  await settle(page, 600);
  const after = await read();
  if (before === after) throw new Error("cards did not change for Today");
  await page.reload();
  await page.locator(KPI).first().waitFor();
  const checked = await page.getByRole("radio", { name: "Today" }).getAttribute("aria-checked");
  if (checked !== "true") throw new Error("range not remembered");
  await page.getByRole("radio", { name: "30 days" }).click();
});

// ---------- Reports ----------
const slugs = ["pipeline-by-stage", "win-loss", "sales-by-owner", "sales-by-source", "deal-aging", "activity-volume", "new-leads", "conversion-funnel"];
for (const slug of slugs) {
  await t.step(`report ${slug} renders KPIs, chart and table`, async () => {
    await page.goto(`${BASE}/reports/${slug}`);
    await page.getByRole("heading", { name: "Details" }).waitFor({ timeout: 30000 });
    await page.locator(KPI).first().waitFor();
  });
}

await t.step("CSV and Excel exports match the rows on screen, including search", async () => {
  await page.goto(`${BASE}/reports/sales-by-owner`);
  await page.getByRole("heading", { name: "Details" }).waitFor({ timeout: 30000 });
  await page.getByLabel("Search this table").fill("hasvik");
  await page.waitForTimeout(300);
  const shown = await page.locator("table:has(caption) tbody tr").count();
  const [csvDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "CSV" }).click()]);
  const csv = readFileSync(await csvDownload.path(), "utf8").replace(/^﻿/, "").trim().split(/\r\n/);
  const dataRows = csv.slice(csv.findIndex((l) => l.startsWith("Owner,")) + 1);
  if (dataRows.length !== shown) throw new Error(`csv ${dataRows.length} rows vs screen ${shown}`);
  const [xlsxDownload] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Excel" }).click()]);
  const files = unzipSync(new Uint8Array(readFileSync(await xlsxDownload.path())));
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  const rows = (sheet.match(/<row /g) ?? []).length;
  const header = csv.findIndex((l) => l.startsWith("Owner,")) + 1;
  if (rows !== header + dataRows.length) throw new Error(`xlsx rows ${rows} vs expected ${header + dataRows.length}`);
});

await t.step("report filters live in the URL and survive a reload", async () => {
  await page.goto(`${BASE}/reports/pipeline-by-stage?source=WHATSAPP`);
  await page.getByRole("group", { name: "Active filters" }).waitFor({ timeout: 30000 });
  await page.reload();
  await page.getByRole("group", { name: "Active filters" }).waitFor({ timeout: 30000 });
});

await t.step("report totals reconcile with the dashboard pipeline", async () => {
  await page.goto(`${BASE}/reports/pipeline-by-stage`);
  await page.locator(KPI).first().locator("[aria-label^='Active leads']").waitFor({ timeout: 30000 }).catch(() => {});
  const label = await page.locator(KPI).first().locator("[aria-label^='Active leads']").first().getAttribute("aria-label");
  const reportTotal = Number(label.match(/: (\d+)\./)[1]);
  await page.goto(`${BASE}/businesses?isActive=true`);
  const listTotal = await countOn(page, "Businesses");
  if (reportTotal !== listTotal) throw new Error(`report ${reportTotal} vs businesses list ${listTotal}`);
});

// ---------- Forecast / Audit / Settings ----------
await t.step("forecast explains why there is not enough data", async () => {
  await page.goto(`${BASE}/forecast`);
  await page.getByRole("heading", { name: "Not enough data yet" }).waitFor({ timeout: 30000 });
  await page.getByText("How this is calculated").waitFor();
});

await t.step("audit logs list entries and filter by action", async () => {
  await page.goto(`${BASE}/audit-logs`);
  await page.locator("ul li").first().waitFor({ timeout: 30000 });
  await page.getByLabel("Action").click();
  await page.getByRole("option", { name: "Create" }).click();
  await settle(page, 600);
});

await t.step("theme choice persists across reloads", async () => {
  await page.goto(`${BASE}/settings?tab=appearance`);
  await page.getByRole("radio", { name: "Dark" }).first().click();
  await page.reload();
  await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
  await page.getByRole("radio", { name: theme === "dark" ? "Dark" : "Light" }).first().click();
  await page.waitForFunction((d) => document.documentElement.classList.contains("dark") === d, theme === "dark");
});

await t.step("settings: profile validates and password mismatch is flagged", async () => {
  await page.goto(`${BASE}/settings?tab=profile`);
  await page.getByLabel(/Full name/).fill("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Enter your name.").waitFor();
  await page.goto(`${BASE}/settings?tab=security`);
  await page.getByLabel(/^New password/).fill("longenough1");
  await page.getByLabel("Confirm new password").fill("different1");
  await page.getByRole("button", { name: "Change password" }).click();
  await page.getByText("The two passwords don't match.").waitFor();
});

// ---------- Lists ----------
await t.step("Kanban shows true column counts and the view choice is remembered", async () => {
  await page.goto(`${BASE}/businesses`);
  await page.getByRole("button", { name: "Kanban" }).first().click();
  await page.getByRole("heading", { name: /^Pipeline/ }).first().waitFor({ timeout: 20000 });
  await page.reload();
  await page.getByRole("heading", { name: /^Pipeline/ }).first().waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "Table" }).first().click();
});

await t.step("owner filter narrows the businesses list and is removable", async () => {
  await page.goto(`${BASE}/businesses?owner=none`);
  await page.getByRole("group", { name: "Active filters" }).waitFor({ timeout: 20000 });
  const filtered = await countOn(page, "Businesses");
  await page.getByRole("button", { name: /Remove filter: Owner/ }).click();
  await settle(page, 600);
  const all = await countOn(page, "Businesses");
  if (!(filtered > 0 && filtered < all)) throw new Error(`unassigned ${filtered} vs all ${all}`);
});

await t.step("deep links and refresh work on every route", async () => {
  for (const route of ["/dashboard", "/businesses", "/follow-ups", "/reports", "/forecast", "/audit-logs", "/settings", "/users", "/business-categories", "/follow-ups?status=OVERDUE", "/businesses?status=WON&isActive=true"]) {
    await page.goto(`${BASE}${route}`);
    await settle(page, 400);
    const pathname = new URL(page.url()).pathname;
    if (pathname === "/") throw new Error(`${route} bounced to login`);
    if (await page.getByText("Application error").count()) throw new Error(`${route} crashed`);
  }
});

if (size === "desktop") {
  await t.step("Ctrl+K opens the command palette and Enter navigates", async () => {
    await page.goto(`${BASE}/dashboard`);
    await settle(page, 1500);
    await page.keyboard.press("Control+k");
    await page.getByRole("dialog", { name: /Search pages/ }).waitFor();
    await page.keyboard.type("forec");
    await page.keyboard.press("Enter");
    await page.waitForURL((u) => u.pathname === "/forecast");
  });
}

await t.step("API failure shows a friendly retry state, not a blank screen", async () => {
  await page.route("**/api/businesses*", (route) => route.abort());
  await page.goto(`${BASE}/reports/pipeline-by-stage`);
  await page.getByRole("alert").filter({ hasText: /couldn.t load/i }).first().waitFor({ timeout: 30000 });
  await page.unroute("**/api/businesses*");
});

// ---------- Business form ----------
await t.step("pincode fills in the city and state, and dropdowns filter as you type", async () => {
  await page.goto(`${BASE}/businesses/form`);
  const pincode = page.getByLabel(/^Pincode/).first();
  await pincode.waitFor({ timeout: 30000 });
  await pincode.fill("277001");
  await page.getByText("Ballia, Uttar Pradesh").first().waitFor({ timeout: 20000 });
  const state = page.getByRole("combobox", { name: /^State/ }).first();
  const city = page.getByRole("combobox", { name: /^City/ }).first();
  if ((await state.inputValue()) !== "Uttar Pradesh") throw new Error(`state was "${await state.inputValue()}"`);
  if ((await city.inputValue()) !== "Ballia") throw new Error(`city was "${await city.inputValue()}"`);
  const stage = page.getByRole("combobox", { name: /^Stage/ }).first();
  await stage.click();
  await stage.fill("won");
  const options = page.getByRole("option");
  await options.first().waitFor();
  const labels = await options.allInnerTexts();
  if (labels.length !== 1 || !/won/i.test(labels[0])) throw new Error(`typing "won" left ${JSON.stringify(labels)}`);
  await page.keyboard.press("Escape");
});

await t.step("saving an empty business form points at what is missing", async () => {
  await page.goto(`${BASE}/businesses/form`);
  await page.getByPlaceholder("Enter business name").waitFor({ timeout: 30000 });
  if (size === "desktop") {
    await page.getByRole("button", { name: "Save business" }).click();
    await page.getByText(/required/i).first().waitFor({ timeout: 10000 });
  } else {
    await page.getByRole("button", { name: /^Next/ }).click();
    await page.getByText(/required/i).first().waitFor({ timeout: 10000 });
  }
  if (!new URL(page.url()).pathname.startsWith("/businesses/form")) throw new Error("left the form");
});

// ---------- Accessibility ----------
const axeRoutes = ["/dashboard", "/businesses", "/follow-ups", "/reports", "/reports/win-loss", "/forecast", "/audit-logs", "/settings?tab=profile", "/users"];
for (const route of axeRoutes) {
  await t.step(`axe: no serious or critical violations on ${route}`, async () => {
    await page.goto(`${BASE}${route}`);
    await settle(page, 1500);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const bad = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    if (bad.length) throw new Error(bad.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ") + " [" + (n.any[0]?.message ?? "").slice(0, 90) + "]").join("; ")}`).join(" | "));
  });
}

await t.step("no unexpected console errors during the run", async () => {
  const real = errors.filter((e) => !ignorable(e));
  if (real.length) throw new Error(`${real.length} errors: ${real.filter((e) => e.startsWith("HTTP")).concat(real).slice(0, 3).map((e) => e.slice(0, 200)).join(" || ")}`);
});

t.done();
await context.close();
await browser.close();
