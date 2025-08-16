import { pickAndUpload } from '../services/uploads';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../api';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('../api', () => ({ uploadFile: jest.fn() }));

describe('pickAndUpload', () => {
  it('uploads selected image', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://photo.jpg' }],
    });
    (uploadFile as jest.Mock).mockResolvedValue('https://remote');
    const url = await pickAndUpload('image/jpeg');
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(uploadFile).toHaveBeenCalledWith('file://photo.jpg', 'image/jpeg');
    expect(url).toBe('https://remote');
  });

  it('returns null when user cancels', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
    });
    const url = await pickAndUpload();
    expect(url).toBeNull();
  });
});
