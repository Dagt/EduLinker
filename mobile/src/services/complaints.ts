import { apiGet, apiPost, apiPut } from "../api";

export function getComplaints(){
  return apiGet("/complaints/");
}

export function createComplaint(body: {
  content: string;
  group_id: number;
  target_teacher_id: number;
  about_student_id?: number;
}){
  return apiPost("/complaints/", body);
}

export function updateComplaint(id: number, body: any){
  return apiPut(`/complaints/${id}/`, body);
}

export function getComplaintMessages(id: number){
  return apiGet(`/complaints/${id}/messages/`);
}

export function sendComplaintMessage(id: number, body: any){
  return apiPost(`/complaints/${id}/messages/`, body);
}
