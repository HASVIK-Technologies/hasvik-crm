# Responsive list filters

The Businesses filtering pattern is shared by all pages with list filters through `ResponsiveFilters`. Existing query parameters, immediate updates, and page resets remain owned by each page.

| Screen width | Visible controls | Remaining controls |
| --- | --- | --- |
| Below 1024px (mobile and medium) | Filters button opens the drawer | All filters appear directly in the drawer |
| 1024–1279px (large) | First two filters | More Filters popover |
| 1280px and above (extra large) | First three filters | More Filters popover |

Search and reset buttons do not count toward the filter limit. Pages with fewer filters show their available controls without an empty More Filters button. Search-only categories retain their search interface.

## Filter order

| Page | Ordered filters |
| --- | --- |
| Businesses | Category, lead status, city, activity status |
| Follow-ups | Business, team member, status, type, date range (table view only) |
| Users | Role, workspace (platform admins only), status |
| Tenants | Status |
| Subscriptions | Status |

The More Filters badge counts active fields inside that popover, including fields moved there when the screen narrows. Reset Extra clears only those fields; Reset Filters keeps each page's existing reset behavior. Calendar period selection stays above the follow-up calendar.

The desktop filter row can wrap alongside search so narrow content areas do not overflow. Drawer fields stretch to full width; the drawer body scrolls independently of its footer. Popovers have viewport-constrained widths and scrollable heights. Resizing an open drawer to desktop closes it, preventing an invisible modal from trapping focus. The desktop controls are unmounted while the drawer is open to avoid duplicate field IDs.

## Verification

Automated tests cover boundary widths 1023/1024 and 1279/1280, field ordering, and pages with fewer filters. TypeScript and lint verify integration.

For browser acceptance, check 320, 375, 768, 1023, 1024, 1279, 1280, 1440, and 1920px widths. Confirm that search, autocomplete/select popovers, Reset Extra, drawer scrolling, and keyboard focus remain usable. Check follow-ups in both table and calendar views, and users as both platform and tenant admins.
