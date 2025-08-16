import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";

export type Suggestion = { id: number; title: string; description: string };
export type SuggestionPayload = { title: string; description: string; group?: number | null };

export async function listSuggestions(): Promise<Suggestion[]> {
  const tk = getToken();
  return apiGet<Suggestion[]>("/suggestions/", tk);
}

export async function createSuggestion(body: SuggestionPayload): Promise<Suggestion> {
  const tk = getToken();
  return apiPost<Suggestion>("/suggestions/", body, tk);
}

export async function getSuggestion(id: number): Promise<Suggestion> {
  const tk = getToken();
  return apiGet<Suggestion>(`/suggestions/${id}/`, tk);
}

export async function deleteSuggestion(id: number): Promise<void> {
  const tk = getToken();
  return apiDelete(`/suggestions/${id}/`, tk);
}
