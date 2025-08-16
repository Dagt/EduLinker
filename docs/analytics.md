# Analytics Overview

The analytics overview endpoint (`/api/v1/analytics/overview/`) provides high level
metrics for a school. In addition to existing data for complaints, suggestions,
fundraising and surveys, the endpoint reports event statistics:

- `events_total`: total number of events registered for the school.
- `events_upcoming`: count of upcoming active events.
- `events_cancelled`: number of events marked as cancelled.
- `events_by_scope`: list with the total events grouped by scope (GLOBAL or GROUP).

## Complaints analytics

The complaints endpoint (`/api/v1/analytics/complaints/`) now highlights the most
active parents in the complaint system:

- `top_parents_by_complaints`: list of up to five parents ordered by the number
  of complaints they have submitted.

## Engagement analytics

The engagement endpoint (`/api/v1/analytics/engagement/`) adds a metric to measure
survey participation:

- `participation_rate_by_group`: percentage of survey votes relative to the
  number of parents in each group.

