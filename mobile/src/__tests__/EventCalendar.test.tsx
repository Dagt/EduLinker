import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import EventCalendar from '../screens/EventCalendar';
import { getEvents } from '../api';
import { getRole } from '../role';
import * as Notifications from 'expo-notifications';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../api', () => ({ getEvents: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock(
  'expo-notifications',
  () => ({
    requestPermissionsAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
  }),
  { virtual: true }
);

const api = require('../api');
const role = require('../role');
const notifs = require('expo-notifications');

beforeEach(() => {
  jest.clearAllMocks();
  (api.getEvents as jest.Mock).mockResolvedValue([
    { id: 1, title: 'Event 1', start_at: '2025-01-01T10:00:00Z' },
  ]);
  (role.getRole as jest.Mock).mockResolvedValue('student');
});

test('loads events and schedules reminder when permitted', async () => {
  (notifs.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  const { getByText, getByTestId } = render(<EventCalendar />);
  await waitFor(() => getByText(/Event 1/));
  expect(api.getEvents).toHaveBeenCalled();
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() =>
    expect(notifs.scheduleNotificationAsync).toHaveBeenCalled()
  );
});

test('does not schedule reminder when permission denied', async () => {
  (notifs.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
  const { getByText, getByTestId } = render(<EventCalendar />);
  await waitFor(() => getByText(/Event 1/));
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() => expect(notifs.scheduleNotificationAsync).not.toHaveBeenCalled());
});

