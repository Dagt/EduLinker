import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VocalAssignments from '../index';
import { apiGet, assignVocal, deactivateVocal } from '../../../api';

jest.mock('../../../api', () => ({
  apiGet: jest.fn(),
  assignVocal: jest.fn(),
  deactivateVocal: jest.fn(),
}));

const groups = [{ id: 1, name: 'G1' }];
const initialMembers = {
  parents: [
    { id: 1, first_name: 'Act', last_name: 'One', role: 'VOCAL', vocal_assignment_id: 10 },
    { id: 2, first_name: 'Free', last_name: 'Two', role: 'PADRE' },
  ],
  students: [],
};

beforeEach(() => {
  (apiGet as jest.Mock).mockResolvedValueOnce(groups).mockResolvedValueOnce(initialMembers);
});

afterEach(() => {
  jest.clearAllMocks();
});

test('assigns a vocal', async () => {
  (assignVocal as jest.Mock).mockResolvedValueOnce({});
  (apiGet as jest.Mock).mockResolvedValueOnce({ parents: [], students: [] });
  const { getByTestId } = render(<VocalAssignments />);
  await waitFor(() => getByTestId('assign-2'));
  fireEvent.press(getByTestId('assign-2'));
  await waitFor(() => expect(assignVocal).toHaveBeenCalledWith(1, 2));
});

test('deactivates a vocal', async () => {
  (deactivateVocal as jest.Mock).mockResolvedValueOnce({});
  (apiGet as jest.Mock).mockResolvedValueOnce({ parents: [], students: [] });
  const { getByTestId } = render(<VocalAssignments />);
  await waitFor(() => getByTestId('revoke-10'));
  fireEvent.press(getByTestId('revoke-10'));
  await waitFor(() => expect(deactivateVocal).toHaveBeenCalledWith(10));
});

