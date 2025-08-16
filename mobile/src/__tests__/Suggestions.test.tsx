import { render, waitFor, fireEvent, cleanup } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Suggestions from '../screens/Suggestions';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}), { virtual: true });
jest.mock('../api', () => ({
  getSuggestions: jest.fn(),
  createSuggestion: jest.fn(),
  getSuggestionMessages: jest.fn(),
  sendSuggestionMessage: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

jest.setTimeout(10000);

beforeEach(() => {
  jest.resetAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('1');
});

afterEach(cleanup);

describe('Suggestions screen', () => {
  it('restricts guest users', async () => {
    const { getRole } = require('../role');
    (getRole as jest.Mock).mockResolvedValue('guest');
    const { getSuggestions } = require('../api');
    (getSuggestions as jest.Mock).mockResolvedValue([]);
    i18n.locale = 'es';
    const { getByText } = render(<Suggestions />);
    await waitFor(() => getByText(i18n.t('suggestions.unauthorized')));
  });

  it('allows creating suggestions', async () => {
    const { getRole } = require('../role');
    const { getSuggestions, createSuggestion } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getSuggestions as jest.Mock).mockResolvedValue([]);
    (createSuggestion as jest.Mock).mockImplementation(async (body: any) => ({ id: 1, ...body }));
    i18n.locale = 'en';
    const { getByPlaceholderText, getByText } = render(<Suggestions />);
    await waitFor(() => getByText(i18n.t('suggestions.title')));
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.fieldTitle')), 'My title');
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.fieldDescription')), 'Desc');
    fireEvent.changeText(getByPlaceholderText('Group ID'), '1');
    fireEvent.changeText(getByPlaceholderText('Teacher ID'), '2');
    fireEvent.changeText(getByPlaceholderText('Student ID'), '3');
    fireEvent.press(getByText(i18n.t('suggestions.send')));
    await waitFor(() => {
      expect(createSuggestion).toHaveBeenCalledWith({
        title: 'My title',
        description: 'Desc',
        group_id:1,
        target_teacher_id:2,
        about_student_id:3,
      });
    });
  });

  it('validates required fields', async () => {
    const { getRole } = require('../role');
    const { getSuggestions, createSuggestion } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getSuggestions as jest.Mock).mockResolvedValue([]);
    i18n.locale = 'en';
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(<Suggestions />);
    await waitFor(() => getByText(i18n.t('suggestions.title')));
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.fieldTitle')), 'My title');
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.fieldDescription')), 'Desc');
    fireEvent.press(getByText(i18n.t('suggestions.send')));
    await waitFor(() => {
      expect(createSuggestion).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });
  it('sends messages in suggestions', async () => {
    const { getRole } = require('../role');
    const { getSuggestions, getSuggestionMessages, sendSuggestionMessage } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getSuggestions as jest.Mock).mockResolvedValue([{ id:1, title:'S1' }]);
    (getSuggestionMessages as jest.Mock).mockResolvedValue([]);
    (sendSuggestionMessage as jest.Mock).mockImplementation(async (_id: number, body: any) => ({ id: 1, ...body }));
    i18n.locale = 'en';
    const { getByText, getByPlaceholderText } = render(<Suggestions />);
    await waitFor(() => getByText(/S1/));
    fireEvent.press(getByText(/S1/));
    await waitFor(() => getByPlaceholderText(i18n.t('suggestions.messagePlaceholder')));
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.messagePlaceholder')), 'Hi');
    fireEvent.press(getByText(i18n.t('suggestions.send')));
    await waitFor(() => {
      expect(sendSuggestionMessage).toHaveBeenCalledWith(1, { content: 'Hi' });
    });
  });

  it('handles load errors', async () => {
    const { getRole } = require('../role');
    const { getSuggestions } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (getSuggestions as jest.Mock).mockRejectedValue(new Error('fail'));
    i18n.locale = 'en';
    const { getByText } = render(<Suggestions />);
    await waitFor(() => getByText(i18n.t('general.error')));
  });
});
