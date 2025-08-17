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

describe('api helpers', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://api';
    global.fetch = jest.fn();
    window.localStorage.clear();
  });
  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('apiGet returns json', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ a: 1 }) });
    const data = await api.apiGet('/x');
    expect(data).toEqual({ a: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://api/x', expect.any(Object));
  });

  it('apiPost sends body and returns json', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ b: 2 }) });
    const data = await api.apiPost('/y', { b: 2 });
    expect(data).toEqual({ b: 2 });
    expect(global.fetch).toHaveBeenCalledWith('http://api/y', expect.objectContaining({ method: 'POST' }));
  });

  it('apiGet throws on error status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'err', json: async () => ({ detail: 'boom' }) });
    await expect(api.apiGet('/x')).rejects.toThrow('boom');
  });

  it('apiPost throws on error status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 400, statusText: 'bad', json: async () => ({ detail: 'fail' }) });
    await expect(api.apiPost('/y', {})).rejects.toThrow('fail');
  });
  it('apiPatch sends body and returns json', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ c: 3 }) });
    const data = await api.apiPatch('/z', { c: 3 });
    expect(data).toEqual({ c: 3 });
    expect(global.fetch).toHaveBeenCalledWith('http://api/z', expect.objectContaining({ method: 'PATCH' }));
  });
  it('apiPatch throws on error status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404, statusText: 'missing', json: async () => ({ detail: 'oops' }) });
    await expect(api.apiPatch('/z', {})).rejects.toThrow('oops');
  });

  it('apiDelete sends delete and returns json', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.apiDelete('/w');
    expect(global.fetch).toHaveBeenCalledWith('http://api/w', expect.objectContaining({ method: 'DELETE' }));
  });

  it('apiDelete throws on error status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'err', json: async () => ({ detail: 'bad' }) });
    await expect(api.apiDelete('/w')).rejects.toThrow('bad');
  });

  it('apiDelete returns undefined on 204', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}) });
    const data = await api.apiDelete('/w');
    expect(data).toBeUndefined();
  });

  it('apiGet falls back to status text when no detail', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'err', json: async () => { throw new Error('x'); } });
    await expect(api.apiGet('/x')).rejects.toThrow('500 err');
  });

  it('retries once on 401 with refresh', async () => {
    window.localStorage.setItem('edulinker_refresh','r1');
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ status:401, ok:false, json: async()=>({}) })
      .mockResolvedValueOnce({ ok:true, json: async()=>({ access:'a2', refresh:'r2' }) })
      .mockResolvedValueOnce({ ok:true, json: async()=>({ d:4 }) });
    const data = await api.apiGet('/p');
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe('http://api/auth/refresh/');
    expect(data).toEqual({ d:4 });
  });
  it('updateSuggestionStatus posts', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.updateSuggestionStatus(1, 'closed');
    expect(global.fetch).toHaveBeenCalledWith('http://api/suggestions/1/status', expect.objectContaining({ method: 'POST' }));
  });

  it('getFundraisingEventSummary fetches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.getFundraisingEventSummary(2);
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-events/2/summary/', expect.any(Object));
  });

  it('getFundraisingEvent fetches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.getFundraisingEvent(5);
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-events/5', expect.any(Object));
  });

  it('updateFundraisingEvent patches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.updateFundraisingEvent(5, { name: 'x' });
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-events/5', expect.objectContaining({ method: 'PATCH' }));
  });

  it('deleteFundraisingEvent deletes', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.deleteFundraisingEvent(5);
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-events/5', expect.objectContaining({ method: 'DELETE' }));
  });

  it('getAnalytics fetches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.getAnalytics();
    expect(global.fetch).toHaveBeenCalledWith('http://api/analytics/overview/', expect.any(Object));
  });

  it('getComplaintsAnalytics fetches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.getComplaintsAnalytics();
    expect(global.fetch).toHaveBeenCalledWith('http://api/analytics/complaints/', expect.any(Object));
  });

  it('getFundraisingAnalytics fetches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.getFundraisingAnalytics();
    expect(global.fetch).toHaveBeenCalledWith('http://api/analytics/fundraising/', expect.any(Object));
  });

  it('getEngagementAnalytics fetches', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.getEngagementAnalytics(1);
    expect(global.fetch).toHaveBeenCalledWith('http://api/analytics/engagement/?group_id=1', expect.any(Object));
  });

  it('voteSurvey posts', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await api.voteSurvey(3,4);
    expect(global.fetch).toHaveBeenCalledWith('http://api/surveys/3/vote', expect.objectContaining({ method: 'POST' }));
  });
});

describe('authHeaders token', () => {
  it('adds Authorization header when token provided', () => {
    const h = api.authHeaders('tk');
    expect(h['Authorization']).toBe('Bearer tk');
  });
});
