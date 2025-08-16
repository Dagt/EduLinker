import * as api from './api';

describe('schoolIdFromHost', () => {
  it('extracts subdomain', () => {
    expect(api.schoolIdFromHost('school.example.com')).toBe('school');
  });

  it('strips port', () => {
    expect(api.schoolIdFromHost('school.example.com:3000')).toBe('school');
  });
});

describe('authHeaders', () => {
  it('maps subdomain to X-School-ID', () => {
    const h = api.authHeaders();
    expect(h['X-School-ID']).toBe(api.schoolIdFromHost());
  });
});
