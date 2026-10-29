/** Lower-case, trimmed and without accents, so "Āgra" and "agra" compare equal. */
export function fold(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const hasAccent = (value: string) => value.normalize("NFD") !== value || /[^\x00-\x7F]/.test(value);

/**
 * City lists from public sources contain the same place spelt with and without accents ("Agra", "Āgra").
 * Keep one entry per place, preferring the plain spelling, sorted A to Z.
 */
export function cleanCities(names: readonly string[]): string[] {
  const best = new Map<string, string>();
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const key = fold(name);
    const current = best.get(key);
    if (!current || (hasAccent(current) && !hasAccent(name))) best.set(key, name);
  }
  return [...best.values()].sort((a, b) => a.localeCompare(b, "en-IN", { sensitivity: "base" }));
}

// Older or alternative names the postal service still returns.
const STATE_ALIASES: Record<string, string> = {
  orissa: "odisha",
  pondicherry: "puducherry",
  "andaman & nicobar islands": "andaman and nicobar islands",
  "jammu & kashmir": "jammu and kashmir",
  "dadra & nagar haveli": "dadra and nagar haveli and daman and diu",
  "daman & diu": "dadra and nagar haveli and daman and diu",
  "dadra and nagar haveli": "dadra and nagar haveli and daman and diu",
  "daman and diu": "dadra and nagar haveli and daman and diu",
  "nct of delhi": "delhi",
};

/** The state name exactly as it appears in `options`, or "" when there is no match. */
export function matchState(name: string, options: readonly string[]): string {
  const wanted = STATE_ALIASES[fold(name)] ?? fold(name);
  return options.find((option) => fold(option) === wanted) ?? "";
}

/** Distinct, tidy area names from a postal lookup, e.g. ["Ballia", "Ballia City"]. */
export function areaNames(names: readonly string[]): string[] {
  return cleanCities(names.map((name) => name.replace(/\s*\(.*?\)\s*$/, "")));
}
