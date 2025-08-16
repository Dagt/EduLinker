import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionsPage from './page';
import { apiGet } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionsPage', () => {
  it('lists suggestions', async () => {
    (apiGet as jest.Mock).mockResolvedValue([{id:1,title:'t1',description:'d1'}]);

    render(<SuggestionsPage />);

    expect(screen.getByRole('heading', { name: 'Sugerencias' })).toBeInTheDocument();
    expect(screen.getByText('Crear sugerencia')).toBeInTheDocument();
    expect(await screen.findByText('t1')).toBeInTheDocument();
  });
});
