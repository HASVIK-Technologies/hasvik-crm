// Every list page: tapping a KPI card filters the list, tapping it again clears the filter.
// Usage: E2E_EMAIL=.. E2E_PASSWORD=.. node e2e/kpis.mjs <phone|desktop> [screenshot-dir]
import { BASE, launch, login, settle, suite } from "./helpers.mjs";
const size = process.argv[2], out = process.argv[3];
const t = suite(`kpis/${size}`);
const { browser, page } = await launch(size);
await login(page);
for (const path of ["/businesses", "/follow-ups", "/users", "/tenant-management", "/business-categories"]) {
  await t.step(`${path}: a KPI card filters and toggles back`, async () => {
      await page.goto(`${BASE}${path}`);
      const cards = page.locator('section[aria-label="Key performance indicators"] button[aria-label$="Tap to filter"]');
      await cards.first().waitFor({ timeout: 30000 });
      await settle(page, 1200);
      const n = await cards.count();
      const card = cards.nth(n - 1);
      const label = (await card.getAttribute("aria-label")).split(":")[0];
      const before = await card.getAttribute("aria-pressed");
      await card.click();
      await page.waitForFunction(([l, b]) => [...document.querySelectorAll('section[aria-label="Key performance indicators"] button')].find((x) => x.getAttribute("aria-label")?.startsWith(l + ":"))?.getAttribute("aria-pressed") !== b, [label, before], { timeout: 10000 });
      await settle(page, 1200);
      if (out) await page.screenshot({ path: `${out}/${size}-kpi${path.replace(/\//g, "-")}.png` });
      const card2 = page.locator(`section[aria-label="Key performance indicators"] button[aria-label^="${label}:"]`);
      await card2.click();
      await page.waitForFunction(([l, b]) => [...document.querySelectorAll('section[aria-label="Key performance indicators"] button')].find((x) => x.getAttribute("aria-label")?.startsWith(l + ":"))?.getAttribute("aria-pressed") === b, [label, before], { timeout: 10000 });
  });
}
t.done();
await browser.close();
