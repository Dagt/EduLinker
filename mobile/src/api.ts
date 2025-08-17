import * as SecureStore from "expo-secure-store";

function baseUrl(){
  const url = process.env.EXPO_PUBLIC_API_URL;
  if(!url) throw new Error("EXPO_PUBLIC_API_URL not set");
  return url;
}

function schoolId(){
  const id = process.env.EXPO_PUBLIC_SCHOOL_ID;
  if(!id) throw new Error("EXPO_PUBLIC_SCHOOL_ID not set");
  return id;
}

export async function getToken(){ return await SecureStore.getItemAsync("tk"); }
export async function setToken(t: string){ await SecureStore.setItemAsync("tk", t); }

export async function headers(t?: string){
  const h: any = { "Content-Type":"application/json", "X-School-ID": schoolId() };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function apiFetch(path: string, init: any = {}){
  const tk = await getToken();
  const h = await headers(tk);
  const opts = { ...init, headers: h };
  return fetch(`${baseUrl()}${path}`, opts);
}

export async function apiGet(path: string){
  const r = await apiFetch(path);
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPost(path: string, body: any){
  const r = await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiPut(path: string, body: any){
  const r = await apiFetch(path, { method: "PUT", body: JSON.stringify(body) });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function apiDelete(path: string){
  const r = await apiFetch(path, { method: "DELETE" });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  if(r.status === 204) return;
  return r.json();
}

export async function getNotificationPreferences(){
  return apiGet("/notifications/preferences/");
}

export async function updateNotificationPreferences(body: {[key: string]: boolean}){
  return apiPut("/notifications/preferences/", body);
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

export async function updateComplaint(id: number, body: any){
  return apiPut(`/complaints/${id}/`, body);
}

export async function getComplaintMessages(id: number){
  return apiGet(`/complaints/${id}/messages/`);
}

export async function sendComplaintMessage(id: number, body: any){
  return apiPost(`/complaints/${id}/messages/`, body);
}

export async function deleteComplaint(id: number){
  return apiDelete(`/complaints/${id}/`);
}

export async function escalateComplaint(id: number){
  return apiPost(`/complaints/${id}/status/`, { status: 'ESCALATED' });
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

export async function updateSuggestion(id: number, body: any){
  return apiPut(`/suggestions/${id}/`, body);
}

export async function getSuggestionMessages(id: number){
  return apiGet(`/suggestions/${id}/messages/`);
}

export async function sendSuggestionMessage(id: number, body: any){
  return apiPost(`/suggestions/${id}/messages/`, body);
}

export async function deleteSuggestion(id: number){
  return apiDelete(`/suggestions/${id}/`);
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
