export const tokenKey = "edulinker_access";

export function setToken(t: string){ localStorage.setItem(tokenKey, t); }
export function getToken(){ return typeof window === "undefined" ? "" : localStorage.getItem(tokenKey) || ""; }
export function clearToken(){ localStorage.removeItem(tokenKey); }
