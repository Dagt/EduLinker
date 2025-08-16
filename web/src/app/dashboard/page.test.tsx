import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import Dashboard from './page';

jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/api', () => ({ apiGet: async () => ({}) }));

describe('Dashboard', () => {
  it('renders welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Bienvenido/)).toBeInTheDocument();
  });
});
