import { listFundraisingEvents, createFundraisingEvent, createFundraisingLedger, createExpenseEvidence } from '../api';

describe('fundraising api helpers', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://api';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });
  afterEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('lists events', async () => {
    await listFundraisingEvents();
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-events/', expect.any(Object));
  });

  it('creates event', async () => {
    await createFundraisingEvent({});
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-events/', expect.objectContaining({ method: 'POST' }));
  });

  it('creates ledger', async () => {
    await createFundraisingLedger({});
    expect(global.fetch).toHaveBeenCalledWith('http://api/fundraising-ledger/', expect.objectContaining({ method: 'POST' }));
  });

  it('creates expense evidence', async () => {
    await createExpenseEvidence({});
    expect(global.fetch).toHaveBeenCalledWith('http://api/expense-evidences/', expect.objectContaining({ method: 'POST' }));
  });
});
