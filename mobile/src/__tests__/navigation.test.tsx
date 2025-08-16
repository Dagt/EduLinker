import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

jest.mock('../screens/Login', () => ({
  __esModule: true,
  default: ({ onLoggedIn }: { onLoggedIn: () => void }) => {
    onLoggedIn();
    return null;
  },
}));

jest.mock('../screens/Feed', () => ({ __esModule: true, default: () => <Text>FeedScreen</Text> }));
jest.mock('../screens/GroupChat', () => ({ __esModule: true, default: () => <Text>ChatScreen</Text> }));
jest.mock('../screens/Complaints', () => ({ __esModule: true, default: () => <Text>ComplaintsScreen</Text> }));
jest.mock('../screens/Suggestions', () => ({ __esModule: true, default: () => <Text>SuggestionsScreen</Text> }));
jest.mock('../screens/Homeworks', () => ({ __esModule: true, default: () => <Text>HomeworksScreen</Text> }));
jest.mock('../screens/Surveys', () => ({ __esModule: true, default: () => <Text>SurveysScreen</Text> }));
jest.mock('../screens/EventCalendar', () => ({ __esModule: true, default: () => <Text>EventCalendarScreen</Text> }));
jest.mock('../screens/Fundraising', () => ({ __esModule: true, default: () => <Text>FundraisingScreen</Text> }));

const App = require('../../App').default;

i18n.locale = 'es';

test('navigates to event calendar', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.events')));
  expect(getByText('EventCalendarScreen')).toBeTruthy();
});

test('navigates to homeworks', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.homeworks')));
  expect(getByText('HomeworksScreen')).toBeTruthy();
});

test('navigates to suggestions', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.suggestions')));
  expect(getByText('SuggestionsScreen')).toBeTruthy();
});

test('navigates to complaints', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.complaints')));
  expect(getByText('ComplaintsScreen')).toBeTruthy();
});

test('navigates to surveys', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.surveys')));
  expect(getByText('SurveysScreen')).toBeTruthy();
});

test('navigates to fundraising', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.fundraising')));
  expect(getByText('FundraisingScreen')).toBeTruthy();
});

