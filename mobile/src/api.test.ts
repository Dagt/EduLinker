jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}), { virtual: true });

import AsyncStorage from '@react-native-async-storage/async-storage';
import { headers, setSchoolId } from './api';

beforeEach(() => {
  (AsyncStorage.getItem as jest.Mock).mockReset();
  (AsyncStorage.setItem as jest.Mock).mockReset();
});

test('uses stored school id from AsyncStorage', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('5');
  const h = await headers();
  expect(h['X-School-ID']).toBe('5');
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('derives school id from domain when not stored', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  process.env.EXPO_PUBLIC_DOMAIN = '7.example.com';
  const h = await headers();
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('schoolId', '7');
  expect(h['X-School-ID']).toBe('7');
});

test('setSchoolId stores provided value', async () => {
  await setSchoolId('9');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('schoolId', '9');
});
