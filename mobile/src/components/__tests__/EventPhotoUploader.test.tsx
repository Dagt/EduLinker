import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EventPhotoUploader from '../EventPhotoUploader';
import { postEventPhoto } from '../../api';
import { pickAndUpload } from '../../services/uploads';

jest.mock('../../api', () => ({
  postEventPhoto: jest.fn(),
}));

jest.mock('../../services/uploads', () => ({
  pickAndUpload: jest.fn(),
}));

describe('EventPhotoUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads selected photo', async () => {
    (pickAndUpload as jest.Mock).mockResolvedValue('http://example.com/photo.jpg');
    const { getByTestId } = render(<EventPhotoUploader eventId={1} />);
    fireEvent.press(getByTestId('photo-1'));
    await waitFor(() => {
      expect(postEventPhoto).toHaveBeenCalledWith(1, { photo_url: 'http://example.com/photo.jpg' });
    });
  });

  it('shows alert on error', async () => {
    (pickAndUpload as jest.Mock).mockRejectedValue(new Error('fail'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByTestId } = render(<EventPhotoUploader eventId={2} />);
    fireEvent.press(getByTestId('photo-2'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  });
});
