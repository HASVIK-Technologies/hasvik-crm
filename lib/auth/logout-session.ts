// An expired bearer token may need renewal solely to revoke the server session.
// The renewed token is never committed to client auth state.
export async function revokeSession(deps: {
  token?: string | null;
  logout: (token?: string | null) => Promise<void>;
  refresh: () => Promise<string>;
  isUnauthorized: (error: unknown) => boolean;
}) {
  try { await deps.logout(deps.token); }
  catch (error) {
    if (!deps.isUnauthorized(error)) throw error;
    const token = await deps.refresh();
    await deps.logout(token);
  }
}
