# Role dashboards

The dashboard is the default authenticated landing page and is available in desktop and mobile navigation. The signup subscription redirect is preserved. Existing subscription and route access gates still apply.

| Role | Main decisions | Sections |
| --- | --- | --- |
| SUPERADMIN | Review workspace access and subscriptions | Active/inactive tenant totals, active user total, pending subscriptions, active tenant directory preview, current subscriptions, next-seven-day renewals |
| ADMIN | Review workspace sales and access | Follow-up KPIs, current sales pipeline and closed-opportunity win rate, overdue work, today's agenda, upcoming follow-ups, active users, tenant subscriptions |
| MANAGER | Spot bottlenecks and balance work | Follow-up KPIs, workspace pipeline, overdue work, today's agenda, upcoming follow-ups, workload by assignee |
| SALES | Prioritize customer conversations | Personal follow-up KPIs, overdue work, today's agenda, upcoming follow-ups, links to business context and new leads |
| USER | Complete assigned work | Personal follow-up KPIs, overdue work, today's agenda, upcoming follow-ups, workspace/profile links |

## Visual design by role

The dashboard starts with a white header card with comfortable padding around the title, refresh mode selector and primary Refresh action. All dashboard cards and nested content tiles have zero border radius. KPI cards retain the standard compact layout used on other list pages, with fully colored backgrounds, contrasting left borders, white text and translucent icon tiles. Refresh uses the shared green primary button. Main content panels in the left column have white headers and bodies with small colored icon accents. Right-column panels use full vivid Hasvik blue, green and cyan backgrounds with white titles and secondary text, translucent dividers and matching links. The same surfaces are retained when columns stack on small screens. Rose identifies overdue work; amber identifies subscription requests and renewals. Queue icons distinguish calls, meetings, email and WhatsApp without relying on color alone. Loading, empty and error states adapt to their panel's surface.

Main card gutters are consistently 16px vertically and horizontally, including the toolbar, KPI grid and both content columns. Nested summary tiles use 12px gutters.

Subscription colors are defined once in `lib/subscriptions/status.ts` and used by dashboard status facts, request badges, workspace subscription badges, subscription list badges/notices/filter options, and the shared status badge component.

| Subscription status | Color | Meaning |
| --- | --- | --- |
| Active | Emerald green | Current access |
| Pending | Amber | Awaiting review |
| Expired | Red | Ended access |
| Suspended | Orange | Access on hold |
| Cancelled | Slate | Cancelled lifecycle state |
| Rejected | Rose | Request declined |

Status dots and edge accents stay distinct even at zero; counts themselves remain neutral. Labels accompany colors, with light surfaces/dark text for badges and softer accents against colored cards. Unknown status values have a neutral fallback.

- SUPERADMIN: white subscription requests with an amber icon, white tenant directory, blue subscription health with translucent content tiles, green renewals, and cyan administration panel.
- ADMIN: blue pipeline with colored summary tiles and stage bars, green access information, rose overdue work and cyan upcoming tasks.
- MANAGER: blue pipeline, colored assignee initials and matching workload bars, green agenda and cyan upcoming work.
- SALES: rose overdue panel, green agenda, cyan upcoming tasks and blue/green customer action tiles.
- USER: green agenda, rose overdue tasks, cyan upcoming work and light blue workspace guidance.

Decorations contain no simulated charts or metrics. Focus outlines remain visible, and decorative movement respects reduced-motion preferences. On narrow screens, headings and content columns stack, while action tiles can occupy a single column.

## Data contracts and boundaries

