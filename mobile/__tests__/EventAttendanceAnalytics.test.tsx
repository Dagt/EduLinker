import { render, waitFor } from '@testing-library/react-native';
import EventAttendanceAnalytics from '../src/screens/EventAttendanceAnalytics';
import { getMe } from '../src/api';
import { getEventAttendanceAnalytics } from '../src/services/analytics';

jest.mock('../src/api', () => ({ getMe: jest.fn() }));
jest.mock('../src/services/analytics', () => ({ getEventAttendanceAnalytics: jest.fn() }));

const attendance = {
  attending_yes: 3,
  attending_maybe: 1,
  attending_no: 2,
  participation_rate: 0.6,
  attendance_by_group: [
    { group_id: 1, attending_yes: 2, attending_maybe: 0, attending_no: 1, participation_rate: 0.5 },
  ],
};

afterEach(() => {
  jest.clearAllMocks();
});

test('renders attendance analytics summary for directors', async () => {
  (getMe as jest.Mock).mockResolvedValue({ role: 'DIRECTOR' });
  (getEventAttendanceAnalytics as jest.Mock).mockResolvedValue(attendance);
  const { getByText } = render(<EventAttendanceAnalytics />);
  await waitFor(() => getByText(/Event attendance/));
  expect(getByText(/Group 1/)).toBeTruthy();
  expect(getByText(/Yes: 2/)).toBeTruthy();
});

test('hides analytics details for non-directors', async () => {
  (getMe as jest.Mock).mockResolvedValue({ role: 'PARENT' });
  const { getByText, queryByText } = render(<EventAttendanceAnalytics />);
  await waitFor(() => getByText(/Event attendance/));
  expect(queryByText(/Group 1/)).toBeNull();
  expect(getEventAttendanceAnalytics).not.toHaveBeenCalled();
});
