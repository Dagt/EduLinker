# Analytics Overview

Only directors can access analytics endpoints, and all responses are scoped to
the `X-SCHOOL-ID` header for multi-tenant safety.

The analytics overview endpoint (`/api/v1/analytics/overview/`) provides high level
metrics for a school. It includes headline counts for complaints, suggestions,
fundraising, surveys, and events:

- `complaints_total`: total number of complaints registered for the school.
- `complaints_open`: count of open complaints.
- `events_total`: total number of events registered for the school.
- `events_upcoming`: count of upcoming active events.
- `events_cancelled`: number of events marked as cancelled.
- `events_by_scope`: list with the total events grouped by scope (GLOBAL or GROUP).
- `fundraising_total`: overall amount collected across all fundraising events.
- `rsvp_by_group`: list of RSVP totals grouped by group (YES, MAYBE, NO).
- `rsvp_attendance_rate_by_group`: attendance rate based on confirmed YES RSVPs
  divided by the number of parents in each group.

## Complaints analytics

The complaints endpoint (`/api/v1/analytics/complaints/`) provides complaint
totals, group breakdowns, and highlights the most active parents:

- `complaints_total`: total number of complaints in the selection.
- `complaints_open`: total number of open complaints in the selection.
- `complaints_by_group`: list of counts grouped by group id.
- `top_parents_by_complaints`: list of up to five parents ordered by the number
  of complaints they have submitted.
- `least_problematic_groups`: groups with fewer complaints and higher event
  participation.

## Fundraising analytics

The fundraising endpoint (`/api/v1/analytics/fundraising/`) now reports
aggregate metrics and supports filtering by event using the `event_id` query
parameter:

- `fundraising_total`: total amount collected, optionally scoped to a specific
  event.
- `fundraising_by_group` and `fundraising_by_event`: breakdowns of the amounts
  raised per group and per event.

## Engagement analytics

The engagement endpoint (`/api/v1/analytics/engagement/`) adds metrics to measure
survey participation and engagement by group:

- `participation_rate_by_group`: percentage of survey votes relative to the
  number of parents in each group.
- `rsvp_by_group`: RSVP totals grouped by group.
- `rsvp_attendance_rate_by_group`: attendance rate based on confirmed YES RSVPs
  divided by the number of parents in each group.

## Event attendance analytics

The attendance endpoint (`/api/v1/analytics/events/attendance/`) provides RSVP
attendance totals and participation rates over a date range, and can be filtered
by `group_id` or `event_id`:

```
GET /api/v1/analytics/events/attendance/?from=2025-01-01&to=2025-01-31
```

Example response:

```json
{
  "attending_yes": 12,
  "attending_no": 4,
  "attending_maybe": 3,
  "participation_rate": 0.6,
  "attendance_by_group": [
    {
      "group_id": 10,
      "attending_yes": 5,
      "attending_no": 1,
      "attending_maybe": 2,
      "participation_rate": 0.5
    }
  ]
}
```

Only directors can access attendance analytics and the response is always scoped
to the `X-SCHOOL-ID` header.
