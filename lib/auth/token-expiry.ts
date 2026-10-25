export function tokenExpiresAt(token: string, now = Date.now()): number {
  try {
    const encoded = token.split(".")[1];
    const payload = JSON.parse(atob(encoded.replaceAll("-", "+").replaceAll("_", "/"))) as { exp?: unknown };
    if (typeof payload.exp === "number" && Number.isFinite(payload.exp) && payload.exp > 0) return payload.exp * 1000;
  } catch { /* Opaque tokens use the existing fallback lifetime. */ }
  return now + 15 * 60 * 1000;
}

export function tokenRefreshDelay(expiresAt: number, now = Date.now()): number {
  const remaining = expiresAt - now;
  // A short-lived token must not refresh every second just because its entire
  // lifetime is smaller than the normal one-minute refresh buffer.
  return Math.max(1000, remaining - Math.min(60_000, Math.max(0, remaining / 2)));
}
