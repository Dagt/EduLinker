import { setToken, getToken, clearToken, setRefreshToken, getRefreshToken, clearRefreshToken, refreshToken } from './auth';

describe('auth token helpers', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (k: string) => store[k],
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
      },
      writable: true
    });
  });

  it('stores and retrieves token', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
  });

  it('clears token', () => {
    setToken('abc');
    clearToken();
    expect(getToken()).toBe('');
  });

  it('stores and clears refresh token', () => {
    setRefreshToken('def');
    expect(getRefreshToken()).toBe('def');
    clearRefreshToken();
    expect(getRefreshToken()).toBe('');
  });

  it('refreshToken updates access token', async () => {
    setRefreshToken('r1');
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ access: 'newA', refresh: 'newR' }) });
    const ok = await refreshToken();
    expect(ok).toBe(true);
    expect(getToken()).toBe('newA');
    expect(getRefreshToken()).toBe('newR');
  });

  it('refreshToken returns false when missing', async () => {
    clearRefreshToken();
    const ok = await refreshToken();
    expect(ok).toBe(false);
  });

  it('returns empty when window undefined', () => {
    const win = (global as any).window;
    // simulate server environment
    // @ts-ignore
    delete (global as any).window;
    expect(getToken()).toBe('');
    (global as any).window = win;
  });
});
