jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

import * as SecureStore from 'expo-secure-store';
import { headers, uploadFile, updateComplaint, updateSuggestion, deleteComplaint, deleteSuggestion, refreshToken, apiGet } from './api';
import { assignVocal, deactivateVocal } from './api';

beforeEach(() => {
  (SecureStore.getItemAsync as jest.Mock).mockReset();
  (SecureStore.setItemAsync as jest.Mock).mockReset();
  process.env.EXPO_PUBLIC_API_URL = 'https://api';
  process.env.EXPO_PUBLIC_SCHOOL_ID = '1';
});

test('headers uses EXPO_PUBLIC_SCHOOL_ID', async () => {
  process.env.EXPO_PUBLIC_SCHOOL_ID = '5';
  const h = await headers();
  expect(h['X-School-ID']).toBe('5');
});

describe('uploadFile', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  test('uploads file and returns url', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ upload_url: 'https://u', file_url: 'https://f' }) })
      .mockResolvedValueOnce({ blob: async () => 'B' })
      .mockResolvedValueOnce({ ok: true });
    const url = await uploadFile('file://a.jpg', 'image/jpeg');
    expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/storage/presign-upload/');
    expect((fetch as jest.Mock).mock.calls[1][0]).toBe('file://a.jpg');
    expect((fetch as jest.Mock).mock.calls[2][0]).toBe('https://u');
    expect(url).toBe('https://f');
  });

  test('throws on upload failure', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ upload_url: 'https://u', file_url: 'https://f' }) })
      .mockResolvedValueOnce({ blob: async () => 'B' })
      .mockResolvedValueOnce({ ok: false });
    await expect(uploadFile('file://a.jpg', 'image/jpeg')).rejects.toThrow('upload failed');
  });
});

test('updateComplaint sends PUT request', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  await updateComplaint(5, { content: 'c' });
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/complaints/5/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('PUT');
});

test('updateSuggestion sends PUT request', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  await updateSuggestion(3, { title: 't' });
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/suggestions/3/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('PUT');
});

test('deleteComplaint sends DELETE request', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });
  await deleteComplaint(2);
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/complaints/2/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
});

test('deleteSuggestion sends DELETE request', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });
  await deleteSuggestion(4);
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/suggestions/4/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
});

test('refreshToken updates stored access', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockImplementation((k: string) => k === 'rf' ? 'r1' : null);
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ access: 'a2', refresh: 'r2' }) });
  const ok = await refreshToken();
  expect(ok).toBe(true);
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('tk', 'a2');
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('rf', 'r2');
});

test('refreshToken returns false without stored refresh', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
  const ok = await refreshToken();
  expect(ok).toBe(false);
});

test('apiGet retries after 401 using refresh', async () => {
  (SecureStore.getItemAsync as jest.Mock).mockImplementation((k: string) => k === 'rf' ? 'r1' : null);
  (global as any).fetch = jest.fn()
    .mockResolvedValueOnce({ status: 401, ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access: 'a2', refresh: 'r2' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ v: 1 }) });
  const data = await apiGet('/p');
  expect((fetch as jest.Mock).mock.calls[1][0]).toContain('/auth/refresh/');
  expect(data).toEqual({ v: 1 });
});

test('assignVocal posts to endpoint', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  await assignVocal({ group: 1, parent: 2 });
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/groups/vocal-assignments/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('POST');
});

test('deactivateVocal posts to deactivate endpoint', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  await deactivateVocal(5);
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/groups/vocal-assignments/5/deactivate/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('POST');
});
