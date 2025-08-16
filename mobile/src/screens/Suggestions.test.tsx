import { render, waitFor } from '@testing-library/react-native';
import Suggestions from './Suggestions';
import i18n from '../i18n';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('../role', () => ({ getRole: async () => 'guest' }));
jest.mock('../api', () => ({ apiGet: jest.fn(async () => []) }));

it('restricts guest users', async () => {
  i18n.locale = 'es';
  const { getByText } = render(<Suggestions />);
  await waitFor(() => getByText(i18n.t('suggestions.unauthorized')));
});
