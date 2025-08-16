import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Calendar from '../Calendar';
import { apiGet } from '../../api';
import { getRole } from '../../role';
import { Alert } from 'react-native';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}), { virtual: true });
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}), { virtual: true });
jest.mock('../../api', () => ({
  apiGet: jest.fn(),
}));
jest.mock('../../role', () => ({ getRole: jest.fn() }));

const Notifications = require('expo-notifications');

const sampleEvents = [{ id: 1, title: 'Event 1', start_at: '2024-01-01T00:00:00Z' }];

beforeEach(() => {
  (apiGet as jest.Mock).mockResolvedValue(sampleEvents);
  (getRole as jest.Mock).mockResolvedValue('parent');
});

afterEach(() => {
  jest.clearAllMocks();
});

test('schedules reminder when permissions granted', async () => {
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  const { getByTestId, getByText } = render(<Calendar />);
  await waitFor(() => getByText(/Event 1/));
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled());
});

test('alerts when notification permission denied', async () => {
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
  const alertSpy = jest.spyOn(Alert, 'alert');
  const { getByTestId, getByText } = render(<Calendar />);
  await waitFor(() => getByText(/Event 1/));
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
});

