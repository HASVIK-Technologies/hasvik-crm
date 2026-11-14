/**
 * Where to send someone right after they sign in.
 *
 * A workspace admin who has just finished signing up goes to Subscriptions to activate the Free plan;
 * everyone else lands on the dashboard. Pure on purpose, so the rule can be tested without a browser.
 */
export function getPostLoginPath(role: string, search: string): string {
  const welcome = new URLSearchParams(search).get("welcome");
  const returningFromSignup = welcome === "subscription" || welcome === "free";
  if (!returningFromSignup || role.trim().toUpperCase() !== "ADMIN") return "/dashboard";
  return welcome === "free" ? "/subscriptions?welcome=free" : "/subscriptions";
}
