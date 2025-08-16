import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingDetail from './page';
import { apiGet } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('FundraisingDetail', () => {
  it('shows event detail', async () => {
    (apiGet as jest.Mock).mockResolvedValue({id:1,name:'e',date:'2024-01-01',description:'d'});
    render(<FundraisingDetail params={{id:'1'}} />);
    expect(await screen.findByRole('heading', { name: 'Evento de recaudación #1' })).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });
});
