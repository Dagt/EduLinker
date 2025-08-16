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

test('validates required fields', async () => {
  (getComplaints as jest.Mock).mockResolvedValue([]);
  const { getByPlaceholderText, getByText } = render(<Complaints />);
  fireEvent.changeText(getByPlaceholderText('Escribe tu queja'), 'Hola');
  fireEvent.press(getByText('Enviar'));
  expect(createComplaint).not.toHaveBeenCalled();
});

test('creates complaint with fields', async () => {
  (getComplaints as jest.Mock)
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id:2, description:'Nueva queja' }]);
  (createComplaint as jest.Mock).mockResolvedValue({ id:2, description:'Nueva queja' });
  const { getByPlaceholderText, getByText } = render(<Complaints />);
  fireEvent.changeText(getByPlaceholderText('Group ID'), '1');
  fireEvent.changeText(getByPlaceholderText('Teacher ID'), '2');
  fireEvent.changeText(getByPlaceholderText('Student ID (optional)'), '3');
  fireEvent.changeText(getByPlaceholderText('Escribe tu queja'), 'Nueva queja');
  fireEvent.press(getByText('Enviar'));
  await waitFor(() => expect(createComplaint).toHaveBeenCalledWith({
    group_id:1,
    target_teacher_id:2,
    description:'Nueva queja',
    about_student_id:3,
  }));
  await waitFor(() => getByText(/Nueva queja/));
});

