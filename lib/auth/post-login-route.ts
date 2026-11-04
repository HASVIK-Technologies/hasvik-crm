/**
 * Where to send someone right after they sign in.
 *
 * A workspace admin who has just finished signing up (`?welcome=subscription`) goes straight to Subscriptions to pick
 * a plan; everyone else lands on the dashboard. Pure on purpose, so the rule can be tested without a browser.
 */
export function getPostLoginPath(role: string, search: string): string {
  const returningFromSignup = new URLSearchParams(search).get("welcome") === "subscription";
  return returningFromSignup && role.trim().toUpperCase() === "ADMIN" ? "/subscriptions" : "/dashboard";
}
