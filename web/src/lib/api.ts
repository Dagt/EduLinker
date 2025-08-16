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

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: any, token?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPatch<T>(path: string, body: any, token?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiDelete(path: string, token?: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
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

export async function createFundraisingLedger(body: any, token?: string): Promise<any> {
  return apiPost<any>(`/fundraising-ledger/`, body, token);
}

export async function createExpenseEvidence(body: any, token?: string): Promise<any> {
  return apiPost<any>(`/expense-evidences/`, body, token);
}

export async function getFundraisingEvent<T = any>(id: number, token?: string): Promise<T> {
  return apiGet<T>(`/fundraising-events/${id}`, token);
}

export async function updateFundraisingEvent(id: number, body: any, token?: string) {
  return apiPatch(`/fundraising-events/${id}`, body, token);
}

export async function deleteFundraisingEvent(id: number, token?: string) {
  return apiDelete(`/fundraising-events/${id}`, token);
}

// Fundraising event summary
export async function getFundraisingEventSummary(eventId: number, token?: string) {
  return apiGet(`/fundraising-events/${eventId}/summary/`, token);
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

// Survey voting
export async function voteSurvey(id: number, choiceId: number, token?: string) {
  return apiPost(`/surveys/${id}/vote`, { choiceId }, token);
}
