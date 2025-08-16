import { render, waitFor } from '@testing-library/react-native';
import Surveys from '..';
import { apiGet } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ apiGet: jest.fn() }));

(apiGet as jest.Mock).mockResolvedValue([{ id:1, title:'Survey 1'}]);

test('loads surveys from API', async () => {
  const { getByText } = render(<Surveys />);
  await waitFor(() => getByText(/Survey 1/));
  expect(apiGet).toHaveBeenCalledWith('/surveys/');
});
