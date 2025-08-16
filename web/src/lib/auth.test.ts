import { setToken, getToken, clearToken } from './auth';

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

  it('returns empty when window undefined', () => {
    const win = (global as any).window;
    // simulate server environment
    // @ts-ignore
    delete (global as any).window;
    expect(getToken()).toBe('');
    (global as any).window = win;
  });
});
