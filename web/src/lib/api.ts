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
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...authHeaders(token), ...(options.headers || {}) },
  });
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
