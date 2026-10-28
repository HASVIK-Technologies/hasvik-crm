# CRM redesign (RefactorV2): design system, contract audit and test notes

Source of truth for the backend is the live Swagger spec (`/swagger-json`). Behaviour below was also checked against the
running API with read calls and `ZZ-TEST` records that were deleted afterwards.

## Design system

Tokens live in `app/globals.css` (`:root` and `html.dark`) and are exposed to Tailwind (`bg-brand-soft`, `text-ink`,
`border-line`, `text-muted` ...). Components never contain a raw colour. shadcn/ui names used by `components/ui` are
mapped onto the same tokens, so both worlds share one palette.

Deliberate deviation from the HASVIK People values: `--brand-strong` is `#0669b9` (was `#0876d1`) and `--ok` /
`--accent-strong` are `#11772a` (was `#158a30`). The originals measure 4.1:1 and 3.9:1 on the soft tints used for badges
and active items, which fails WCAG AA; the darker shades reach 4.6:1 and above. In dark mode `--btn` is `#0a74c9`
(was `#0b7fd9`, 4.15:1 with white text). Every other brand colour is unchanged. The only hex outside the stylesheet is
`lib/shared/brand.ts`, used for the browser `theme-color` and PWA manifest, which cannot read CSS variables.

Shared building blocks (same folder convention as before):

| Need | Component |
| --- | --- |
| Buttons with loading state | `components/ui/button.tsx` (`loading` prop), `components/common/PrimaryButton` etc. |
| Clickable KPI card | `components/common/StatCard.tsx`, `KpiCards.tsx` |
| Bottom sheet / modal | `components/common/BottomSheet.tsx` |
| Charts (token colours, text alternative) | `BarList`, `ColumnChart`, `TrendChart`, `ChartFrame` |
| Filter chips, date range | `ActiveFilterChips`, `DateRangeControl`, `FilterSelect` |
| Theme | `ThemeToggle`, `hooks/use-theme.ts` |
| Command palette (Ctrl/Cmd+K) | `components/common/CommandPalette.tsx` |

## Dashboard, filters and reconciliation

KPI cards link to lists filtered through the URL. The businesses API cannot filter by owner, date or staleness, so
`lib/analytics/lead-filters.ts` applies those client-side and `app/businesses/page.tsx` shows each as a removable chip.
The same pure functions produce the card number and the list, so they reconcile by construction; `e2e/run.mjs` also
checks it in the browser for every card.

## Contract audit (frontend vs backend)

| Finding | Fix |
| --- | --- |
| Create form collected `description` but never sent it | Sent as `description` |
| `leadSource` (optional in the DTO) had no control | "Lead source" field with suggestions on create and edit, included in the PATCH diff |
| Create sent `status`, which the endpoint ignores (new leads are always `NEW`) | Removed from POST; a different chosen stage is applied with a follow-up PATCH |
| Create sent `latitude` / `longitude`, not in the DTO | Removed from the payload type |
| Edit form fell back to status `"Active"`, not a valid enum value | Falls back to `NEW` |
| Validation errors arrive as `message: string[]`; the client showed a generic "request was invalid" | `getApiErrorMessage` joins them; `getApiFieldErrors` maps each to its field |
| Owner wording varied ("Responsible person", "Assignee") | "Owner" on records, "Assign to" on the action. The spec only has `assignedTo` (no supervisor concept) |
| Owner filter was sent to `GET /businesses` as `assignedTo`, which the API ignores | Owner filtering done client-side (see above) |

## Backend issues to raise

| Endpoint | Expected | Actual |
| --- | --- | --- |
| `GET /api/businesses` | Filter by owner (`assignedTo`), `leadSource`, created/updated date range | Parameters are ignored; all 63+ rows are returned |
| `GET /api/businesses`, `/follow-ups` | `limit` is a page size | `limit=100` and `limit=500` both return every record |
| `GET /api/businesses?page=0` | 400 validation error | 500 Internal server error |
| `POST /api/auth/login` | 200 per spec | 201 |
| `POST /api/businesses` | `phoneNumbers[].name` required per spec | Accepted without it; unknown fields (`status`, `latitude`) silently ignored |
| `GET /api/businesses` items | Spec names `assignedTo` | Response carries `assignee: { _id, fullName }` |
| `DELETE /api/businesses/{id}` | Delete | Soft delete only (`isActive: false`); records stay searchable, so `ZZ-TEST` data cannot be purged |
| All endpoints | Response body schemas in the spec | Only status codes are documented |
| Users / password | Change password with current password | `PATCH /users/{id}` accepts a new password without checking the old one |
| Profile photo | Upload endpoint | None |
| Notifications, pipeline stages, lead-source list, quotas | Settings endpoints | None (stages are a fixed enum, `leadSource` is free text) |
| Deals | Value, close date, stage history | None. Leads have no monetary value and no close date; the forecast uses `updatedAt` of won leads |
| Aggregates | `GET /dashboard`, `/reports/*` returning counts by stage, owner, source and period | Computed client-side from the full lists today |

## Reports

Built (8): pipeline by stage, win/loss and win rate, sales by owner, leads by source, lead aging and stale leads,
activity volume per owner, new leads over time, conversion funnel. All come from businesses and follow-ups. Not built:
anything involving revenue or deal value (no such field exists).

Exports are CSV (RFC 4180, BOM, formula-neutralised) and a real `.xlsx` workbook generated in the browser with `fflate`.
They contain exactly the rows visible after search and sort, with the report, period and active filters in a header block.
Print / save as PDF uses the browser print dialog with the app chrome hidden.

## Forecast

Count-based because leads carry no value. Needs at least 6 months of history and 20 closed leads, otherwise it shows
"Not enough data yet" and what is missing. Weighted view = open leads x overall win rate, placed in the month of the next
scheduled follow-up (per-stage win rates cannot be derived: the API keeps no stage history). Trend view = linear fit over
the last 12 complete months with an ~80% band that widens with distance. Seasonality needs two years of data and is never
applied. Pure logic is in `lib/forecast/model.ts` with tests in `tests/forecast.test.ts`.

## Running the checks

```
npm run lint && npx tsc --noEmit && npm test && npm run build
E2E_EMAIL=... E2E_PASSWORD=... node e2e/run.mjs desktop light   # also: phone, dark
E2E_EMAIL=... E2E_PASSWORD=... node e2e/crud.mjs desktop
```

Credentials come from the environment (or the git-ignored `.env.local`); none are committed.
