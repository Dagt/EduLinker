import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import EventCalendar from '../screens/EventCalendar';
import { apiGet } from '../api';
import { getRole } from '../role';
import * as Notifications from 'expo-notifications';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../api', () => ({ apiGet: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock(
  'expo-notifications',
  () => ({
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    scheduleNotificationAsync: jest.fn(),
  }),
  { virtual: true }
);

const api = require('../api');
const role = require('../role');
const notifs = require('expo-notifications');

(api.apiGet as jest.Mock).mockResolvedValue([
  { id: 1, title: 'Event 1', start_at: '2025-01-01T10:00:00Z' },
]);
(role.getRole as jest.Mock).mockResolvedValue('student');

test('loads events and schedules reminder', async () => {
  const { getByText, getByTestId } = render(<EventCalendar />);
  await waitFor(() => getByText(/Event 1/));
  expect(api.apiGet).toHaveBeenCalledWith('/events/');
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() =>
    expect(notifs.scheduleNotificationAsync).toHaveBeenCalled()
  );
});

