import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../src/screens/ProfileScreen';
import { changePassword, getMe, regenerateIcsToken, updateMe } from '../src/api';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('../src/api', () => ({
  changePassword: jest.fn(),
  getMe: jest.fn(),
  regenerateIcsToken: jest.fn(),
  updateMe: jest.fn(),
}));

const profile = {
  first_name: 'Ana',
  last_name: 'Lopez',
  email: 'ana@example.com',
  role: 'DIRECTOR',
  ics_token: 'token-123',
  preferred_language: 'es',
  calendar_subscription_url: 'https://example.com/api/v1/events/ics/?token=token-123&school_id=1',
};

afterEach(() => {
  jest.clearAllMocks();
});

test('loads profile, copies calendar link, and regenerates token', async () => {
  (getMe as jest.Mock).mockResolvedValue(profile);
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
    const confirm = buttons?.find((btn: any) => btn.style === 'destructive');
    if (confirm?.onPress) confirm.onPress();
  });
  const { getByText } = render(<ProfileScreen />);

  await waitFor(() => getByText(/Ana Lopez/));
  fireEvent.press(getByText('Copy link'));
  await waitFor(() => expect(alertSpy).toHaveBeenCalled());

  fireEvent.press(getByText('Regenerate calendar token'));
  await waitFor(() => expect(regenerateIcsToken).toHaveBeenCalled());
});

test('updates profile and changes password', async () => {
  (getMe as jest.Mock).mockResolvedValue(profile);
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByText } = render(<ProfileScreen />);

  await waitFor(() => getByText('Save profile'));
  fireEvent.press(getByText('Save profile'));
  await waitFor(() => expect(updateMe).toHaveBeenCalled());

  fireEvent.press(getByText('Update password'));
  await waitFor(() => expect(changePassword).toHaveBeenCalled());
  expect(alertSpy).toHaveBeenCalled();
});
