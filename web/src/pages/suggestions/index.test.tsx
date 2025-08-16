import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionsPage from './index';
import { listSuggestions, createSuggestion } from '@/services/suggestions';

jest.mock('@/services/suggestions');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionsPage (pages)', () => {
  it('lists and creates suggestions', async () => {
    (listSuggestions as jest.Mock).mockResolvedValue([{id:1,title:'t1',description:'d1'}]);
    (createSuggestion as jest.Mock).mockResolvedValue({id:2,title:'t2',description:'d2'});

    render(<SuggestionsPage />);

    expect(screen.getByRole('heading', { name: 'Sugerencias' })).toBeInTheDocument();

    expect(await screen.findByText('t1')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 't2' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'd2' } });
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(createSuggestion).toHaveBeenCalled());
  });
});
