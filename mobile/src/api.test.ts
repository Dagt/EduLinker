jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

import * as SecureStore from 'expo-secure-store';
import { headers, uploadFile, updateComplaint, updateSuggestion, deleteComplaint, deleteSuggestion } from './api';

beforeEach(() => {
  (SecureStore.getItemAsync as jest.Mock).mockReset();
  (SecureStore.setItemAsync as jest.Mock).mockReset();
  process.env.EXPO_PUBLIC_API_URL = 'https://api';
  process.env.EXPO_PUBLIC_SCHOOL_ID = '5';
});

test('headers include school id from env', async () => {
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
