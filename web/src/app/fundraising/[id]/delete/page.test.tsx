import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingDelete from './page';
import { getFundraisingEvent, deleteFundraisingEvent } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });
jest.spyOn(window, 'confirm').mockReturnValue(true);

describe('FundraisingDelete', () => {
  it('deletes event', async () => {
    (getFundraisingEvent as jest.Mock).mockResolvedValue({id:1,name:'e1',date:'2024-01-01',description:'d1'});
    (deleteFundraisingEvent as jest.Mock).mockResolvedValue({});
    render(<FundraisingDelete params={{id:'1'}} />);
    expect(await screen.findByText('e1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Eliminar'));
    await waitFor(() => expect(deleteFundraisingEvent).toHaveBeenCalled());
  });
});
