import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingDelete from './page';
import { apiDelete } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });
jest.spyOn(window, 'confirm').mockReturnValue(true);

describe('FundraisingDelete', () => {
  it('deletes event', async () => {
    (apiDelete as jest.Mock).mockResolvedValue({});
    render(<FundraisingDelete params={{id:'1'}} />);
    fireEvent.click(screen.getByText('Eliminar'));
    await waitFor(() => expect(apiDelete).toHaveBeenCalled());
  });
});
