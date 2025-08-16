import {render, screen} from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import {usePathname} from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {setMockMessages} = require('next-intl');

jest.mock('next-intl');
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

const usePathnameMock = usePathname as jest.Mock;

describe('LanguageSwitcher', () => {
  it('renders English labels when locale is en', () => {
    usePathnameMock.mockReturnValue('/');
    setMockMessages(en);
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', {name: 'English'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Spanish'})).toBeInTheDocument();
  });

  it('renders Spanish labels when locale is es', () => {
    usePathnameMock.mockReturnValue('/es');
    setMockMessages(es);
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', {name: 'Inglés'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Español'})).toBeInTheDocument();
  });
});

