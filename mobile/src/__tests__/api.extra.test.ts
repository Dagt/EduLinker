jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}), { virtual: true });

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { headers, apiGet, apiDeleteAuth, apiPostAuth, setRefreshToken, getRefreshToken } from '../api';

describe('api helpers extra', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('tk');
    (global as any).fetch = jest.fn();
  });

  it('adds Authorization header when token provided', async () => {
    const h = await headers('jwt');
    expect(h.Authorization).toBe('Bearer jwt');
  });

  it('apiGet throws on error status', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500, statusText: 'err' });
    await expect(apiGet('/x')).rejects.toThrow('500 err');
  });

  it('apiDeleteAuth returns undefined on 204', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, status: 204 });
    const result = await apiDeleteAuth('/y');
    expect(result).toBeUndefined();
  });

  it('apiPostAuth sends POST request', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    await apiPostAuth('/z', { a: 1 });
    expect((fetch as jest.Mock).mock.calls[0][0]).toContain('/z');
    expect((fetch as jest.Mock).mock.calls[0][1].method).toBe('POST');
  });

  it('stores and retrieves refresh token', async () => {
    await setRefreshToken('ref');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('rtk', 'ref');
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('ref');
    expect(await getRefreshToken()).toBe('ref');
  });
});
