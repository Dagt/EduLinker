import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ActivityPhotos from '../ActivityPhotos';
import { apiGet, postActivityPhoto } from '../../api';
import { pickAndUpload } from '../../services/uploads';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../api', () => ({ apiGet: jest.fn(), postActivityPhoto: jest.fn() }));
jest.mock('../../services/uploads', () => ({ pickAndUpload: jest.fn() }));
jest.mock('../../role', () => ({ getRole: jest.fn() }));

beforeEach(() => {
  (apiGet as jest.Mock).mockResolvedValue([{ id: 1, photo_url: 'https://x' }]);
});

test('loads photos and allows upload for authorized roles', async () => {
  const { getRole } = require('../../role');
  (getRole as jest.Mock).mockResolvedValue('MAESTRO_TITULAR');
  const { getByText } = render(<ActivityPhotos groupId={1} />);
  await waitFor(() => expect(apiGet).toHaveBeenCalledWith('/groups/1/activity-photos/'));
  (pickAndUpload as jest.Mock).mockResolvedValue('https://u');
  fireEvent.press(getByText('Upload photo'));
  await waitFor(() => expect(postActivityPhoto).toHaveBeenCalledWith({ group: 1, photo_url: 'https://u' }));
});

test('hides upload button for unauthorized roles', async () => {
  const { getRole } = require('../../role');
  (getRole as jest.Mock).mockResolvedValue('PADRE');
  const { queryByText } = render(<ActivityPhotos groupId={1} />);
  await waitFor(() => expect(apiGet).toHaveBeenCalled());
  expect(queryByText('Upload photo')).toBeNull();
});
