import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Suggestions from '../screens/Suggestions';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('../api', () => ({
  apiGet: jest.fn(),
  createSuggestion: jest.fn(),
  sendSuggestionMessage: jest.fn(),
}));

describe('Suggestions screen', () => {
  it('restricts guest users', async () => {
    const { getRole } = require('../role');
    (getRole as jest.Mock).mockResolvedValue('guest');
    const { apiGet } = require('../api');
    (apiGet as jest.Mock).mockResolvedValue([]);
    i18n.locale = 'es';
    const { getByText } = render(<Suggestions />);
    await waitFor(() => getByText(i18n.t('suggestions.unauthorized')));
  });

  it('allows creating suggestions', async () => {
    const { getRole } = require('../role');
    const { apiGet, createSuggestion } = require('../api');
    (getRole as jest.Mock).mockResolvedValue('student');
    (apiGet as jest.Mock).mockResolvedValue([]);
    (createSuggestion as jest.Mock).mockImplementation(async (body: any) => ({ id: 1, ...body }));
    i18n.locale = 'en';
    const { getByPlaceholderText, getByText } = render(<Suggestions />);
    await waitFor(() => getByText(i18n.t('suggestions.title')));
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.fieldTitle')), 'My title');
    fireEvent.changeText(getByPlaceholderText(i18n.t('suggestions.fieldDescription')), 'Desc');
    fireEvent.press(getByText(i18n.t('suggestions.send')));
    await waitFor(() => {
      expect(createSuggestion).toHaveBeenCalledWith({ title: 'My title', description: 'Desc' });
    });
  });
});
