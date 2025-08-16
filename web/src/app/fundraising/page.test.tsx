import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingPage from './page';
import { apiGet, apiPost } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('FundraisingPage', () => {
  it('lists events and submits form', async () => {
    (apiGet as jest.Mock).mockResolvedValue([{id:1,name:'e1',date:'2024-01-01',description:'d1'}]);
    (apiPost as jest.Mock).mockResolvedValue({id:2,name:'e2',date:'2024-02-01',description:'d2'});

    render(<FundraisingPage />);

    expect(await screen.findByText('e1')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'e2' } });
    fireEvent.change(screen.getByPlaceholderText('Fecha'), { target: { value: '2024-02-01' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'd2' } });
    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });
});
