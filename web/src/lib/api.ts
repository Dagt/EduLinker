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

// Suggestion status update
export async function updateSuggestionStatus(id: number, status: string, token?: string) {
  return apiPost(`/suggestions/${id}/status`, { status }, token);
}

// Fundraising event summary
export async function getFundraisingEventSummary(eventId: number, token?: string) {
  return apiGet(`/fundraising-events/${eventId}/summary/`, token);
}

// Analytics dashboard
export async function getAnalytics(token?: string) {
  return apiGet(`/analytics`, token);
}

// Survey voting
export async function voteSurvey(id: number, choiceId: number, token?: string) {
  return apiPost(`/surveys/${id}/vote`, { choiceId }, token);
}
