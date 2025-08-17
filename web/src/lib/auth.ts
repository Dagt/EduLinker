export const tokenKey = "edulinker_access";
export const refreshKey = "edulinker_refresh";

export function setTokens(access: string, refresh: string){
  localStorage.setItem(tokenKey, access);
  localStorage.setItem(refreshKey, refresh);
}
export function setToken(t: string){ localStorage.setItem(tokenKey, t); }
export function setRefreshToken(t: string){ localStorage.setItem(refreshKey, t); }
export function getToken(){ return typeof window === "undefined" ? "" : localStorage.getItem(tokenKey) || ""; }
export function getRefreshToken(){ return typeof window === "undefined" ? "" : localStorage.getItem(refreshKey) || ""; }
export function clearToken(){ localStorage.removeItem(tokenKey); localStorage.removeItem(refreshKey); }

export async function refreshToken(){
  const refresh = getRefreshToken();
  if(!refresh) throw new Error("no refresh token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ refresh })
  });
  if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  setToken(data.access);
  return data.access as string;
}
