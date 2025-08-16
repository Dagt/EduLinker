import { render, waitFor } from '@testing-library/react-native';
import Surveys from '..';
import { getSurveys } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ getSurveys: jest.fn() }));

const now = Date.now();
(getSurveys as jest.Mock).mockResolvedValue([
  {
    id:1,
    title:'Survey 1',
    status:'ACTIVE',
    start_at:new Date(now-3600*1000).toISOString(),
    end_at:new Date(now+3600*1000).toISOString(),
  }
]);

test('loads surveys from API', async () => {
  const { getByText } = render(<Surveys />);
  await waitFor(() => getByText(/Survey 1/));
  expect(getSurveys).toHaveBeenCalled();
});
