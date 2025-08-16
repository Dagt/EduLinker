import { render, screen } from '@testing-library/react';
import SuggestionDetail from './page';
import { apiGet } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionDetail', () => {
  it('shows suggestion detail', async () => {
    (apiGet as jest.Mock).mockResolvedValue({id:1,title:'t',description:'d',status:'open'});
    render(<SuggestionDetail params={{id:'1'}} />);
    expect(await screen.findByRole('heading', { name: 'Sugerencia #1' })).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });
});
