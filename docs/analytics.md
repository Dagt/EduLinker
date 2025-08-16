# Analytics Overview

The analytics overview endpoint (`/api/v1/analytics/overview/`) provides high level
metrics for a school. In addition to existing data for complaints, suggestions,
fundraising and surveys, the endpoint reports event statistics:

- `events_total`: total number of events registered for the school.
- `events_upcoming`: count of upcoming active events.
- `events_cancelled`: number of events marked as cancelled.
- `events_by_scope`: list with the total events grouped by scope (GLOBAL or GROUP).
- `fundraising_total`: overall amount collected across all fundraising events.

## Complaints analytics

The complaints endpoint (`/api/v1/analytics/complaints/`) now highlights the most
active parents in the complaint system:

- `top_parents_by_complaints`: list of up to five parents ordered by the number
  of complaints they have submitted.

## Fundraising analytics

The fundraising endpoint (`/api/v1/analytics/fundraising/`) now reports
aggregate metrics and supports filtering by event using the `event_id` query
parameter:

- `fundraising_total`: total amount collected, optionally scoped to a specific
  event.
- `fundraising_by_group` and `fundraising_by_event`: breakdowns of the amounts
  raised per group and per event.

## Engagement analytics

The engagement endpoint (`/api/v1/analytics/engagement/`) adds a metric to measure
survey participation:

- `participation_rate_by_group`: percentage of survey votes relative to the
  number of parents in each group.

