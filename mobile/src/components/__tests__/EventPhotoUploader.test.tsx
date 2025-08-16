import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EventPhotoUploader from '../EventPhotoUploader';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, postEventPhoto } from '../../api';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../../api', () => ({
  uploadFile: jest.fn(),
  postEventPhoto: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

describe('EventPhotoUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads selected photo', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'photo.jpg' }],
    });
    (uploadFile as jest.Mock).mockResolvedValue('http://example.com/photo.jpg');
    const { getByTestId } = render(<EventPhotoUploader eventId={1} />);
    fireEvent.press(getByTestId('photo-1'));
    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith('photo.jpg', 'image/jpeg');
      expect(postEventPhoto).toHaveBeenCalledWith(1, { url: 'http://example.com/photo.jpg' });
    });
  });

  it('shows alert on error', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'bad.jpg' }],
    });
    (uploadFile as jest.Mock).mockRejectedValue(new Error('fail'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<EventPhotoUploader eventId={2} />);
    fireEvent.press(getByTestId('photo-2'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  });
});
