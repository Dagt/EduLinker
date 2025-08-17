jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

import * as SecureStore from 'expo-secure-store';
import * as api from '../api';
const { headers, apiGet, apiDelete, apiPost } = api;

describe('api helpers extra', () => {
  beforeEach(() => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('tk');
    (global as any).fetch = jest.fn();
    process.env.EXPO_PUBLIC_API_URL = 'https://api';
    process.env.EXPO_PUBLIC_SCHOOL_ID = '1';
  });

  it('adds Authorization header when token provided', async () => {
    const h = await headers('jwt');
    expect(h.Authorization).toBe('Bearer jwt');
  });

  it('apiGet throws on error status', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500, statusText: 'err' });
    await expect(apiGet('/x')).rejects.toThrow('500 err');
  });

  it('apiDelete returns undefined on 204', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204 });
    const result = await apiDelete('/y');
    expect(result).toBeUndefined();
  });

  it('apiDelete returns body when not 204', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200, json: async () => ({ done: true }) });
    const result = await apiDelete('/y');
    expect(result).toEqual({ done: true });
  });

  it('apiPost sends POST request', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    await apiPost('/z', { a: 1 });
    expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/z');
    expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('POST');
  });

  it('apiPost throws on error status', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 400, statusText: 'bad' });
    await expect(apiPost('/z', { a: 1 })).rejects.toThrow('400 bad');
  });

  it('wrap helper calls', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    await api.getNotificationPreferences();
    await api.updateNotificationPreferences({ a: true });
    await api.getComplaints();
    await api.createComplaint({ content: '', group_id: 1, target_teacher_id: 1 });
    await api.updateComplaint(1, {});
    await api.getComplaintMessages(1);
    await api.sendComplaintMessage(1, {});
    await api.escalateComplaint(1);
    await api.getSuggestions();
    await api.createSuggestion({ title: '', description: '', group_id: 1, target_teacher_id: 1 });
    await api.updateSuggestion(1, {});
    await api.getSuggestionMessages(1);
    await api.sendSuggestionMessage(1, {});
    await api.deleteSuggestion(1);
    await api.postActivityPhoto({});
    await api.postEventPhoto(1, {});
    await api.getSurveys();
    await api.getSurvey(1);
    await api.voteSurvey(1, 0);
    await api.getSurveyResults(1);
    await api.getFundraisingSummary(1);
    await api.createFundraisingLedger({ event: 1, group: 1, amount_collected: '1' });
    await api.createExpenseEvidence({ file_url: 'u', amount: '1', concept: 'c' });
  });
});
