import { getToken, refreshToken } from "./auth";

export function schoolIdFromHost(host?: string): string {
  if (!host) {
    if (typeof window === "undefined") return "1";
    host = window.location.host;
  }
  const withoutPort = host.split(":")[0];
  const subdomain = withoutPort.split(".")[0];
  return subdomain || "1";
}

export function authHeaders(token?: string) {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "X-School-ID": schoolIdFromHost(),
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

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const tk = token ?? getToken();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...authHeaders(tk), ...(options.headers || {}) },
  });
  if(res.status === 401 && !token){
    const ok = await refreshToken();
    if(ok){
      const newTk = getToken();
      const retry = await fetch(`${base}${path}`, {
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
  return apiPost(`/suggestions/${id}/status`, { status }, token);
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

// Survey voting
export async function voteSurvey(id: number, choiceId: number, token?: string) {
  return apiPost(`/surveys/${id}/vote`, { choiceId }, token);
}
