jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}), { virtual: true });

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from './api';

beforeEach(() => {
  (AsyncStorage.getItem as jest.Mock).mockReset();
  (AsyncStorage.setItem as jest.Mock).mockReset();
});

test('uses stored school id from AsyncStorage', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('5');
  const h = await api.headers();
  expect(h['X-School-ID']).toBe('5');
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('derives school id from domain when not stored', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  process.env.EXPO_PUBLIC_DOMAIN = '7.example.com';
  const h = await api.headers();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('schoolId', '7');
  expect(h['X-School-ID']).toBe('7');
});

test('setSchoolId stores provided value', async () => {
  await api.setSchoolId('9');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('schoolId', '9');
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
    const url = await api.uploadFile('file://a.jpg', 'image/jpeg');
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
    await expect(api.uploadFile('file://a.jpg', 'image/jpeg')).rejects.toThrow('upload failed');
  });
});

test('updateComplaint sends PUT request', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  await api.updateComplaint(5, { content: 'c' });
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/complaints/5/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('PUT');
});

test('updateSuggestion sends PUT request', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  await api.updateSuggestion(3, { title: 't' });
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/suggestions/3/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('PUT');
});

test('deleteComplaint sends DELETE request', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });
  await api.deleteComplaint(2);
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/complaints/2/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
});

test('deleteSuggestion sends DELETE request', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
  (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });
  await api.deleteSuggestion(4);
  expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/suggestions/4/');
  expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
});

test('apiGet retries after refresh on 401', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
  const SecureStore = require('expo-secure-store');
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('old');
  (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
  const origFetch = global.fetch;
  (global as any).fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 401, statusText: 'unauth' })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access: 'new' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ a: 1 }) });
  const data = await api.apiGet('/x');
  expect((fetch as jest.Mock).mock.calls.length).toBe(3);
  expect(data).toEqual({ a: 1 });
  global.fetch = origFetch;
});
