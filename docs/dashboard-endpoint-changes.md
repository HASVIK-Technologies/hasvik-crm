# Dashboard endpoint changes

Checked against the deployed [Swagger specification](https://crm-backend-three-phi.vercel.app/swagger-json) on 25 October 2026. Routes below include the `/api` prefix used by the backend.

Dashboard record previews now display at most five entries. Tenant and follow-up previews request `page=1&limit=5`. Count-only requests still fetch one record and read the server total. Full totals and status summaries must be computed before pagination.

## Needed to fetch only five subscriptions per preview

### 1. Extend `GET /api/subscriptions`

Swagger currently documents no query parameters for this route. Add:

| Parameter | Purpose |
| --- | --- |
| `page`, `limit` | Server pagination; dashboard uses 1 and 5 |
| `status` | Pending-request and current-status filtering |
| `tenantId` | Tenant-admin workspace view; validate against the caller's scope |
| `fromEndDate`, `toEndDate` | Renewal window, using inclusive ISO timestamps |
| `sortBy` | Stable ordering, e.g. `createdAt` for oldest requests or `endDate` for next renewals; break ties by ID |

Proposed paginated response:

```json
{
  "data": [],
  "total": 42,
  "page": 1,
  "limit": 5,
  "totalPages": 9
}
```

Populate the tenant's ID/name and plan's ID/name/billing cycle in each returned record, so preview labels do not depend on finding the tenant in the five-record directory preview.

Example requests after implementation:

```text
GET /api/subscriptions?status=PENDING&page=1&limit=5&sortBy=createdAt
GET /api/subscriptions?status=ACTIVE&fromEndDate=<now>&toEndDate=<now+7days>&page=1&limit=5&sortBy=endDate
```

For renewal previews, exclude subscriptions whose start date is in the future. Returned `total` must cover all matching records, not just the page.

### 2. Add `GET /api/subscriptions/kpis`

This route is not currently in Swagger. Provide complete aggregates without returning subscription rows. Suggested filters: authorized `tenantId` and `expiringInDays` (dashboard uses 7).

Proposed response:

```json
{
  "total": 42,
  "activeNow": 25,
  "expiringSoon": 3,
  "byStatus": {
    "ACTIVE": 25,
    "PENDING": 5,
    "EXPIRED": 4,
    "SUSPENDED": 2,
    "CANCELLED": 4,
    "REJECTED": 2
  },
  "asOf": "2026-10-25T06:00:00.000Z"
}
```

The numbers above illustrate the contract, not production data. `activeNow` means status ACTIVE with start <= now and end > now; absent start/end bounds are open-ended. `expiringSoon` is the subset ending within the next seven elapsed days. `byStatus` counts stored statuses independently of those date checks. These are subscription counts, not unique tenant counts.

Until both subscription pagination and aggregate counts exist, the frontend continues to read the existing complete subscription collection to keep KPIs accurate, and displays five pending requests/renewals/subscriptions per card. It does not send unsupported pagination parameters or calculate global counts from a five-row page.

Roll out the new contract with updates to `getSubscriptions`, subscription management, and AppShell's access checks, which currently expect a complete collection. Preserve the existing collection response through opt-in pagination/versioning, or migrate those consumers together. Access checks must not depend on the first page of subscriptions.

## Reporting improvements

### 3. Add sorting to `GET /api/follow-ups`

Pagination and assignment/date/status filters already exist; no backend change is needed to request five rows. Swagger does not document sorting. Add `sortBy=scheduledAt` with a stable ID tie-breaker so the five overdue rows are the oldest overdue records and the five agenda/upcoming rows are the earliest scheduled records. Client-side sorting can only reorder the returned page.

### 4. Add `GET /api/follow-ups/workload`

For a complete manager workload report while limiting previews to five, aggregate by assignee on the server. Suggested parameters: `fromDate`, `toDate`, `status=SCHEDULED`, `page=1`, `limit=5`; the server determines the authorized workspace/team scope.

Proposed response:

```json
{
  "data": [
    { "assignedTo": { "id": "user-id", "fullName": "Example assignee" }, "scheduled": 12 }
  ],
  "totalAssignees": 8,
  "totalFollowUps": 47,
  "page": 1,
  "limit": 5
}
```

Order by workload descending with a stable tie-breaker; represent unassigned records explicitly. Counts must aggregate all matching follow-ups before limiting the assignee preview. Until available, the manager card explicitly labels its workload as based on the upcoming five-record preview and shows the full follow-up total separately. There is no documented team-membership endpoint, so the frontend describes this as workspace workload.

## Optional request reduction

### 5. Document/provide `byStatus` on `GET /api/businesses/kpis`

Return all six business-stage counts (NEW, CONTACTED, PROPOSAL_AND_NEGOTIATION, INTERESTED, WON, LOST) under the same filters/scope. The current client uses six `GET /businesses?status=...&limit=1` count requests. A documented aggregate lets it replace them with one KPI request. This is not required for five-record previews.

`GET /api/tenants` already supports `page`, `limit`, and `isActive`; no change is needed for the five active-workspace preview. `GET /api/users` already supplies paginated totals for the active-user count. Dashboard refresh mode is entirely a frontend concern and needs no new endpoint.
