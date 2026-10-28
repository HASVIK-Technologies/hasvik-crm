// Shared helpers for the Playwright scripts in this folder.
import { chromium } from "playwright";

export const BASE = process.env.E2E_BASE ?? "http://localhost:3100";
export const SIZES = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };

export async function launch(sizeName, { theme = "light" } = {}) {
  const browser = await chromium.launch();
  const vp = SIZES[sizeName];
  const context = await browser.newContext({ viewport: vp, isMobile: sizeName === "phone", hasTouch: sizeName === "phone" });
  await context.addInitScript((t) => { try { if (!sessionStorage.getItem("e2e-theme-set")) { localStorage.setItem("hasvik-theme", t); sessionStorage.setItem("e2e-theme-set", "1"); } } catch {} }, theme);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  return { browser, context, page, errors };
}

export async function login(page, email = process.env.E2E_EMAIL, password = process.env.E2E_PASSWORD) {
  await page.goto(`${BASE}/`);
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", password);
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/(dashboard|subscriptions|businesses)/, { timeout: 30000 });
}

export async function settle(page, ms = 1000) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

/** Tiny test runner: records pass/fail per named step and prints a summary. */
export function suite(name) {
  const results = [];
  return {
    async step(title, fn) {
      try { await fn(); results.push({ title, ok: true }); console.log(`  ok   ${title}`); }
      catch (error) { results.push({ title, ok: false, error: String(error?.message ?? error).split("\n")[0] }); console.log(`  FAIL ${title}\n       ${String(error?.message ?? error).split("\n")[0]}`); }
    },
    done() {
      const failed = results.filter((r) => !r.ok);
      console.log(`${name}: ${results.length - failed.length}/${results.length} passed`);
      if (failed.length) process.exitCode = 1;
      return results;
    },
  };
}
