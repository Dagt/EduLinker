import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Homeworks from '..';
import { apiGet, postActivityPhoto } from '../../../api';
import { pickAndUpload } from '../../../services/uploads';
import { Alert } from 'react-native';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ apiGet: jest.fn(), postActivityPhoto: jest.fn() }));
jest.mock('../../../services/uploads', () => ({ pickAndUpload: jest.fn() }));

(apiGet as jest.Mock).mockResolvedValue([{ id:1, title:'HW1'}]);

test('loads homeworks from API', async () => {
  const { getByText } = render(<Homeworks />);
  await waitFor(() => getByText(/HW1/));
  expect(apiGet).toHaveBeenCalledWith('/homeworks/');
});

test('uploads photo when button pressed', async () => {
  (pickAndUpload as jest.Mock).mockResolvedValue('https://u');
  const { getByText } = render(<Homeworks />);
  await waitFor(() => getByText(/HW1/));
  fireEvent.press(getByText('Subir evidencia'));
  await waitFor(() => expect(postActivityPhoto).toHaveBeenCalledWith({ homework: 1, photo_url: 'https://u' }));
});

test('shows alert on upload error', async () => {
  (pickAndUpload as jest.Mock).mockRejectedValue(new Error('fail'));
  const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByText } = render(<Homeworks />);
  await waitFor(() => getByText(/HW1/));
  fireEvent.press(getByText('Subir evidencia'));
  await waitFor(() => expect(spy).toHaveBeenCalled());
});
