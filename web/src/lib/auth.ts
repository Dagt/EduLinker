export const tokenKey = "edulinker_access";
export const refreshKey = "edulinker_refresh";

export function setToken(t: string){ localStorage.setItem(tokenKey, t); }
export function getToken(){ return typeof window === "undefined" ? "" : localStorage.getItem(tokenKey) || ""; }
export function clearToken(){ localStorage.removeItem(tokenKey); }

export function setRefreshToken(t: string){ localStorage.setItem(refreshKey, t); }
export function getRefreshToken(){ return typeof window === "undefined" ? "" : localStorage.getItem(refreshKey) || ""; }
export function clearRefreshToken(){ localStorage.removeItem(refreshKey); }

export async function refreshToken(){
  const refresh = getRefreshToken();
  if(!refresh) return false;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ refresh })
  });
  if(!res.ok){
    clearToken();
    clearRefreshToken();
    return false;
  }
  const data = await res.json();
  setToken(data.access);
  if(data.refresh) setRefreshToken(data.refresh);
  return true;
}
