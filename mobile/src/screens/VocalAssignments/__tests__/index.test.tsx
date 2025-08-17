import { render, waitFor, fireEvent } from '@testing-library/react-native';
import VocalAssignments from '..';
import { apiGet, assignVocal, deactivateVocal } from '../../../api';

jest.mock('../../../api', () => ({
  apiGet: jest.fn(),
  assignVocal: jest.fn(),
  deactivateVocal: jest.fn(),
}));

const assignments = [
  { id: 1, parent: { id: 10, first_name: 'Ana', last_name: 'V' } },
];
const members = {
  parents: [
    { id: 10, first_name: 'Ana', last_name: 'V' },
    { id: 11, first_name: 'Bob', last_name: 'P' },
  ],
};

beforeEach(() => {
  (apiGet as jest.Mock).mockImplementation((url: string) => {
    if (url.startsWith('/groups/vocal-assignments/')) return Promise.resolve(assignments);
    if (url.includes('/members/')) return Promise.resolve(members);
    return Promise.resolve([]);
  });
  (assignVocal as jest.Mock).mockResolvedValue({});
  (deactivateVocal as jest.Mock).mockResolvedValue({});
});

test('shows active vocals and available parents', async () => {
  const { getByText } = render(<VocalAssignments groupId={1} />);
  await waitFor(() => getByText('Ana V'));
  expect(apiGet).toHaveBeenCalledWith('/groups/vocal-assignments/?group=1');
  expect(apiGet).toHaveBeenCalledWith('/groups/1/members/');
  getByText('Bob');
});

test('assigns selected parent', async () => {
  const { getByText } = render(<VocalAssignments groupId={1} />);
  await waitFor(() => getByText('Ana V'));
  fireEvent.press(getByText('Bob'));
  fireEvent.press(getByText('Assign'));
  await waitFor(() => expect(assignVocal).toHaveBeenCalledWith({ group: 1, parent: 11 }));
});

test('deactivates assignment', async () => {
  const { getByText } = render(<VocalAssignments groupId={1} />);
  await waitFor(() => getByText('Ana V'));
  fireEvent.press(getByText('Revoke'));
  await waitFor(() => expect(deactivateVocal).toHaveBeenCalledWith(1));
});
