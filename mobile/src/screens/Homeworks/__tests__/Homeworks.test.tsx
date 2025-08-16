import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Homeworks from '..';
import { apiGet, postActivityPhoto, uploadFile } from '../../../api';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ apiGet: jest.fn(), postActivityPhoto: jest.fn(), uploadFile: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn(), MediaTypeOptions: { Images: 'Images' } }));

(apiGet as jest.Mock).mockResolvedValue([{ id:1, title:'HW1'}]);

test('loads homeworks from API', async () => {
  const { getByText } = render(<Homeworks />);
  await waitFor(() => getByText(/HW1/));
  expect(apiGet).toHaveBeenCalledWith('/homeworks/');
});

test('uploads photo when button pressed', async () => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://a.jpg' }] });
  (uploadFile as jest.Mock).mockResolvedValue('https://u');
  const { getByText } = render(<Homeworks />);
  fireEvent.press(getByText('Subir Foto'));
  await waitFor(() => expect(postActivityPhoto).toHaveBeenCalledWith({ url: 'https://u' }));
});

test('shows alert on upload error', async () => {
  (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [{ uri: 'file://a.jpg' }] });
  (uploadFile as jest.Mock).mockRejectedValue(new Error('fail'));
  const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByText } = render(<Homeworks />);
  fireEvent.press(getByText('Subir Foto'));
  await waitFor(() => expect(spy).toHaveBeenCalled());
});
