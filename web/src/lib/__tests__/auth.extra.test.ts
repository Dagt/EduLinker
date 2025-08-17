import { getToken, tokenKey } from '../auth';

describe('getToken', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (k: string) => store[k],
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
      },
      writable: true,
    });
  });

  it('returns empty string when no token stored', () => {
    expect(getToken()).toBe('');
  });

  it('returns empty string when token key exists but empty', () => {
    window.localStorage.setItem(tokenKey, '');
    expect(getToken()).toBe('');
  });
});
