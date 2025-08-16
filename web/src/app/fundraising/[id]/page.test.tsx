import { render, screen } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingDetail from './page';
import { getFundraisingEvent } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('FundraisingDetail', () => {
  it('shows event detail', async () => {
    (getFundraisingEvent as jest.Mock).mockResolvedValue({id:1,name:'e1',date:'2024-01-01',description:'d1'});
    render(<FundraisingDetail params={{id:'1'}} />);
    expect(await screen.findByText('e1')).toBeInTheDocument();
    expect(screen.getByText('Editar')).toBeInTheDocument();
  });
});
