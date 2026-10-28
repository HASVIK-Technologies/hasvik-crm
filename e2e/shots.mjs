// Screenshot every screen at phone and desktop sizes.
// Usage: E2E_EMAIL=.. E2E_PASSWORD=.. node e2e/shots.mjs <outDir> [baseUrl] [theme]
import { chromium } from "playwright";

const [, , outDir, base = "http://localhost:3100", theme = "light"] = process.argv;
const routes = (process.env.E2E_ROUTES ??
  "/dashboard,/businesses,/businesses/form,/follow-ups,/users,/business-categories,/subscriptions,/tenant-management,/profile")
  .split(",");
const sizes = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };

const browser = await chromium.launch();
for (const [name, vp] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: name === "phone", hasTouch: name === "phone" });
  await ctx.addInitScript((t) => { try { localStorage.setItem("hasvik-theme", t); } catch {} }, theme);
  const page = await ctx.newPage();
  await page.goto(base + "/");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${name}-login.png` });
  await page.fill("input[type=email],input[name=email]", process.env.E2E_EMAIL);
  await page.fill("input[type=password]", process.env.E2E_PASSWORD);
  await page.keyboard.press("Enter");
  await page.waitForURL(/dashboard|subscriptions|businesses/, { timeout: 30000 }).catch(() => {});
  for (const r of routes) {
    await page.goto(base + r);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/${name}${r.replace(/[\/?=&]/g, "_")}.png` });
  }
  await ctx.close();
}
await browser.close();
