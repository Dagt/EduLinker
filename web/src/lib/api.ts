export function authHeaders(token?: string) {
  const h: Record<string,string> = {
    "Content-Type": "application/json",
    "X-School-ID": process.env.NEXT_PUBLIC_SCHOOL_ID || "1",
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
