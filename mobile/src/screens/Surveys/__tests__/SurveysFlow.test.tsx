import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Surveys from '..';
import { getSurveys, getSurvey, voteSurvey, getSurveyResults } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  getSurveys: jest.fn(),
  getSurvey: jest.fn(),
  voteSurvey: jest.fn(),
  getSurveyResults: jest.fn(),
}));

test('navigates to survey and votes', async () => {
  const now = Date.now();
  const survey = {
    id:1,
    title:'Survey 1',
    options:['Option 1','Option 2'],
    start_at:new Date(now-3600*1000).toISOString(),
    end_at:new Date(now+3600*1000).toISOString(),
    status:'ACTIVE',
  };
  (getSurveys as jest.Mock).mockResolvedValue([survey]);
  (getSurvey as jest.Mock).mockResolvedValue(survey);
  (getSurveyResults as jest.Mock)
    .mockResolvedValueOnce({ results: {} })
    .mockResolvedValueOnce({ results: {0:1} });
  (voteSurvey as jest.Mock).mockResolvedValue({});

  const { getByText } = render(<Surveys />);
  await waitFor(() => getByText(/Survey 1/));
  fireEvent.press(getByText(/Survey 1/));
  await waitFor(() => getByText('Option 1'));
  fireEvent.press(getByText('Option 1'));
  await waitFor(() => getByText(/Voto registrado/));
  expect(voteSurvey).toHaveBeenCalledWith(1,0);
});

