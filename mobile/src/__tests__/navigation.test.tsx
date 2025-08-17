import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import i18n from '../i18n';
import { getRole } from '../role';

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
jest.mock('../screens/Homeworks/Create', () => ({ __esModule: true, default: () => <Text>HomeworkCreateScreen</Text> }));
jest.mock('../screens/Announcements/Create', () => ({ __esModule: true, default: () => <Text>AnnouncementCreateScreen</Text> }));
jest.mock('../screens/Surveys', () => ({ __esModule: true, default: () => <Text>SurveysScreen</Text> }));
jest.mock('../screens/EventCalendar', () => ({ __esModule: true, default: () => <Text>EventCalendarScreen</Text> }));
jest.mock('../screens/Fundraising', () => ({ __esModule: true, default: () => <Text>FundraisingScreen</Text> }));
jest.mock('../role', () => ({ getRole: jest.fn().mockResolvedValue('guest') }));

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

test('navigates to create screens for teachers', async () => {
  (getRole as jest.Mock).mockResolvedValueOnce('MAESTRO_TITULAR');
  const { findByText, getByText } = render(<App />);
  const hwBtn = await findByText(i18n.t('menu.createHomework'));
  fireEvent.press(hwBtn);
  await findByText('HomeworkCreateScreen');
  fireEvent.press(getByText(i18n.t('menu.createAnnouncement')));
  await findByText('AnnouncementCreateScreen');
});

