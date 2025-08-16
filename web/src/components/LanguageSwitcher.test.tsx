import {render, screen} from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import {usePathname} from 'next/navigation';
import i18n from '@/i18n';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

const usePathnameMock = usePathname as jest.Mock;

describe('LanguageSwitcher', () => {
  it('renders English labels when locale is en', () => {
    usePathnameMock.mockReturnValue('/');
    i18n.changeLanguage('en');
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Spanish' })).toBeInTheDocument();
  });

  it('renders Spanish labels when locale is es', () => {
    usePathnameMock.mockReturnValue('/es');
    i18n.changeLanguage('es');
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', { name: 'Inglés' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Español' })).toBeInTheDocument();
  });
});

