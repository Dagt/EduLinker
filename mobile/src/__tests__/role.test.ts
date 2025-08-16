import { setRole, getRole } from '../role';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
}));

const SecureStore = require('expo-secure-store');

describe('role storage', () => {
  it('stores role', async () => {
    await setRole('admin');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('role', 'admin');
  });

  it('retrieves stored role or guest', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce('teacher');
    await expect(getRole()).resolves.toBe('teacher');
    SecureStore.getItemAsync.mockResolvedValueOnce(null);
    await expect(getRole()).resolves.toBe('guest');
  });
});
