# Editing and scheduling audit

Reviewed the frontend's existing PATCH calls, their callers, date/time controls, and edit initialization. This inventory covers implemented frontend features; endpoints documented by the backend but unused by this frontend are excluded.

## PATCH endpoint inventory

Paths below are relative to the API client's `/api` base.

| Endpoint | Request implementation | UI entry points | Payload behavior |
| --- | --- | --- | --- |
| `/businesses/{id}` | `lib/business/api.ts` | Business form, Kanban stage changes, assignment dialog, table activation, business detail activation modal | Form compares normalized values with the loaded baseline; stage, assignment, and activation send only `status`, `assignedTo`, or `isActive`. Unchanged form/assignment saves are skipped. |
| `/follow-ups/{id}` | `lib/follow-ups/api.ts` | Shared edit/reschedule dialog, opened from follow-up details, table, calendar, and business history | Only changed assignee, type, schedule, and reminder are sent. The helper also supports explicit notes edits using only `notes`. IDs stay in the URL. |
| `/follow-ups/{id}/status` | `lib/follow-ups/api.ts` | Complete/cancel actions on follow-up details, table, calendar, and business history | Sends only `status`. Errors propagate to the caller. |
| `/categories/{id}` | `lib/categories/api.ts` | Business category editor | Sends only changed name/description; preserves description clears and skips unchanged saves. |
| `/categories/{id}/status` | `lib/categories/api.ts` | Category activate/deactivate confirmation | Sends only `isActive`. |
| `/users/{id}` | `lib/users/api.ts` | User editor, profile page, and user activation/deactivation | Sends only changed editable fields; status actions send only `isActive`. Password is included only when entered. Unchanged saves skip PATCH. User activation support is being added to the backend. |
| `/tenants/{id}` | `lib/tenants/api.ts` | Tenant management editor | Sends only changed name/contact email/contact phone; preserves clears and skips unchanged saves. |
| `/tenants/{id}/status` | `lib/tenants/api.ts` | Tenant activation confirmation | Sends only `isActive`. |
| `/subscriptions/{id}/status` | `lib/subscriptions/api.ts` | Subscription approve/reject/cancel actions | Already sends only `status`; retained. |
| `/subscriptions/{id}/renew` | `lib/subscriptions/api.ts` | Subscription renewal confirmation | Renewal is a command. Current UI intentionally sends an empty body; optional caller-supplied renewal parameters remain supported. |

## Date and time picker inventory

| Location | Control | Change |
| --- | --- | --- |
| `components/businesses/sections/FollowUpSection.tsx` | Business form's optional follow-up schedule | Uses shared library calendar and hour/minute controls. |
| `components/follow-ups/FollowUpFormDialog.tsx` | Add follow-up and edit/reschedule | Uses the same picker; edit preserves the saved local date/time, including past schedules. |
| `components/follow-ups/NextFollowUpDialog.tsx` | Next follow-up schedule | Uses the same picker; a new follow-up intentionally starts with no selected schedule. |
| `components/follow-ups/FollowUpDateRange.tsx` | Table date-range filters | Native date inputs replaced with React DayPicker range selection; today/week/month presets retained; clear button is keyboard accessible. |
| `components/follow-ups/FollowUpCalendar.tsx` | Mobile week selection | Native date input replaced with shared library date picker. |
| `components/follow-ups/FollowUpCalendar.tsx` | Desktop month selection | Native month selector retained to select whole months; width constrained to its container. |

Shared controls: `Calendar.tsx`, `DatePicker.tsx`, and `DateTimePicker.tsx` under `components/common/`. React DayPicker provides calendar selection and keyboard navigation. Time uses native hour/minute selects, which work with keyboard and touch. Popovers constrain width to the viewport and height to the available space, with scrolling on short screens. Date/time changes are committed with Apply; Cancel preserves the saved value. Clear is a separate keyboard-accessible button.

## Bugs fixed and improvements made

1. User, profile, category, tenant, and follow-up editors submitted unchanged fields. Added normalized comparisons and skipped empty PATCH requests.
2. Saving an unchanged business assignment generated another update. Added a no-change guard and disabled that save.
3. Edit/reschedule initialization deliberately cleared saved dates in the past. Saved schedules now prepopulate.
4. The handmade picker hid past selections and substituted current time. Replaced it with a library calendar that displays the saved selection without changing it.
5. Editing an overdue follow-up required rescheduling even when only its assignee changed. Unchanged saved schedules are allowed; newly chosen schedules must still be in the future.
6. Unrelated edits resent schedules rounded to the form's minute precision. Unchanged timestamps are now omitted, preserving original seconds and milliseconds.
7. Date parsing silently rolled impossible dates/times into another day. Added strict local date/time validation, including leap days and nonexistent local times.
8. Local display conversion mutated the date by its timezone offset, risking errors across daylight-saving transitions. It now formats local date components directly.
9. The custom date/time control had a mouse-only clear control nested inside a button. Clear now has a separate, focusable button.
10. Follow-up updates sent notes under several duplicate alias fields. PATCH now sends the canonical `notes` field only.
11. Follow-up updates retried 404/405 responses against an undocumented collection PATCH endpoint. Removed the fallback; actual request failures remain visible.
12. Follow-up status errors could be swallowed and reported as success. Errors now propagate.
13. Partial PATCH responses could overwrite cached follow-up business/owner/contact values with defaults. Successful edits now refetch the authoritative follow-up queries.
14. Numeric-only/custom reminder values could appear empty and be unintentionally cleared. Edit defaults and reminder options now retain those values; explicit clearing sends zero, matching the existing API mapper's no-reminder representation.
15. Profile updates did not invalidate user/activity caches. They now invalidate the users prefix after a successful save.
16. Removed unused map and Kanban imports/variables identified by the full lint run.

## Validation and limits

- Regression tests cover changed-only payloads, explicit clears, unchanged overdue schedules, timestamp precision, invalid dates, timezone conversion, and daylight-saving boundaries.
- Full test suite, TypeScript, lint, and production build are checked separately; see the task's completion report for the final results.
- Responsive behavior is implemented through viewport/available-height constraints; authenticated browser interaction and physical-device testing were not available in this session.
- Dependency installation reported 21 audit findings (5 moderate, 14 high, 2 critical) across the installed dependency tree. These need separate dependency triage; no forced upgrades were applied.
- Next.js reports multiple lockfiles outside/inside the project when inferring its workspace root. The production build completes; root configuration was not changed as part of the form fixes.
