import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Suggestions from '../screens/Suggestions';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../api', () => ({
  apiGet: jest.fn(),
  createSuggestion: jest.fn(),
  sendSuggestionMessage: jest.fn(),
}));
jest.mock('../role', () => ({ getRole: jest.fn() }));

import { apiGet, createSuggestion, sendSuggestionMessage } from '../api';
import { getRole } from '../role';

test('restricts guest users', async () => {
  (getRole as jest.Mock).mockResolvedValue('guest');
  const { getByText } = render(<Suggestions />);
  await waitFor(() => getByText('No autorizado'));
});

test('loads and creates suggestions', async () => {
  (getRole as jest.Mock).mockResolvedValue('admin');
  (apiGet as jest.Mock).mockResolvedValueOnce([{ id:1, title:'Idea', description:'...' }]);
  (createSuggestion as jest.Mock).mockResolvedValue({ id:2, title:'Nueva', description:'desc' });
  const { getByText, getByPlaceholderText } = render(<Suggestions />);
  await waitFor(() => getByText(/Idea/));
  expect(apiGet).toHaveBeenCalledWith('/suggestions/');
  fireEvent.changeText(getByPlaceholderText('Título'), 'Nueva');
  fireEvent.changeText(getByPlaceholderText('Descripción'), 'desc');
  fireEvent.press(getByText('Enviar'));
  await waitFor(() => expect(createSuggestion).toHaveBeenCalledWith({ title:'Nueva', description:'desc' }));
  await waitFor(() => getByText(/Nueva/));
});
