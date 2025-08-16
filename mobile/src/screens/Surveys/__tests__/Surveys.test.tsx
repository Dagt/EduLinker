import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import Surveys from '../index';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({ getSurveys: jest.fn() }));
jest.mock('../../SurveyVote', () => () => <Text>VoteScreen</Text>);

const api = require('../../../api');

(api.getSurveys as jest.Mock).mockResolvedValue([
  { id: 1, title: 'Survey 1' }
]);

test('loads surveys and navigates to vote', async () => {
  const { getByText } = render(<Surveys />);
  await waitFor(() => getByText('Encuestas'));
  await waitFor(() => getByText(/Survey 1/));
  fireEvent.press(getByText(/Survey 1/));
  await waitFor(() => getByText('VoteScreen'));
  expect(api.getSurveys).toHaveBeenCalled();
});
