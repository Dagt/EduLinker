import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
jest.mock('next-intl');
import Dashboard from './page';

jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));

const mockApiGet = jest.fn(async (path: string) => {
  if (path === '/me/') return { first_name: 'John', last_name: 'Doe' };
  if (path === '/analytics/overview/') return {
    complaints_by_group: [{ group: 1, total: 2 }],
    fundraising_by_group: [{ group__id: 1, total: 100 }],
    surveys_participation: [{ survey__group: 1, votes: 5 }]
  };
  return {};
});

jest.mock('@/lib/api', () => ({ apiGet: (path: string) => mockApiGet(path) }));

describe('Dashboard', () => {
  it('matches snapshot with charts', async () => {
    const { asFragment, findByTestId } = render(<Dashboard />);
    await findByTestId('complaints-chart');
    expect(asFragment()).toMatchSnapshot();
  });

  it('refreshes data on button click', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    const button = await screen.findByRole('button', { name: /Actualizar/i });
    await user.click(button);
    const analyticsCalls = mockApiGet.mock.calls.filter(c => c[0] === '/analytics/overview/');
    expect(analyticsCalls.length).toBeGreaterThanOrEqual(2);
  });
});
