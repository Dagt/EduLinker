import { render, waitFor, fireEvent } from '@testing-library/react-native';
import Suggestions from './Suggestions';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: jest.fn() }));
jest.mock('../api', () => ({ apiGet: jest.fn(), createSuggestion: jest.fn() }));

import { getRole } from '../role';
import { apiGet, createSuggestion } from '../api';

it('restricts guest users', async () => {
  (getRole as jest.Mock).mockResolvedValue('guest');
  (apiGet as jest.Mock).mockResolvedValue([]);
  const { getByText } = render(<Suggestions />);
  await waitFor(() => getByText('No autorizado'));
});

it('validates required fields', async () => {
  (getRole as jest.Mock).mockResolvedValue('parent');
  (apiGet as jest.Mock).mockResolvedValue([]);
  const { getByText } = render(<Suggestions />);
  await waitFor(() => getByText('Sugerencias'));
  fireEvent.press(getByText('Enviar'));
  expect(createSuggestion).not.toHaveBeenCalled();
});

it('creates suggestion with fields', async () => {
  (getRole as jest.Mock).mockResolvedValue('parent');
  (apiGet as jest.Mock)
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id:1, title:'Nueva' }]);
  (createSuggestion as jest.Mock).mockResolvedValue({ id:1, title:'Nueva' });
  const { getByPlaceholderText, getByText } = render(<Suggestions />);
  await waitFor(() => getByText('Sugerencias'));
  fireEvent.changeText(getByPlaceholderText('Group ID'), '1');
  fireEvent.changeText(getByPlaceholderText('Teacher ID'), '2');
  fireEvent.changeText(getByPlaceholderText('Title'), 'Nueva');
  fireEvent.changeText(getByPlaceholderText('Description'), 'Desc');
  fireEvent.press(getByText('Enviar'));
  await waitFor(() => expect(createSuggestion).toHaveBeenCalledWith({
    group_id:1,
    target_teacher_id:2,
    title:'Nueva',
    description:'Desc'
  }));
  await waitFor(() => getByText(/Nueva/));
});
