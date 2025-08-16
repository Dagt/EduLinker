import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BASE = "http://10.0.2.2:8000/api/v1"; // Android emu
const SCHOOL_ID_KEY = "schoolId";

export async function getToken(){ return await SecureStore.getItemAsync("tk"); }
export async function setToken(t: string){ await SecureStore.setItemAsync("tk", t); }

export async function getSchoolId(){
  let id = await AsyncStorage.getItem(SCHOOL_ID_KEY);
  if(!id){
    const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
    const host = domain.replace(/^https?:\/\//, "");
    const sub = host.split(".")[0];
    const match = sub.match(/\d+/);
    id = match ? match[0] : "1";
    await AsyncStorage.setItem(SCHOOL_ID_KEY, id);
  }
  return id;
}

export async function setSchoolId(id: string){
  await AsyncStorage.setItem(SCHOOL_ID_KEY, id);
}

export async function headers(t?: string){
  const h: any = { "Content-Type":"application/json", "X-School-ID": await getSchoolId() };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export async function apiGet(path: string){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { headers: await headers(tk) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPost(path: string, body: any){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { method:"POST", headers: await headers(tk), body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPostAuth(path: string, body: any){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { method:"POST", headers: await headers(tk), body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPutAuth(path: string, body: any){
  const tk = await getToken();
  const r = await fetch(`${BASE}${path}`, { method:"PUT", headers: headers(tk), body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
