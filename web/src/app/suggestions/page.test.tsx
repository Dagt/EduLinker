import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionsPage from './page';
import { apiGet, apiPost } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionsPage', () => {
  it('lists and creates suggestions', async () => {
    (apiGet as jest.Mock).mockResolvedValue([{id:1,title:'t1',description:'d1'}]);
    (apiPost as jest.Mock).mockResolvedValue({id:2,title:'t2',description:'d2'});

    render(<SuggestionsPage />);

    expect(await screen.findByText('t1')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 't2' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'd2' } });
    fireEvent.click(screen.getByText('Enviar'));

    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });
});
