import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionDetail from './page';
import { apiGet } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionDetail', () => {
  it('shows suggestion', async () => {
    (apiGet as jest.Mock).mockResolvedValue({id:1,title:'t',description:'d'});

    render(<SuggestionDetail params={{id:'1'}} />);

    expect(await screen.findByText('t')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });
});
