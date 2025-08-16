import { render, waitFor } from '@testing-library/react-native';
import Homeworks from '..';
import { apiGet } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ apiGet: jest.fn() }));

(apiGet as jest.Mock).mockResolvedValue([{ id:1, title:'HW1'}]);

test('loads homeworks from API', async () => {
  const { getByText } = render(<Homeworks />);
  await waitFor(() => getByText(/HW1/));
  expect(apiGet).toHaveBeenCalledWith('/homeworks/');
});
