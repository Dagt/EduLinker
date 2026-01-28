import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ProfilePage from './page';
import { getMe } from '@/lib/api';

jest.mock('@/lib/api');

const profile = {
  first_name: 'Ana',
  last_name: 'Lopez',
  email: 'ana@example.com',
  role: 'DIRECTOR',
  ics_token: 'token-123',
  preferred_language: 'es',
  calendar_subscription_url: 'https://example.com/api/v1/events/ics/?token=token-123&school_id=1',
};

beforeEach(() => {
  (getMe as jest.Mock).mockResolvedValue(profile);
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders profile details and copies calendar link', async () => {
  render(<ProfilePage />);
  await screen.findByText('Perfil');
  expect(screen.getByText('Ana Lopez')).toBeInTheDocument();
  expect(screen.getByText('ana@example.com')).toBeInTheDocument();
  const button = screen.getByText('Copiar enlace');
  fireEvent.click(button);
  await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(profile.calendar_subscription_url));
});
