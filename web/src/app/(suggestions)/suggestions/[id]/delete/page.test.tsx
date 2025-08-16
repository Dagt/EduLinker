import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import SuggestionDelete from './page';
import { apiGet, apiDelete } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });
jest.spyOn(window, 'confirm').mockReturnValue(true);

describe('SuggestionDelete', () => {
  it('deletes suggestion', async () => {
    (apiGet as jest.Mock).mockResolvedValue({id:1,title:'t',description:'d'});
    (apiDelete as jest.Mock).mockResolvedValue({});
    render(<SuggestionDelete params={{id:'1'}} />);
    expect(await screen.findByText('t')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Eliminar'));
    await waitFor(() => expect(apiDelete).toHaveBeenCalled());
  });
});
