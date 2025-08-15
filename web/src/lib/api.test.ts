import { authHeaders } from './api';

describe('authHeaders', () => {
  it('includes X-School-ID', () => {
    const h = authHeaders();
    expect(h['X-School-ID']).toBeDefined();
  });
});
