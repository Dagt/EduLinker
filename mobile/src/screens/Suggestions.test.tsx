import { render, waitFor } from '@testing-library/react-native';
import Suggestions from './Suggestions';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: async () => 'guest' }));
jest.mock('../api', () => ({ apiGet: jest.fn(async () => []) }));

it('restricts guest users', async () => {
  const { getByText } = render(<Suggestions />);
  await waitFor(() => getByText('No autorizado'));
});
