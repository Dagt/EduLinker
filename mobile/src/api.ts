import * as SecureStore from "expo-secure-store";

const REFRESH_KEY = "rf";

export function getApiUrl(){
  const url = process.env.EXPO_PUBLIC_API_URL;
  if(!url) throw new Error("EXPO_PUBLIC_API_URL not set");
  return url;
}

export function getSchoolId(){
  const id = process.env.EXPO_PUBLIC_SCHOOL_ID;
  if(!id) throw new Error("EXPO_PUBLIC_SCHOOL_ID not set");
  return id;
}

export async function getToken(){ return await SecureStore.getItemAsync("tk"); }
export async function setToken(t: string){ await SecureStore.setItemAsync("tk", t); }
export async function getRefreshToken(){ return await SecureStore.getItemAsync(REFRESH_KEY); }
export async function setRefreshToken(t: string){ await SecureStore.setItemAsync(REFRESH_KEY, t); }

export async function refreshToken(){
  const refresh = await getRefreshToken();
  if(!refresh) return false;
  const r = await fetch(`${getApiUrl()}/auth/refresh/`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ refresh })
  });
  if(!r.ok) return false;
  const data = await r.json();
  await setToken(data.access);
  if(data.refresh) await setRefreshToken(data.refresh);
  return true;
}

export function headers(t?: string){
  const h: any = { "Content-Type":"application/json", "X-School-ID": getSchoolId() };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function request(path: string, options: RequestInit = {}, retry = true){
  const tk = await getToken();
  const res = await fetch(`${getApiUrl()}${path}`, { ...options, headers: headers(tk) });
  if(res.status === 401 && retry){
    const ok = await refreshToken();
    if(ok) return request(path, options, false);
  }
  if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if(res.status === 204) return;
  return res.json();
}

export async function apiGet(path: string){
  return request(path);
}

export async function apiPost(path: string, body: any){
  return request(path, { method:"POST", body: JSON.stringify(body) });
}

export async function apiPostAuth(path: string, body: any){
  return request(path, { method:"POST", body: JSON.stringify(body) });
}

export async function apiPutAuth(path: string, body: any){
  return request(path, { method:"PUT", body: JSON.stringify(body) });
}

export async function apiPatchAuth(path: string, body: any){
  return request(path, { method:"PATCH", body: JSON.stringify(body) });
}

export async function apiDeleteAuth(path: string){
  return request(path, { method: "DELETE" });
}

export async function getNotificationPreferences(){
  return apiGet("/notifications/preferences/");
}

export async function getMe(){
  return apiGet("/me/");
}

export async function updateMe(body: {
  first_name: string;
  last_name: string;
  preferred_language: string;
}){
  return apiPutAuth("/me/", body);
}

export async function regenerateIcsToken(){
  return apiPost("/me/regenerate-ics/", {});
}

export async function changePassword(body: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}){
  return apiPost("/auth/change-password/", body);
}

export async function requestPasswordReset(body: { email: string }){
  return apiPost("/auth/password-reset/", body);
}

export async function confirmPasswordReset(body: {
  uid: string;
  token: string;
  new_password: string;
}){
  return apiPost("/auth/password-reset/confirm/", body);
}

export async function updateNotificationPreferences(body: {[key: string]: boolean}){
  return apiPutAuth("/notifications/preferences/", body);
}

// Users API helpers
export async function listUsers(params: {
  name?: string;
  email?: string;
  status?: string;
  role?: string;
} = {}){
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/users/${query ? `?${query}` : ""}`);
}

export async function createUser(body: any){
  return apiPost("/users/", body);
}

export async function updateUserRole(id: number, body: { role?: string; is_active?: boolean }){
  return apiPatchAuth(`/users/${id}/role/`, body);
}

// Students API helpers
export async function listStudents(params: {
  name?: string;
  grade_level?: string;
} = {}){
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/students/${query ? `?${query}` : ""}`);
}

