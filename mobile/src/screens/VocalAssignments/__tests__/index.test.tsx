import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VocalAssignments from '../index';
import { apiGet, assignVocal, deactivateVocal } from '../../../api';

jest.mock('../../../api', () => ({
  apiGet: jest.fn(),
  assignVocal: jest.fn(),
  deactivateVocal: jest.fn(),
}));

describe('VocalAssignments screen', () => {
  const members = {
    parents: [
      { id: 1, first_name: 'Alice', last_name: 'P' },
      { id: 2, first_name: 'Bob', last_name: 'Q' },
    ],
  };
  const assignments = [{ id: 10, parent: 1, active: true }];

  beforeEach(() => {
    (apiGet as jest.Mock).mockImplementation((url: string) => {
      if (url === '/groups/1/members/') return Promise.resolve(members);
      if (url === '/groups/vocal-assignments/?group=1') return Promise.resolve(assignments);
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('lists, assigns and revokes vocal parents', async () => {
    const { getByText, getByTestId } = render(<VocalAssignments groupId={1} />);
    await waitFor(() => getByText('Alice P'));
    expect(apiGet).toHaveBeenCalledWith('/groups/1/members/');
    expect(apiGet).toHaveBeenCalledWith('/groups/vocal-assignments/?group=1');

    fireEvent.press(getByTestId('parent-2'));
    fireEvent.press(getByTestId('assign-btn'));
    await waitFor(() => expect(assignVocal).toHaveBeenCalledWith({ group: 1, parent: 2 }));

    fireEvent.press(getByTestId('revoke-10'));
    await waitFor(() => expect(deactivateVocal).toHaveBeenCalledWith(10));
  });
});
