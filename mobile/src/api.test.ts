jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));
import { headers } from './api';

test('includes X-School-ID', () => {
  const h = (headers as any)();
  expect(h['X-School-ID']).toBeDefined();
});
