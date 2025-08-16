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
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'err' });
    await expect(api.apiGet('/x')).rejects.toThrow('500 err');
  });

  it('apiPost throws on error status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 400, statusText: 'bad' });
    await expect(api.apiPost('/y', {})).rejects.toThrow('400 bad');
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