export async function createStudent(body: any){
  return apiPost("/students/", body);
}

export async function updateStudent(id: number, body: any){
  return apiPatchAuth(`/students/${id}/`, body);
}

export async function updateStudentGroups(
  id: number,
  body: { group_ids: number[]; replace_existing?: boolean; allow_multiple_groups?: boolean }
){
  return apiPatchAuth(`/students/${id}/groups/`, body);
}

export async function listParentStudents(){
  return apiGet("/parent-students/");
}

export async function createParentStudent(body: { parent: number; student: number; relationship: string }){
  return apiPost("/parent-students/", body);
}

export async function deleteParentStudent(id: number){
  return apiDeleteAuth(`/parent-students/${id}/`);
}

export async function getGroup(id: number){
  return apiGet(`/groups/${id}/`);
}

export async function listGroupMembers(id: number){
  return apiGet(`/groups/${id}/members/`);
}

export async function listGroupVocals(id: number){
  return apiGet(`/groups/${id}/vocals/`);
}

export async function assignHomeroom(groupId: number, teacherId: number){
  return apiPatchAuth(`/groups/${groupId}/assign-homeroom-teacher/`, { homeroom_teacher: teacherId });
}

export async function assignSpecialist(groupId: number, body: { teacher: number; subject: string }){
  return apiPost(`/groups/${groupId}/assign-specialist/`, body);
}

// Audit logs API helpers
export async function listAuditLogs(params: {
  actor?: string;
  action?: string;
  entity_type?: string;
  date_from?: string;
  date_to?: string;
} = {}){
  const search = new URLSearchParams(params as Record<string, string>);
  const query = search.toString();
  return apiGet(`/audit-logs/${query ? `?${query}` : ""}`);
}

export async function getChatWebSocketUrl(groupId: number, token: string){
  const base = getApiUrl()
    .replace(/\/api\/v1\/?$/, "")
    .replace(/^http/, "ws");
  const query = new URLSearchParams({ token }).toString();
  return `${base}/ws/groups/${groupId}/chat/?${query}`;
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
  return apiPutAuth(`/complaints/${id}/`, body);
}

export async function getComplaintMessages(id: number){
  return apiGet(`/complaints/${id}/messages/`);
}

export async function sendComplaintMessage(id: number, body: any){
  return apiPost(`/complaints/${id}/messages/`, body);
}

export async function deleteComplaint(id: number){
  return apiDeleteAuth(`/complaints/${id}/`);
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
  return apiPutAuth(`/suggestions/${id}/`, body);
}

export async function getSuggestionMessages(id: number){
  return apiGet(`/suggestions/${id}/messages/`);
}

export async function sendSuggestionMessage(id: number, body: any){
  return apiPost(`/suggestions/${id}/messages/`, body);
}

export async function deleteSuggestion(id: number){
  return apiDeleteAuth(`/suggestions/${id}/`);
}

// Homeworks & Announcements
export async function createHomework(body: {
  title: string;
  description: string;
  group: number;
  due_date: string;
  subject: string;
  attachments?: string[];
}){
  return apiPost("/homeworks/", body);
}

export async function createAnnouncement(body: {
  title: string;
  message: string;
  group: number;
  scope?: string;
  publish_date?: string;
  attachments?: string[];
}){
  return apiPost("/announcements/", body);
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

export async function createSurvey(body: {
  title: string;
  description: string;
  options: string[];
  scope: 'GRUPO' | 'ESCUELA';
  group?: number;
  anonymous: boolean;
  start_at: string;
  end_at: string;
}){
  return apiPost("/surveys/", body);
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

// Vocal assignments
export async function assignVocal(group: number, parent: number){
  return apiPost("/groups/vocal-assignments/", { group, parent });
}

export async function deactivateVocal(id: number){
  return apiPost(`/groups/vocal-assignments/${id}/deactivate/`, {});
}
