# Subscription list API contract

The subscriptions list offers status filtering only and is prepared for backend pagination. It calls `GET /api/subscriptions` with:

| Parameter | Behavior |
| --- | --- |
| `page` | One-based page, default 1 |
| `limit` | Page size: 10, 20, 50, or 100 |
| `status` | Subscription status; omitted for all statuses |
| `tenantId` | Tenant admins send their own workspace ID for scoping; not a user-selectable filter |
| `sortBy` | Fixed to `-createdAt` (newest first) by the API client |

Expected response: `{ "data": [/* subscriptions */], "total": 123 }`. `total` is the count after filtering and before pagination, including when a page is empty. Sort ties should use a stable ID to prevent records shifting between pages. For `endDate` sorting, place lifetime subscriptions without an end date last.

The backend must enforce tenant scoping from the authenticated identity and authorize status changes independently of these query parameters. The frontend's tenant filter is not an authorization boundary.

The list renders server results directly; it does not filter or slice the returned page. Legacy arrays and `{ data }` are readable during rollout, with the returned length as the only available total. Pagination and filtering require backend support to behave fully.

The pending approval badge uses a separate `status=PENDING&page=1&limit=1` request and its total. Dashboard summaries, workspace access checks, tenant management, and plan request eligibility collect all pages with `limit=100`, independently of list filters. Mutations invalidate both page queries and these complete collections.

Manual checks once the backend is ready:

- Status filtering works across multiple pages; search, workspace, billing cycle, and sort controls are not displayed.
- Filter and page size changes return to page 1; clearing filters restores all statuses.
- Approving, rejecting, suspending, or renewing refreshes list totals and the approval badge; an emptied final page returns to the last valid page.
- A tenant's active subscription on a later page still grants access and prevents duplicate plan requests.
- Tenant admins cannot retrieve or change subscriptions belonging to another workspace.
