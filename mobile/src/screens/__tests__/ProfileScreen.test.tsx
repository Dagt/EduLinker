import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../ProfileScreen';
import { apiGet } from '../../api';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('../../api', () => ({ apiGet: jest.fn() }));

const profile = {
  first_name: 'Ana',
  last_name: 'Lopez',
  email: 'ana@example.com',
  role: 'DIRECTOR',
  ics_token: 'token-123',
  calendar_subscription_url: 'https://example.com/api/v1/events/ics/?token=token-123&school_id=1',
};

afterEach(() => {
  jest.clearAllMocks();
});

test('renders profile and copies calendar link', async () => {
  (apiGet as jest.Mock).mockResolvedValue(profile);
  const alertSpy = jest.spyOn(Alert, 'alert');
  const { getByText } = render(<ProfileScreen />);
  await waitFor(() => getByText(/Ana Lopez/));
  fireEvent.press(getByText('Copy link'));
  await waitFor(() => expect(alertSpy).toHaveBeenCalled());
});
