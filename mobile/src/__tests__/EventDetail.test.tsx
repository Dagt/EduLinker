import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import EventDetail from '../screens/EventDetail';
import { apiGet, apiPost } from '../api';
import { getRole } from '../role';
import { pickAndUpload } from '../services/uploads';
import { Linking } from 'react-native';

jest.mock('../api', () => ({ apiGet: jest.fn(), apiPost: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('../services/uploads', () => ({ pickAndUpload: jest.fn() }));
jest.mock('react-native/Libraries/Linking/Linking', () => ({ openURL: jest.fn() }));

const apiGetMock = apiGet as jest.Mock;
const apiPostMock = apiPost as jest.Mock;
const getRoleMock = getRole as jest.Mock;
const uploadMock = pickAndUpload as jest.Mock;
const openURLMock = Linking.openURL as jest.Mock;

test('renders data and opens attachment', async () => {
  getRoleMock.mockResolvedValue('MAESTRO_TITULAR');
  apiGetMock
    .mockResolvedValueOnce({ id: 1, title: 'Event', start_at: '2025-01-01' })
    .mockResolvedValueOnce([{ id: 1, file_url: 'https://f', filename: 'file.pdf' }])
    .mockResolvedValueOnce([]);
  const { getByText } = render(<EventDetail eventId={1} />);
  await waitFor(() => expect(apiGetMock).toHaveBeenCalledTimes(3));
  fireEvent.press(getByText('file.pdf'));
  expect(openURLMock).toHaveBeenCalledWith('https://f');
});

test('uploads attachment when allowed', async () => {
  getRoleMock.mockResolvedValue('MAESTRO_TITULAR');
  apiGetMock
    .mockResolvedValueOnce({ id: 1, title: 'Event', start_at: '2025-01-01' })
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id: 2, file_url: 'https://u', filename: 'u.pdf' }]);
  uploadMock.mockResolvedValue('https://u');
  const { getByTestId } = render(<EventDetail eventId={1} />);
  await waitFor(() => getByTestId('upload-attachment'));
  fireEvent.press(getByTestId('upload-attachment'));
  await waitFor(() => expect(apiPostMock).toHaveBeenCalled());
});

test('hides upload button for parents', async () => {
  getRoleMock.mockResolvedValue('PADRE');
  apiGetMock
    .mockResolvedValueOnce({ id: 1, title: 'Event', start_at: '2025-01-01' })
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([]);
  const { queryByTestId } = render(<EventDetail eventId={1} />);
  await waitFor(() => expect(apiGetMock).toHaveBeenCalled());
  expect(queryByTestId('upload-attachment')).toBeNull();
});
