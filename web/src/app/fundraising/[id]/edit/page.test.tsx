import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingEdit from './page';
import { apiGet, apiPatch } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });
jest.spyOn(window, 'confirm').mockReturnValue(true);

describe('FundraisingEdit', () => {
  it('edits event', async () => {
    (apiGet as jest.Mock).mockResolvedValue({id:1,name:'e',date:'2024-01-01',description:'d'});
    (apiPatch as jest.Mock).mockResolvedValue({});
    render(<FundraisingEdit params={{id:'1'}} />);
    expect(await screen.findByDisplayValue('e')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'e2' } });
    fireEvent.change(screen.getByPlaceholderText('Fecha'), { target: { value: '2024-02-02' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'd2' } });
    fireEvent.click(screen.getByText('Actualizar'));
    await waitFor(() => expect(apiPatch).toHaveBeenCalled());
  });
});
