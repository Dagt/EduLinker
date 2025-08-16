import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionEdit from './page';
import { apiGet, apiPatch } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionEdit', () => {
  it('updates suggestion', async () => {
    (window as any).confirm = jest.fn(() => true);
    (apiGet as jest.Mock).mockResolvedValue({title:'t',description:'d'});
    (apiPatch as jest.Mock).mockResolvedValue({});

    render(<SuggestionEdit params={{id:'1'}} />);

    await screen.findByDisplayValue('t');
    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 't2' } });
    fireEvent.click(screen.getByText('Actualizar'));

    await waitFor(() => expect(apiPatch).toHaveBeenCalled());
  });
});
