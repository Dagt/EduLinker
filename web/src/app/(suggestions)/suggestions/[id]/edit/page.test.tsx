import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionEdit from './page';
import { apiGet, apiPatch } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

jest.spyOn(window, 'confirm').mockReturnValue(true);

describe('SuggestionEdit', () => {
  it('edits suggestion', async () => {
    (apiGet as jest.Mock).mockResolvedValue({id:1,title:'t',description:'d'});
    (apiPatch as jest.Mock).mockResolvedValue({});
    render(<SuggestionEdit params={{id:'1'}} />);
    expect(await screen.findByDisplayValue('t')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 't2' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'd2' } });
    fireEvent.click(screen.getByText('Actualizar'));
    await waitFor(() => expect(apiPatch).toHaveBeenCalled());
  });
});
