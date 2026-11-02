# Role dashboards

The authenticated dashboard provides separate platform and workspace views. SUPERADMIN opens the platform overview and can switch to the workspace dashboard. ADMIN, MANAGER, SALES, and USER open the workspace dashboard directly. Existing route access and backend authorization remain authoritative; dashboard filters are not access controls.

Dashboard cards and KPI cards use square corners. KPI cards use a white background with subtle borders and semantic accent icons, regardless of the surrounding page surface. Time-series charts have a compact Chart/Table switch; medium-length ranges are grouped by week to keep the chart readable, and the table uses a sticky header and bounded scroll area. Dashboard sections stack in two independent columns on wide screens to avoid blank gaps below shorter cards. The attention panel uses severity-colored priority rows with counts and a concise list of the most urgent records.

| Role | Default view | Dashboard content |
| --- | --- | --- |
| SUPERADMIN | Platform | Active/inactive workspace totals, active users, pending subscriptions, workspace directory preview, subscription health, and upcoming renewals |
| ADMIN | Workspace - whole team | Lead and follow-up KPIs, sales pipeline, activity trends, overdue/stale/unassigned work, recent activity, and forecast summary |
| MANAGER | Workspace - whole team | Same workspace analytics, with owner breakdowns and workload insights |
| SALES | My sales desk | Personal KPIs, pipeline, today's conversations, overdue/stale work, recent activity, and forecast |
| USER | My workday | Personal follow-up KPIs and activity, with date filtering |

Workspace dashboards support today, trailing 7/30 days, month, quarter, and custom date ranges, with comparisons against the preceding period. Dates and activity windows use Asia/Kolkata. SALES and USER dashboards are limited to the signed-in user's assigned records; they do not show a team-scope control. ADMIN and MANAGER can switch between "My numbers" and the records returned by the authorized workspace APIs.

Dashboard links open businesses and follow-ups with their corresponding filters. Follow-up links are applied to the existing list store and reflected in the URL. Business filters that the backend does not support (owner, date, and stale age) are applied client-side using analytics records, then intersected with the business list. This dashboard deep-link path currently requests at most 1,000 business records.

## Data sources and limits

Verified against the deployed [Swagger UI](https://hasvik-crm-backend-prod.vercel.app/swagger).

- Workspace analytics paginate `GET /businesses` and `GET /follow-ups` in batches of 100. Totals and records are checked across pages; results above 5,000 records, inconsistent totals, invalid envelopes, and pagination that does not advance surface errors instead of incomplete metrics.
- The activity KPI for completed follow-ups uses date- and assignee-filtered `GET /follow-ups` queries for the selected range and its comparison range. Lead creation, current pipeline, stale leads, and forecast are calculated from the fetched business records.
- Platform metrics use paginated tenant data, the user KPI endpoint, and the existing full-subscription collection. Subscription counts are subscription records, not distinct workspaces.
- No revenue, quota, historical stage-change, or team-membership endpoint is available to this dashboard. It does not invent these values; forecast is based on current leads, not revenue.
- Analytics queries are cached for 60 seconds. Refresh can be manual or automatic; automatic mode checks every 60 seconds and only refreshes active dashboard queries while the page is visible and online. Retry actions are available for failed sections.
- Loading, empty, and error states are distinct. Failed or incomplete analytics data is not presented as a fabricated zero.

The platform dashboard's tenant and user totals use server-provided counts. Subscription summaries still require the existing full collection until the backend exposes paginated subscriptions and complete aggregate endpoints; see [dashboard-endpoint-changes.md](dashboard-endpoint-changes.md).

## Validation

Unit coverage includes analytics date ranges, pagination response envelopes and totals, pipeline metrics, owner/source rollups, stale leads, completed activity volume, and dashboard refresh policy. Authenticated testing with each backend role remains necessary to verify deployment-specific permissions and populated response shapes.
