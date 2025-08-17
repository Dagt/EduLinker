import { setTokens, getToken, getRefreshToken, clearToken, refreshToken } from './auth';

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

  it('stores and retrieves tokens', () => {
    setTokens('a','r');
    expect(getToken()).toBe('a');
    expect(getRefreshToken()).toBe('r');
  });

  it('clears tokens', () => {
    setTokens('a','r');
    clearToken();
    expect(getToken()).toBe('');
    expect(getRefreshToken()).toBe('');
  });

  it('refreshToken updates access', async () => {
    setTokens('old','ref');
    const origFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ access: 'new' }) }) as any;
    await refreshToken();
    expect(getToken()).toBe('new');
    global.fetch = origFetch;
  });

  it('returns empty when window undefined', () => {
    const win = (global as any).window;
    // simulate server environment
    // @ts-ignore
    delete (global as any).window;
    expect(getToken()).toBe('');
    expect(getRefreshToken()).toBe('');
    (global as any).window = win;
  });
});
