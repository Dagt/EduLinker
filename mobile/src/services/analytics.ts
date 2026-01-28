import { apiGet } from "../api";

export async function getEventAttendanceAnalytics(params?: {
  from?: string;
  to?: string;
  groupId?: number;
  eventId?: number;
}) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.groupId) search.set("group_id", String(params.groupId));
  if (params?.eventId) search.set("event_id", String(params.eventId));
  const query = search.toString();
  return apiGet(`/analytics/events/attendance/${query ? `?${query}` : ""}`);
}
