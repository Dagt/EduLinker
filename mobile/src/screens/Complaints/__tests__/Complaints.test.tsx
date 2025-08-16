import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Complaints from '..';
import { getComplaints, createComplaint } from '../../../api';
import i18n from '../../../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../../../api', () => ({
  getComplaints: jest.fn(),
  createComplaint: jest.fn(),
  getComplaintMessages: jest.fn(),
  sendComplaintMessage: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(cleanup);

test('loads complaints from API', async () => {
  i18n.locale = 'es';
  (getComplaints as jest.Mock).mockResolvedValue([{ id:1, title:'Test Complaint'}]);
  const { getByText } = render(<Complaints />);
  await waitFor(() => getByText(/Test Complaint/));
  expect(getComplaints).toHaveBeenCalled();
});

test('creates complaint with required fields', async () => {
  i18n.locale = 'es';
  (getComplaints as jest.Mock)
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ id:2, content:'Nueva queja' }]);
  (createComplaint as jest.Mock).mockResolvedValue({ id:2, content:'Nueva queja' });
  const { getByPlaceholderText, getByText } = render(<Complaints />);
  fireEvent.changeText(getByPlaceholderText('Group ID'), '1');
  fireEvent.changeText(getByPlaceholderText('Teacher ID'), '2');
  fireEvent.changeText(getByPlaceholderText(i18n.t('complaints.placeholder')), 'Nueva queja');
  fireEvent.changeText(getByPlaceholderText('Student ID'), '3');
  fireEvent.press(getByText(i18n.t('complaints.send')));
  await waitFor(() => expect(createComplaint).toHaveBeenCalledWith({
    content:'Nueva queja',
    group_id:1,
    target_teacher_id:2,
    about_student_id:3,
  }));
  await waitFor(() => getByText(/Nueva queja/));
});

test('validates required fields before creating complaint', async () => {
  i18n.locale = 'es';
  (getComplaints as jest.Mock).mockResolvedValue([]);
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const { getByPlaceholderText, getByText } = render(<Complaints />);
  fireEvent.changeText(getByPlaceholderText(i18n.t('complaints.placeholder')), 'Contenido');
  fireEvent.press(getByText(i18n.t('complaints.send')));
  await waitFor(() => {
    expect(createComplaint).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });
});

