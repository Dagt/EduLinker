import { render, screen } from '@testing-library/react';
import SuggestionStatus from './page';

Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'guest' } });

describe('SuggestionStatus', () => {
  it('restricts unauthorized users', () => {
    render(<SuggestionStatus />);
    expect(screen.getByText('No autorizado')).toBeInTheDocument();
  });
});
