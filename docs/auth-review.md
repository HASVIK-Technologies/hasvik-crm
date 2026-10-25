# Authentication review

Scope: login form, auth APIs, Axios interceptors, Zustand auth state, React Query session lifecycle/caches, AppShell route gating, background refresh, logout, cross-tab behavior, and locally saved business drafts.

## Findings and fixes

| Finding | Implemented change |
| --- | --- |
| Opening `/` never restored the cookie session because session queries were disabled on public pages. | Bootstrap runs on the login route and protected routes. A valid session redirects to the workspace after identity verification. Public signup/exploration remain public. |
| A logged-in visitor could see the login form before restoration finished. | A restoration screen is shown until bootstrap resolves; authenticated visitors redirect without showing a login form. |
| Concurrent resource 401s each rotated the refresh cookie independently. | A single refresh promise is shared within the tab. |
| Scheduled refresh and interceptor refresh could race. | Both use the same session controller. |
| A late 401 from a previously used token started another refresh. | The interceptor retries once with the newer token already in memory. |
| Login, refresh, and logout used the same intercepted client, allowing recursive refresh and auth-error toast cascades. | Lifecycle requests use a separate credentialed Axios transport. |
| Network failures, timeouts, 429s, and server errors during refresh logged users out. | Temporary failures preserve local auth. Background refresh retries after 30 seconds; foreground failures remain actionable errors. Only confirmed auth rejection or a failed authenticated retry ends the session. |
| A transient `/auth/me` failure caused AppShell to clear auth and redirect. | Startup failures offer retry/sign-in options. Existing authenticated sessions are not cleared merely because a session query failed. |
| Every token was assigned a fresh 15-minute lifetime, irrespective of JWT expiry. | Refresh scheduling reads `exp` when present; opaque tokens retain the prior fallback lifetime. This decoding is only for scheduling, never authorization. |
| Short-lived tokens can fall entirely inside the one-minute refresh buffer. | The refresh delay caps the buffer to half the remaining lifetime, avoiding rapid refresh loops. |
| Sleep/background-tab timer throttling could leave expired tokens in memory. | Focus, visibility, and online events trigger a refresh when needed; protected-request 401 recovery remains available. |
| A delayed refresh could write a token after logout or account switching. | Session versions and cancellation reject outdated refresh completions. |
| Responses from an old account could populate caches after a new session began. | Requests are tagged with their session version; stale responses/retries are canceled. |
| Logout cleared auth only after its server request settled. | Local auth is cleared and refresh stopped immediately, before calling logout. |
| Logout failures and in-flight request errors could show error toasts. | Logout transport is silent, errors are contained, existing toasts are dismissed, and auth-transition/login screens do not render protected-request notifications. |
| Logout could trigger its own 401 refresh and revive a session. | Logout bypasses refresh interceptors. If revocation needs a fresh bearer, one silent renewal is used only for the logout request and never written to auth state. Explicit logout blocks restoration; a token-free sessionStorage flag preserves that intent across reloads in the same tab. |
| A hung logout delayed completion for the full API timeout. | Logout has an eight-second timeout and always completes locally. Sign-in is held until this finishes to avoid overlapping logout/login cookie changes. |
| Logout removed only `auth` query entries, leaving other account data cached. | Queries are canceled and removed across session changes; logout clears the entire QueryClient cache. |
| Authentication could be reported complete before `/auth/me` succeeded. | Login/bootstrap commit token and verified identity together. Failed verification never commits an authenticated user. |
| A session query could cache the token captured before `/auth/me` refreshed it. | Restoration returns the latest token from the store after user verification. |
| Auth state and refresh-cookie rotation were uncoordinated across tabs. | Token-free login/logout notifications synchronize tabs. Web Locks serialize cookie-changing lifecycle requests where available; storage events provide a notification fallback. |
| A refresh cookie changed by another tab could produce another account's token while leaving the previous user/tenant/role and cached data in place. | Refresh verifies `/auth/me` before applying a token to an existing session. Account, tenant, or role changes trigger a clean session restoration and cache boundary. |
| Failed login could produce a global toast plus an inline error. | Login failures render inline, with a generic incorrect-credentials message for login 401. |
| Repeated login submission could start competing authentication attempts. | The form checks pending state; version guards prevent superseded attempts from committing state. Login mutation garbage collection is immediate after observers detach. |
| Business form draft keys were shared across accounts. | Draft keys include the verified user ID. Legacy unscoped drafts are not restored. |

Access tokens remain in memory. No access/refresh token is stored in localStorage or sessionStorage. The sessionStorage logout flag and cross-tab messages contain no credentials. The refresh cookie remains owned by the backend.

## Verification

Automated coverage exercises shared refresh, simultaneous and late 401s, one-retry limits, silent auth verification, permission errors, temporary refresh failure, blocked restoration, stale response/refresh cancellation, JWT expiry, short token lifetimes, fresh-entry restoration, verified identity commits, and restoration during logout. See the completion report for final test/lint/build results.

Authenticated browser flows and real cookie rotation/revocation require a browser session and were not verified against the deployed backend here.

## Backend conditions that remain to verify

- The backend must set and persist its refresh cookie with suitable `HttpOnly`, `Secure`, `SameSite`, `Path`, domain, and expiry attributes for the deployed same-origin `/api/auth/*` proxy. Frontend code cannot repair rejected or session-only backend cookies.
- Cookie rotation, reuse detection, logout revocation, inactive-account rejection, and role/tenant authorization must be enforced server-side. UI gating is not an authorization boundary.
- If the server cannot be reached during logout, local access still ends; server-side revocation cannot be guaranteed until the backend receives the request. The local signed-out flag is a UX safeguard, not credential revocation.
- Web Locks are a best-effort browser enhancement. Without them, refresh is coordinated within each tab, but backend rotation should tolerate legitimate concurrent browser requests.
- The backend's `SameSite`/Origin/CSRF policy for cookie-bearing refresh/logout endpoints must be checked server-side; it is not visible in this repository.

Review references: [Axios interceptors](https://axios-http.com/docs/interceptors) and [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
