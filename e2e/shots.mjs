// Screenshot every screen at phone and desktop sizes.
// Usage: E2E_EMAIL=.. E2E_PASSWORD=.. node e2e/shots.mjs <outDir> [baseUrl] [theme]
import { launch, login, settle } from "./helpers.mjs";

const [, , outDir, base = "http://localhost:3100", theme = "light"] = process.argv;
const routes = (process.env.E2E_ROUTES ??
  "/dashboard,/businesses,/businesses/form,/follow-ups,/reports,/forecast,/audit-logs,/users,/business-categories,/subscriptions,/tenant-management,/settings")
  .split(",");

for (const size of ["phone", "desktop"]) {
  const { browser, page } = await launch(size, { theme });
  await page.goto(base + "/");
  await settle(page, 800);
  await page.screenshot({ path: `${outDir}/${size}-login.png` });
  await login(page);
  for (const route of routes) {
    await page.goto(base + route);
    await settle(page, 1200);
    if (new URL(page.url()).pathname === "/") throw new Error(`${route}: signed out while taking screenshots`);
    await page.screenshot({ path: `${outDir}/${size}${route.replace(/[\/?=&]/g, "_")}.png` });
  }
  await browser.close();
}
