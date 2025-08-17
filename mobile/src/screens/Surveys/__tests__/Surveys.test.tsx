import { render, waitFor } from '@testing-library/react-native';
import Surveys from '..';
import { getSurveys } from '../../../api';
import { getRole } from '../../../role';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ getSurveys: jest.fn() }));
jest.mock('../../../role', () => ({ getRole: jest.fn() }));

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
(getRole as jest.Mock).mockResolvedValue('PADRE');

test('loads surveys from API', async () => {
  const { getByText } = render(<Surveys />);
  await waitFor(() => getByText(/Survey 1/));
  expect(getSurveys).toHaveBeenCalled();
});

test('shows create button for allowed roles', async () => {
  (getSurveys as jest.Mock).mockResolvedValue([]);
  (getRole as jest.Mock).mockResolvedValue('DIRECTOR');
  const { getByText } = render(<Surveys onCreate={()=>{}} />);
  await waitFor(() => getByText('Encuestas'));
  await waitFor(() => getByText(i18n.t('surveys.create')));
});
