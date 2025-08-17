jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

import * as SecureStore from 'expo-secure-store';
import { headers, apiGet, apiDeleteAuth, apiPostAuth } from '../api';

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
});
