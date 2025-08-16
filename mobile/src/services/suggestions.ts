import { apiGet, apiPost, apiPutAuth } from "../api";

export function getSuggestions(){
  return apiGet("/suggestions/");
}

export function createSuggestion(body: {
  title: string;
  description: string;
  group_id: number;
  target_teacher_id: number;
  about_student_id?: number;
}){
  return apiPost("/suggestions/", body);
}

export function updateSuggestion(id: number, body: any){
  return apiPutAuth(`/suggestions/${id}/`, body);
}

export function getSuggestionMessages(id: number){
  return apiGet(`/suggestions/${id}/messages/`);
}

export function sendSuggestionMessage(id: number, body: any){
  return apiPost(`/suggestions/${id}/messages/`, body);
}
