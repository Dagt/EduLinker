import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Calendar from '../screens/Calendar';
import { apiGet, postEventPhoto, uploadFile } from '../api';
import { getRole } from '../role';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../api', () => ({ apiGet: jest.fn(), postEventPhoto: jest.fn(), uploadFile: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock(
  'expo-notifications',
  () => ({
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    scheduleNotificationAsync: jest.fn(),
  }),
  { virtual: true }
);
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(), MediaTypeOptions: { Images: 'Images' } }));

const role = require('../role');
const notifs = require('expo-notifications');
const picker = require('expo-image-picker');

(apiGet as jest.Mock).mockResolvedValue([
  { id: 1, title: 'Event 1', start_at: '2025-01-01T10:00:00Z' },
]);
(role.getRole as jest.Mock).mockResolvedValue('student');

jest.setTimeout(10000);

test('loads events and schedules reminder', async () => {
  const { getByText, getByTestId } = render(<Calendar />);
  await waitFor(() => getByText(/Event 1/));
  expect(apiGet).toHaveBeenCalledWith('/events/');
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() =>
    expect(notifs.scheduleNotificationAsync).toHaveBeenCalled()
  );
});

test('uploads photo for event', async () => {
  (picker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://e.jpg' }] });
  (uploadFile as jest.Mock).mockResolvedValue('https://p');
  const { getByTestId } = render(<Calendar />);
  await waitFor(() => getByTestId('photo-1'));
  fireEvent.press(getByTestId('photo-1'));
  await waitFor(() => expect(postEventPhoto).toHaveBeenCalledWith(1, { url: 'https://p' }));
});

test('shows alert on photo error', async () => {
  (picker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://e.jpg' }] });
  (uploadFile as jest.Mock).mockRejectedValue(new Error('err'));
  const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByTestId } = render(<Calendar />);
  await waitFor(() => getByTestId('photo-1'));
  fireEvent.press(getByTestId('photo-1'));
  await waitFor(() => expect(spy).toHaveBeenCalled());
});

test('shows unauthorized for guest role', async () => {
  (role.getRole as jest.Mock).mockResolvedValueOnce('guest');
  const { getByText } = render(<Calendar />);
  await waitFor(() => getByText('No autorizado'));
});

test('alerts when notification permission denied', async () => {
  (notifs.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
  const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByTestId } = render(<Calendar />);
  await waitFor(() => getByTestId('remind-1'));
  fireEvent.press(getByTestId('remind-1'));
  await waitFor(() => expect(spy).toHaveBeenCalled());
});

