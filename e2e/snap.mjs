// Ad-hoc screenshot of one route after an optional click: node e2e/snap.mjs <size> <route> <out.png> [clickText] [theme]
import { launch, login, settle, BASE } from "./helpers.mjs";

const [, , size, route, out, clickText, theme = "light"] = process.argv;
const { browser, page } = await launch(size, { theme });
await login(page);
await page.goto(BASE + route);
await settle(page);
if (clickText) {
  await page.getByRole("button", { name: clickText }).first().click();
  await settle(page, 1500);
}
await page.screenshot({ path: out, fullPage: false });
await browser.close();
