import { getToken, refreshToken } from "./auth";

export function schoolIdFromHost(host?: string): string {
  const envId = process.env.NEXT_PUBLIC_SCHOOL_ID;
  if (envId) return envId;
  if (!host) {
    if (typeof window === "undefined") return "1";
    host = window.location.host;
  }
  const withoutPort = host.split(":")[0];
  const subdomain = withoutPort.split(".")[0];
  if (!subdomain || subdomain === "localhost" || subdomain === "127") return "1";
  return subdomain;
}

export function selectedSchoolId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("school_id");
}

export function authHeaders(token?: string) {
  const selected = selectedSchoolId();
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "X-School-ID": selected || schoolIdFromHost(),
  };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (typeof (data as any).detail === "string") msg = (data as any).detail;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as any;
  return res.json();
}

function normalizePath(path: string): string {
  if (!path) return "/";
  const [base, query = ""] = path.split("?");
  if (base.endsWith("/")) return path;
  const normalized = `${base}/`;
  return query ? `${normalized}?${query}` : normalized;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const tk = token ?? getToken();
  const url = `${base}${normalizePath(path)}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(tk), ...(options.headers || {}) },
  });
  if (res.status === 401) {
    const ok = await refreshToken();
    if (ok) {
      const newTk = getToken();
      const retry = await fetch(url, {
        ...options,
        headers: { ...authHeaders(newTk), ...(options.headers || {}) },
      });
      return handleResponse<T>(retry);
    }
  }
  return handleResponse<T>(res);
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { cache: "no-store" }, token);
}

export function apiPost<T>(path: string, body: any, token?: string): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) }, token);
}

export function apiPatch<T>(path: string, body: any, token?: string): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export function apiPut<T>(path: string, body: any, token?: string): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) }, token);
}

export function apiDelete<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "DELETE" }, token);
}

// Suggestion status update
export async function updateSuggestionStatus(id: number, status: string, token?: string) {
  return apiPatch(`/suggestions/${id}/status`, { status }, token);
}

// Fundraising endpoints
export async function listFundraisingEvents(token?: string): Promise<any> {
  return apiGet<any>(`/fundraising-events/`, token);
}

export async function createFundraisingEvent(body: any, token?: string): Promise<any> {
  return apiPost<any>(`/fundraising-events/`, body, token);
}

export async function getFundraisingEvent(id: number, token?: string): Promise<any> {
  return apiGet<any>(`/fundraising-events/${id}`, token);
}

export async function updateFundraisingEvent(id: number, body: any, token?: string): Promise<any> {
  return apiPatch<any>(`/fundraising-events/${id}`, body, token);
}

export async function deleteFundraisingEvent(id: number, token?: string): Promise<any> {
  return apiDelete<any>(`/fundraising-events/${id}`, token);
}

export async function createFundraisingLedger(body: any, token?: string): Promise<any> {
  return apiPost<any>(`/fundraising-ledger/`, body, token);
}

export async function createExpenseEvidence(body: any, token?: string): Promise<any> {
  return apiPost<any>(`/expense-evidences/`, body, token);
}

// Fundraising event summary
export async function getFundraisingEventSummary(eventId: number, token?: string) {
  return apiGet(`/fundraising-events/${eventId}/summary/`, token);
}

export async function exportFundraisingEvent(
  eventId: number,
  format: "csv" | "pdf",
  token?: string,
) {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(
    `${base}/fundraising-events/${eventId}/export/?format=${format}`,
    {
      headers: authHeaders(token),
    },
  );
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.blob();
}

// Analytics dashboard
export async function getAnalytics(token?: string) {
  return apiGet(`/analytics/overview/`, token);
}

export async function getComplaintsAnalytics(token?: string) {
  return apiGet(`/analytics/complaints/`, token);
}

export async function getFundraisingAnalytics(token?: string) {
  return apiGet(`/analytics/fundraising/`, token);
}

export async function getEngagementAnalytics(groupId?: number, token?: string) {
  const q = groupId ? `?group_id=${groupId}` : "";
  return apiGet(`/analytics/engagement/${q}`, token);
}

export async function getEventAttendanceAnalytics(
  params: { from?: string; to?: string; groupId?: number; eventId?: number } = {},
  token?: string,
) {
  const search = new URLSearchParams();
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.groupId) search.set("group_id", String(params.groupId));
  if (params.eventId) search.set("event_id", String(params.eventId));
  const query = search.toString();
  return apiGet(`/analytics/events/attendance/${query ? `?${query}` : ""}`, token);
}

export async function getMe(token?: string) {
  return apiGet(`/me/`, token);
}

export async function listSchools(token?: string) {
  return apiGet(`/schools/`, token);
}

export async function createSchool(body: {
  name: string;
  slug: string;
  subdomain: string;
  logo_url?: string;
  director_email?: string;
  director_password?: string;
  director_first_name?: string;
  director_last_name?: string;
}, token?: string) {
  return apiPost(`/schools/create/`, body, token);
}

export async function updateSchool(id: number, body: {
  name?: string;
  slug?: string;
  subdomain?: string;
  logo_url?: string;
  active?: boolean;
}, token?: string) {
  return apiPatch(`/schools/${id}/`, body, token);
}

export async function listSchoolYears(token?: string) {
  return apiGet(`/school-years/`, token);
}

export async function createSchoolYear(body: {
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}, token?: string) {
  return apiPost(`/school-years/`, body, token);
}

export async function rolloverSchoolYear(
  body: { from_year: number; to_year: number; dry_run?: boolean },
  token?: string,
) {
  return apiPost(`/school-years/rollover/`, body, token);
}

export async function setCurrentSchoolYear(id: number, token?: string) {
  return apiPost(`/school-years/${id}/set-current/`, {}, token);
}

export async function updateMe(body: {
  first_name: string;
  last_name: string;
  preferred_language: string;
}, token?: string) {
  return apiPut(`/me/`, body, token);
}

export async function regenerateIcsToken(token?: string) {
  return apiPost(`/me/regenerate-ics/`, {}, token);
}

export async function changePassword(body: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}, token?: string) {
  return apiPost(`/auth/change-password/`, body, token);
}

export async function requestPasswordReset(body: { email: string }, token?: string) {
  return apiPost(`/auth/password-reset/`, body, token);
}

export async function confirmPasswordReset(body: {
  uid: string;
  token: string;
  new_password: string;
}, token?: string) {
  return apiPost(`/auth/password-reset/confirm/`, body, token);
}

export async function listUsers(
  params: { name?: string; email?: string; status?: string; role?: string } = {},
  token?: string,
) {
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/users/${query ? `?${query}` : ""}`, token);
}