Verified against the deployed [Swagger specification](https://crm-backend-three-phi.vercel.app/swagger-json).

- `GET /businesses`: six status-filtered requests with `page=1`, `limit=1`, `isActive=true`; chart uses server `total`, never the size of the returned page. Win rate is won / (won + lost); no closed opportunities displays an em dash.
- `GET /follow-ups/kpis`: workspace scope for ADMIN/MANAGER; `assignedTo` set to the authenticated user's ID for SALES/USER. This summary covers all dates.
- `GET /follow-ups`: today's date window, overdue status, and scheduled work for the next seven calendar days. Today/upcoming/overdue requests use page 1 and limit 5; queues display at most five rows with the full server count when truncated. Rows include channel, city, assignee and a note preview where provided. Sorting applies to the returned records only, because Swagger exposes no follow-up sort parameter. Workload uses the upcoming page and explicitly reports when the input is truncated.
- `GET /tenants`: explicit active/inactive requests use server pagination totals; the active directory is a five-record preview with available contact details and join dates.
- `GET /users`: active count, one record requested; ADMIN passes its verified tenant ID. No user-management requests are made by MANAGER/SALES/USER.
- `GET /subscriptions`: existing full-collection adapter. ADMIN filters the returned collection to its verified tenant. SUPERADMIN sees pending requests, active subscriptions whose start/end dates include now, and expirations within seven elapsed days. These are subscription counts, not distinct tenant counts. Tenant names use populated references or the visible directory, falling back to a short ID.

All requests retain their existing entity query prefixes, so mutations invalidate dashboard data too. Dashboard queries have dedicated keys and metadata, separate from subscription/session access checks in AppShell. Manual is the default on each visit: initial missing data loads normally, but mount/focus/reconnect do not refresh existing dashboard snapshots. Refresh and per-section Retry explicitly request new data; entity mutations may still invalidate related dashboard records after a user action. Auto polls every 60 seconds only while visible, online and without another dashboard request in progress. Switching to Manual or leaving the page clears the timer. Refresh targets active dashboard queries only. The day window advances on refresh, and the footer shows the snapshot date/time. Loading, empty, and failed states are distinct. A refresh failure displays an unavailable state instead of a fabricated zero.

The compact white toolbar card replaces the large page heading and description, with 16px of dashboard-specific shell padding above it to match the card gutters. Cards use tighter headers and compact empty states. Subscription health uses the shared green active, amber pending, red expired and orange suspended accents; approaching expiry uses an amber caution accent. It includes pending/expired/suspended status counts; renewals include plan and renewal preference when available. Manager workload includes scheduled count and the number of assignees represented; helper cards include practical workflow guidance rather than fabricated activity.

All dashboard record previews share a five-record maximum, including pending requests, workspace directory, renewals, follow-up queues, workspace subscriptions, and workload assignees. Subscriptions still require the full existing collection for accurate aggregate metrics until backend pagination and KPI endpoints are added; see [dashboard-endpoint-changes.md](dashboard-endpoint-changes.md).

The platform request and workspace directory lists distribute their fields across the card width using container-responsive columns. Requests show workspace, plan/billing cycle, request date/time and status; the directory shows workspace/contact person, email/phone, join date and status. Wide cards have aligned column headings; narrow cards use labelled two-column rows with wrapping text. This avoids clustering all details at the left edge and leaving the middle unused. Missing fields are labelled rather than synthesized.

The current client's timezone is Asia/Kolkata (IST). Today and upcoming windows, and displayed follow-up times, use this timezone explicitly rather than the server's timezone. Dashboard queue links preserve their timestamp boundaries when opening follow-ups; the range picker accepts both these ISO timestamps and its existing date-only values.

There are no documented revenue, deal-value, historical stage-change, quota, team-membership, or leaderboard endpoints. These metrics are omitted rather than inventing financial figures. No mock data is needed for the implemented sections. MANAGER sees accessible workspace assignments, not a purported managed team. Backend tenant/role authorization remains authoritative; UI visibility and assignment filters are not authorization boundaries. Unknown roles receive no dashboard data requests.

## Validation

Unit coverage includes role scoping, IST date/year boundaries, personal assignment filters, dashboard timestamp ranges in the date picker, closed-opportunity rates, stable-ID workload grouping, subscription expiry calculations, manual focus/reconnect behavior, auto refresh eligibility and isolation from shell queries. Authenticated browser testing with each backend role remains necessary to verify deployment-specific permissions and populated response fields.
