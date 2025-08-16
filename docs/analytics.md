# Analytics Overview

The analytics overview endpoint (`/api/v1/analytics/overview/`) provides high level
metrics for a school. In addition to existing data for complaints, suggestions,
fundraising and surveys, the endpoint now reports event statistics:

- `events_total`: total number of events registered for the school.
- `events_upcoming`: count of upcoming active events.
- `events_cancelled`: number of events marked as cancelled.
- `events_by_scope`: list with the total events grouped by scope (GLOBAL or GROUP).

