import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Suggestions from './Suggestions';
import i18n from '../i18n';
import { getSuggestions, createSuggestion } from '../api';
import { getRole } from '../role';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../api', () => ({
  getSuggestions: jest.fn(),
  createSuggestion: jest.fn(),
}));
jest.mock('../role', () => ({ getRole: jest.fn() }));

it('restricts guest users', async () => {
  i18n.locale = 'es';
  (getRole as jest.Mock).mockResolvedValue('guest');
  const { getByText } = render(<Suggestions />);
  await waitFor(() => getByText(i18n.t('suggestions.unauthorized')));
});

test('creates suggestion', async () => {
  i18n.locale = 'es';
  (getRole as jest.Mock).mockResolvedValue('parent');
  (getSuggestions as jest.Mock)
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id:1, content:'Nueva sugerencia' }]);
  (createSuggestion as jest.Mock).mockResolvedValue({ id:1, content:'Nueva sugerencia' });
  const { getByPlaceholderText, getByText } = render(<Suggestions />);
  await waitFor(() => getByPlaceholderText('Group ID'));
  fireEvent.changeText(getByPlaceholderText('Group ID'), '1');
  fireEvent.changeText(getByPlaceholderText('Teacher ID'), '2');
  fireEvent.changeText(getByPlaceholderText('Suggestion'), 'Nueva sugerencia');
  fireEvent.press(getByText(i18n.t('complaints.send')));
  await waitFor(() => expect(createSuggestion).toHaveBeenCalledWith({ content:'Nueva sugerencia', group_id:1, target_teacher_id:2 }));
  await waitFor(() => getByText(/Nueva sugerencia/));
});

test('validates required fields', async () => {
  i18n.locale = 'es';
  (getRole as jest.Mock).mockResolvedValue('parent');
  (getSuggestions as jest.Mock).mockResolvedValue([]);
  (createSuggestion as jest.Mock).mockClear();
  const alertMock = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByPlaceholderText, getByText } = render(<Suggestions />);
  await waitFor(() => getByPlaceholderText('Teacher ID'));
  fireEvent.changeText(getByPlaceholderText('Teacher ID'), '2');
  fireEvent.changeText(getByPlaceholderText('Suggestion'), 'Nueva sugerencia');
  fireEvent.press(getByText(i18n.t('complaints.send')));
  expect(createSuggestion).not.toHaveBeenCalled();
  expect(alertMock).toHaveBeenCalled();
});

