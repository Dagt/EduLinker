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
jest.mock('../screens/Calendar', () => ({ __esModule: true, default: () => <Text>CalendarScreen</Text> }));

const App = require('../../App').default;

i18n.locale = 'es';

test('navigates to calendar', () => {
  const { getByText } = render(<App />);
  fireEvent.press(getByText(i18n.t('menu.events')));
  expect(getByText('CalendarScreen')).toBeTruthy();
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

