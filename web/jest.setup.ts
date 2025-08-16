import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  usePathname: () => '/es',
}));
