import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SurveyVote from '../SurveyVote';
import { getSurvey, voteSurvey, getSurveyResults } from '../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../api', () => ({
  getSurvey: jest.fn(),
  voteSurvey: jest.fn(),
  getSurveyResults: jest.fn(),
}));

(getSurvey as jest.Mock).mockResolvedValue({
  id:1,
  title:'Survey 1',
  options:['Option 1','Option 2']
});
(getSurveyResults as jest.Mock)
  .mockResolvedValueOnce({ results: {0:1,1:2} })
  .mockResolvedValueOnce({ results: {0:2,1:2} });
(voteSurvey as jest.Mock).mockResolvedValue({});

test('votes and shows results', async () => {
  const { getByText } = render(<SurveyVote surveyId={1} />);
  await waitFor(() => getByText('Option 1'));
  await waitFor(() => getByText('Option 1: 1'));
  fireEvent.press(getByText('Option 1'));
  await waitFor(() => expect(voteSurvey).toHaveBeenCalledWith(1,0));
  await waitFor(() => getByText('Option 1: 2'));
  expect(getSurveyResults).toHaveBeenCalledTimes(2);
});
