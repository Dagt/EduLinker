import {render, screen} from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

jest.mock('next-intl');
const {setLocale} = require('next-intl');
jest.mock('next/navigation', () => ({usePathname: () => '/'}));

describe('LanguageSwitcher', () => {
  it('shows options in English', () => {
    setLocale('en');
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', {name: 'English'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Spanish'})).toBeInTheDocument();
  });

  it('shows options in Spanish', () => {
    setLocale('es');
    render(<LanguageSwitcher />);
    expect(screen.getByRole('option', {name: 'Inglés'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Español'})).toBeInTheDocument();
  });
});
