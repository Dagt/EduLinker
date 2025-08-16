import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SuggestionDelete from './page';
import { apiDelete } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });
jest.spyOn(window, 'confirm').mockReturnValue(true);

describe('SuggestionDelete', () => {
  it('deletes suggestion', async () => {
    (apiDelete as jest.Mock).mockResolvedValue({});
    render(<SuggestionDelete params={{id:'1'}} />);
    fireEvent.click(screen.getByText('Eliminar'));
    await waitFor(() => expect(apiDelete).toHaveBeenCalled());
  });
});
