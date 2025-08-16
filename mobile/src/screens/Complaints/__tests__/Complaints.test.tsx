import { render, waitFor } from '@testing-library/react-native';
import Complaints from '..';
import { apiGet } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ apiGet: jest.fn() }));

(apiGet as jest.Mock).mockResolvedValue([{ id:1, title:'Test Complaint'}]);

test('loads complaints from API', async () => {
  const { getByText } = render(<Complaints />);
  await waitFor(() => getByText(/Test Complaint/));
  expect(apiGet).toHaveBeenCalledWith('/complaints/');
});
