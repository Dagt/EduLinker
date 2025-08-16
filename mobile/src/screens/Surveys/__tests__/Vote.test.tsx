import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SurveyVote from '../Vote';
import { getSurvey, voteSurvey, getSurveyResults } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  getSurvey: jest.fn(),
  voteSurvey: jest.fn(),
  getSurveyResults: jest.fn(),
}));

const now = Date.now();
const baseSurvey = {
  id:1,
  title:'Survey 1',
  options:['Option 1','Option 2'],
  start_at:new Date(now-3600*1000).toISOString(),
  end_at:new Date(now+3600*1000).toISOString(),
  status:'ACTIVE',
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('votes and shows results', async () => {
  (getSurvey as jest.Mock).mockResolvedValue(baseSurvey);
  (getSurveyResults as jest.Mock)
    .mockResolvedValueOnce({ results: {0:1,1:2} })
    .mockResolvedValueOnce({ results: {0:2,1:2} });
  (voteSurvey as jest.Mock).mockResolvedValue({});

  const { getByText } = render(<SurveyVote surveyId={1} />);
  await waitFor(() => getByText('Option 1'));
  await waitFor(() => getByText('Option 1: 1'));
  fireEvent.press(getByText('Option 1'));
  await waitFor(() => expect(voteSurvey).toHaveBeenCalledWith(1,0));
  await waitFor(() => getByText('Option 1: 2'));
  expect(getSurveyResults).toHaveBeenCalledTimes(2);
});

test('prevents multiple votes', async () => {
  (getSurvey as jest.Mock).mockResolvedValue(baseSurvey);
  (getSurveyResults as jest.Mock).mockResolvedValue({ results: {} });
  (voteSurvey as jest.Mock).mockResolvedValue({});

  const { getByText } = render(<SurveyVote surveyId={1} />);
  await waitFor(() => getByText('Option 1'));
  fireEvent.press(getByText('Option 1'));
  await waitFor(() => expect(voteSurvey).toHaveBeenCalledTimes(1));
  fireEvent.press(getByText('Option 1'));
  await waitFor(() => getByText(/Ya votaste/i));
  expect(voteSurvey).toHaveBeenCalledTimes(1);
});

test('does not allow voting when inactive', async () => {
  const past = new Date(now-7200*1000).toISOString();
  const closedSurvey = { ...baseSurvey, start_at: past, end_at: past };
  (getSurvey as jest.Mock).mockResolvedValue(closedSurvey);
  (getSurveyResults as jest.Mock).mockResolvedValue({ results: {} });

  const { getByText } = render(<SurveyVote surveyId={1} />);
  await waitFor(() => getByText('Option 1'));
  fireEvent.press(getByText('Option 1'));
  await waitFor(() => getByText(/Encuesta no activa/i));
  expect(voteSurvey).not.toHaveBeenCalled();
});

