import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import AnalyticsDashboard from './page';
import { getAnalytics } from '@/lib/api';

jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/roles', () => ({ requireRole: () => true }));
jest.mock('@/lib/api');

const stats = {
  complaints_by_group: [{ group: 1, total: 2 }],
  fundraising_by_group: [{ group__id: 1, total: 100 }],
  events_by_scope: [{ scope: 'GLOBAL', total: 3 }],
  surveys_participation: [{ survey__group: 1, votes: 4 }],
};

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    (getAnalytics as jest.Mock).mockReset();
  });

  it('matches snapshot', async () => {
    (getAnalytics as jest.Mock).mockResolvedValue(stats);
    const { asFragment } = render(<AnalyticsDashboard />);
    await screen.findByText('Eventos por alcance');
    expect(asFragment()).toMatchSnapshot();
  });
});
