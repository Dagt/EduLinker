import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import Dashboard from './page';
import { apiGet } from '@/lib/api';

jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/api');

const kpis = {
  complaints_by_group: [{ group: 1, total: 2 }],
  fundraising_by_group: [{ group__id: 1, total: 100 }],
  surveys_participation: [{ survey__group: 1, votes: 3 }],
};

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    (apiGet as jest.Mock).mockReset();
  });

  it('matches snapshot', async () => {
    (apiGet as jest.Mock)
      .mockResolvedValueOnce({ first_name: 'Juan', last_name: 'Pérez' })
      .mockResolvedValueOnce(kpis);
    const { asFragment } = render(<Dashboard />);
    await screen.findByText('Quejas por grupo');
    expect(asFragment()).toMatchSnapshot();
  });

  it('refreshes data', async () => {
    (apiGet as jest.Mock)
      .mockResolvedValueOnce({ first_name: 'Juan', last_name: 'Pérez' })
      .mockResolvedValueOnce(kpis)
      .mockResolvedValueOnce({ first_name: 'Juan', last_name: 'Pérez' })
      .mockResolvedValueOnce(kpis);
    render(<Dashboard />);
    await screen.findByText('Quejas por grupo');
    fireEvent.click(screen.getByText('Actualizar'));
    await waitFor(() => expect(apiGet).toHaveBeenCalledTimes(4));
    expect(apiGet).toHaveBeenNthCalledWith(2, '/analytics/overview', 'token');
    expect(apiGet).toHaveBeenNthCalledWith(4, '/analytics/overview', 'token');
  });
});
