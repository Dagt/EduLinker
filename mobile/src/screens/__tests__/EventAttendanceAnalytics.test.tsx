import { render, waitFor } from '@testing-library/react-native';
import EventAttendanceAnalytics from '../EventAttendanceAnalytics';
import { getEventAttendanceAnalytics } from '../../services/analytics';

jest.mock('../../services/analytics', () => ({ getEventAttendanceAnalytics: jest.fn() }));

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

test('renders attendance analytics summary', async () => {
  (getEventAttendanceAnalytics as jest.Mock).mockResolvedValue(attendance);
  const { getByText } = render(<EventAttendanceAnalytics />);
  await waitFor(() => getByText(/Event attendance/));
  expect(getByText(/Group 1/)).toBeTruthy();
  expect(getByText(/Yes: 2/)).toBeTruthy();
});
