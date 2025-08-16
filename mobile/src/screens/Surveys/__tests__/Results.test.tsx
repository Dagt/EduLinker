import { render, waitFor } from '@testing-library/react-native';
import SurveyResults from '../Results';
import { getSurvey, getSurveyResults } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  getSurvey: jest.fn(),
  getSurveyResults: jest.fn(),
}));

const now = Date.now();
(getSurvey as jest.Mock).mockResolvedValue({
  id:1,
  title:'Survey 1',
  options:['Option 1','Option 2'],
  start_at:new Date(now-3600*1000).toISOString(),
  end_at:new Date(now+3600*1000).toISOString(),
  status:'CLOSED',
});
(getSurveyResults as jest.Mock).mockResolvedValue({ results: {0:2,1:3} });

test('shows survey results', async () => {
  const { getByText } = render(<SurveyResults surveyId={1} />);
  await waitFor(() => getByText('Resultados:'));
  await waitFor(() => getByText('Option 1: 2'));
  expect(getSurvey).toHaveBeenCalledWith(1);
  expect(getSurveyResults).toHaveBeenCalledWith(1);
});
