// Focused checks for the business form: pincode lookup, typeahead dropdowns, footer behaviour.
// Usage: E2E_EMAIL=.. E2E_PASSWORD=.. node e2e/form.mjs <phone|desktop> [screenshot-dir]
import { BASE, launch, login, settle, suite } from "./helpers.mjs";

const size = process.argv[2] ?? "desktop";
const shots = process.argv[3];
const t = suite(`form/${size}`);
const { browser, page } = await launch(size);
await login(page);

await t.step("pincode fills in the city and state", async () => {
  await page.goto(`${BASE}/businesses/form`);
  const pincode = page.getByLabel(/^Pincode/).first();
  await pincode.waitFor({ timeout: 30000 });
  await pincode.fill("277001");
  await page.getByText("Ballia, Uttar Pradesh").first().waitFor({ timeout: 20000 });
  const state = page.getByRole("combobox", { name: /^State/ }).first();
  const city = page.getByRole("combobox", { name: /^City/ }).first();
  if ((await state.inputValue()) !== "Uttar Pradesh") throw new Error(`state was "${await state.inputValue()}"`);
  if ((await city.inputValue()) !== "Ballia") throw new Error(`city was "${await city.inputValue()}"`);
  if (shots) await page.screenshot({ path: `${shots}/${size}-form-pincode.png` });
});

await t.step("the city list offers the pincode's areas and the state's cities", async () => {
  const city = page.getByRole("combobox", { name: /^City/ }).first();
  await city.click();
  await city.fill("bal");
  await page.getByRole("option").first().waitFor({ timeout: 20000 });
  const labels = await page.getByRole("option").allInnerTexts();
  if (!labels.some((label) => /Ballia/.test(label))) throw new Error(`no Ballia in ${JSON.stringify(labels.slice(0, 6))}`);
  if (shots) await page.screenshot({ path: `${shots}/${size}-form-city.png` });
  await page.keyboard.press("Escape");
});

await t.step("typing in Stage narrows the list", async () => {
  const stage = page.getByRole("combobox", { name: /^Stage/ }).first();
  await stage.click();
  await stage.fill("won");
  await page.getByRole("option").first().waitFor();
  const labels = await page.getByRole("option").allInnerTexts();
  if (labels.length !== 1 || !/won/i.test(labels[0])) throw new Error(`typing "won" left ${JSON.stringify(labels)}`);
  await page.keyboard.press("Escape");
});

await t.step("saving an empty form points at what is missing", async () => {
  await page.goto(`${BASE}/businesses/form`);
  await page.getByPlaceholder("Enter business name").waitFor({ timeout: 30000 });
  await settle(page, 500);
  const button = page.getByRole("button", { name: size === "desktop" ? "Save business" : /^Next/ }).first();
  if (await button.isEnabled()) throw new Error("the button is enabled on an empty form");
  await page.getByText(/^Still needed: Business name/).first().waitFor({ timeout: 10000 });
  if (!new URL(page.url()).pathname.startsWith("/businesses/form")) throw new Error("left the form");
  if (shots) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${shots}/${size}-form-footer.png` });
  }
});

await t.step("the button turns on once every required field is filled", async () => {
  if (size !== "desktop") return; // the phone wizard is covered by the Next check above
  await page.getByPlaceholder("Enter business name").fill("ZZ-TEST form gate (not saved)");
  const category = page.getByRole("combobox", { name: /^Category/ }).first();
  await category.click();
  await page.getByRole("option").first().click();
  await page.getByPlaceholder("Enter complete address").fill("1 Test Road");
  await page.getByLabel(/^Pincode/).first().fill("277001");
  await page.getByText("Ballia, Uttar Pradesh").first().waitFor({ timeout: 20000 });
  await page.getByPlaceholder("Mobile number").first().fill("9876543210");
  const button = page.getByRole("button", { name: "Save business" }).first();
  await page.waitForFunction((el) => !el.disabled, await button.elementHandle(), { timeout: 10000 });
  if (shots) await page.screenshot({ path: `${shots}/${size}-form-ready.png` });
});

t.done();
await browser.close();
