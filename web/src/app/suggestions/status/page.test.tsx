import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionStatus from './page';
import esMessages from '@/i18n/es.json';

Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'guest' } });

describe('SuggestionStatus', () => {
  it('restricts unauthorized users', () => {
    render(<SuggestionStatus />);
    expect(screen.getByText(esMessages.SuggestionStatus.unauthorized)).toBeInTheDocument();
  });
});
