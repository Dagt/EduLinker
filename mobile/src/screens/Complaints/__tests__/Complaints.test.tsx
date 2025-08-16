import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Complaints from '..';
import { getComplaints, createComplaint } from '../../../api';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  getComplaints: jest.fn(),
  createComplaint: jest.fn(),
  getComplaintMessages: jest.fn(),
  sendComplaintMessage: jest.fn(),
}));

test('loads complaints from API', async () => {
  (getComplaints as jest.Mock).mockResolvedValue([{ id:1, title:'Test Complaint'}]);
  const { getByText } = render(<Complaints />);
  await waitFor(() => getByText(/Test Complaint/));
  expect(getComplaints).toHaveBeenCalled();
});

test('creates complaint', async () => {
  (getComplaints as jest.Mock)
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id:2, content:'Nueva queja' }]);
  (createComplaint as jest.Mock).mockResolvedValue({ id:2, content:'Nueva queja' });
  const { getByPlaceholderText, getByText } = render(<Complaints />);
  const input = getByPlaceholderText('Escribe tu queja');
  fireEvent.changeText(input, 'Nueva queja');
  fireEvent.press(getByText('Enviar'));
  await waitFor(() => expect(createComplaint).toHaveBeenCalledWith({ content:'Nueva queja' }));
  await waitFor(() => getByText(/Nueva queja/));
});

