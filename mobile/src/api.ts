import * as SecureStore from "expo-secure-store";
const BASE = "http://10.0.2.2:8000/api/v1"; // Android emu

export async function getToken(){ return await SecureStore.getItemAsync("tk"); }
export async function setToken(t: string){ await SecureStore.setItemAsync("tk", t); }

export function headers(t?: string){
  const h: any = { "Content-Type":"application/json", "X-School-ID": process.env.EXPO_PUBLIC_SCHOOL_ID || "1" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function apiGet(path: string){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { headers: headers(tk) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPost(path: string, body: any){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { method:"POST", headers: headers(tk), body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPostAuth(path: string, body: any){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { method:"POST", headers: headers(tk), body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
