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
  const r = await fetch(`${BASE}${path}`, { method:"PUT", headers: await headers(tk), body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function getNotificationPreferences(){
  return apiGet("/notifications/preferences/");
}

export async function updateNotificationPreferences(body: {[key: string]: boolean}){
  return apiPutAuth("/notifications/preferences/", body);
}

// Complaints API helpers
export async function getComplaints(){
  return apiGet("/complaints/");
}

export async function createComplaint(body: {
  content: string;
  group_id: number;
  target_teacher_id: number;
  about_student_id?: number;
}){
  return apiPost("/complaints/", body);
}

export async function getComplaintMessages(id: number){
  return apiGet(`/complaints/${id}/messages/`);
}

export async function sendComplaintMessage(id: number, body: any){
  return apiPost(`/complaints/${id}/messages/`, body);
}

// Suggestions API helpers
export async function getSuggestions(){
  return apiGet("/suggestions/");
}

export async function createSuggestion(body: {
  title: string;
  description: string;
  group_id: number;
  target_teacher_id: number;
  about_student_id?: number;
}){
  return apiPost("/suggestions/", body);
}

export async function getSuggestionMessages(id: number){
  return apiGet(`/suggestions/${id}/messages/`);
}

export async function sendSuggestionMessage(id: number, body: any){
  return apiPost(`/suggestions/${id}/messages/`, body);
}

// Photos API helpers
export async function postActivityPhoto(body: any){
  return apiPost("/activity-photos/", body);
}

export async function postEventPhoto(id: number, body: any){
  return apiPost(`/events/${id}/photos/`, body);
}

export async function uploadFile(uri: string, mime: string){
  const name = uri.split('/').pop() || 'upload';
  const presign = await apiPost("/storage/presign-upload/", { filename: name, content_type: mime });
  const local = await fetch(uri);
  const blob = await local.blob();
  const up = await fetch(presign.upload_url, { method: "PUT", headers:{ "Content-Type": mime }, body: blob });
  if(!up.ok) throw new Error("upload failed");
  return presign.file_url;
}

// Surveys API helpers
export async function getSurveys(){
  return apiGet("/surveys/");
}

export async function getSurvey(id: number){
  return apiGet(`/surveys/${id}/`);
}

export async function voteSurvey(id: number, option_index: number){
  return apiPost(`/surveys/${id}/vote/`, { option_index });
}

export async function getSurveyResults(id: number){
  return apiGet(`/surveys/${id}/results/`);
}

// Fundraising helpers
export async function getFundraisingSummary(eventId: number){
  return apiGet(`/fundraising-events/${eventId}/summary/`);
}

export async function createFundraisingLedger(body: {
  event: number;
  group: number;
  amount_collected: string;
}){
  return apiPost("/fundraising-ledger/", body);
}

export async function createExpenseEvidence(body: {
  ledger?: number;
  group?: number;
  file_url: string;
  amount: string;
  concept: string;
}){
  return apiPost("/expense-evidences/", body);
}
