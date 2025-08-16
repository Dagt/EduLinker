import { userRole, requireRole } from '../roles';

describe('roles helpers', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('returns guest when window is undefined', () => {
    const original = (global as any).window;
    // simulate server side
    delete (global as any).window;
    expect(userRole()).toBe('guest');
    (global as any).window = original;
  });

  it('reads role from localStorage', () => {
    localStorage.setItem('role', 'admin');
    expect(userRole()).toBe('admin');
  });

  it('checks allowed roles', () => {
    localStorage.setItem('role', 'admin');
    expect(requireRole(['admin', 'teacher'])).toBe(true);
    expect(requireRole(['student'])).toBe(false);
  });
});
