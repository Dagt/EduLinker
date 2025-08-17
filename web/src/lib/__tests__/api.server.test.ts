import { getEngagementAnalytics } from '../api';

describe('server-side api helpers', () => {
  it('omits group query when no id is provided', async () => {
    const originalFetch = global.fetch;
    process.env.NEXT_PUBLIC_API_URL = 'http://api';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    await getEngagementAnalytics();
    expect(global.fetch).toHaveBeenCalledWith('http://api/analytics/engagement/', expect.any(Object));
    global.fetch = originalFetch;
  });
});