export async function createUser(body: any, token?: string) {
  return apiPost(`/users/`, body, token);
}

export async function updateUserRole(
  id: number,
  body: { role?: string; is_active?: boolean },
  token?: string,
) {
  return apiPatch(`/users/${id}/role/`, body, token);
}

export async function listStudents(
  params: { name?: string; grade_level?: string } = {},
  token?: string,
) {
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/students/${query ? `?${query}` : ""}`, token);
}

export async function createStudent(body: any, token?: string) {
  return apiPost(`/students/`, body, token);
}

export async function updateStudent(id: number, body: any, token?: string) {
  return apiPatch(`/students/${id}/`, body, token);
}

export async function updateStudentGroups(
  id: number,
  body: { group_ids: number[]; replace_existing?: boolean; allow_multiple_groups?: boolean },
  token?: string,
) {
  return apiPatch(`/students/${id}/groups/`, body, token);
}

export async function listParentStudents(
  params: { parent?: string; student?: string; relationship?: string } = {},
  token?: string,
) {
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/parent-students/${query ? `?${query}` : ""}`, token);
}

export async function createParentStudent(body: {
  parent: number;
  student: number;
  relationship: string;
}, token?: string) {
  return apiPost(`/parent-students/`, body, token);
}

export async function listAnnouncements(token?: string) {
  return apiGet(`/announcements/`, token);
}

export async function createAnnouncement(body: {
  scope: "GLOBAL" | "GRUPO";
  group?: number | null;
  title: string;
  message: string;
}) {
  return apiPost(`/announcements/`, body);
}

export async function listHomeworks(token?: string) {
  return apiGet(`/homeworks/`, token);
}

export async function createHomework(body: {
  group: number;
  subject: string;
  title: string;
  description: string;
  due_date: string;
}) {
  return apiPost(`/homeworks/`, body);
}

export async function listFeed(token?: string) {
  const data: any = await apiGet(`/feed/`, token);
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

export async function deleteParentStudent(id: number, token?: string) {
  return apiDelete(`/parent-students/${id}/`, token);
}

export async function updateComplaintStatus(
  id: number,
  status: string,
  token?: string,
) {
  return apiPatch(`/complaints/${id}/status/`, { status }, token);
}

export async function addComplaintParticipant(
  id: number,
  body: { user: number; role_in_thread: string },
  token?: string,
) {
  return apiPost(`/complaints/${id}/participants/`, body, token);
}

export async function getGroup(id: number, token?: string) {
  return apiGet(`/groups/${id}/`, token);
}

export async function listGroupMembers(id: number, token?: string) {
  return apiGet(`/groups/${id}/members/`, token);
}

export async function listGroupVocals(id: number, token?: string) {
  return apiGet(`/groups/${id}/vocals/`, token);
}

export async function assignHomeroom(
  groupId: number,
  teacherId: number,
  token?: string,
) {
  return apiPatch(`/groups/${groupId}/assign-homeroom-teacher/`, { homeroom_teacher: teacherId }, token);
}

export async function assignSpecialist(
  groupId: number,
  body: { teacher: number; subject: string },
  token?: string,
) {
  return apiPost(`/groups/${groupId}/assign-specialist/`, body, token);
}

export async function assignVocal(
  groupId: number,
  parentId: number,
  token?: string,
) {
  return apiPost(`/groups/vocal-assignments/`, { group: groupId, parent: parentId }, token);
}

export async function deactivateVocal(id: number, token?: string) {
  return apiPost(`/groups/vocal-assignments/${id}/deactivate/`, {}, token);
}

export async function listAuditLogs(
  params: {
    actor?: string;
    action?: string;
    entity_type?: string;
    date_from?: string;
    date_to?: string;
  } = {},
  token?: string,
) {
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/audit-logs/${query ? `?${query}` : ""}`, token);
}

export function getChatWebSocketUrl(groupId: number, token: string) {
  const base = process.env.NEXT_PUBLIC_API_URL!.replace(/\/api\/v1\/?$/, "");
  const wsBase = base.replace(/^http/, "ws");
  const query = new URLSearchParams({ token }).toString();
  return `${wsBase}/ws/groups/${groupId}/chat/?${query}`;
}

// Survey voting
export async function voteSurvey(id: number, choiceId: number, token?: string) {
  return apiPost(`/surveys/${id}/vote`, { option_index: choiceId }, token);
}
