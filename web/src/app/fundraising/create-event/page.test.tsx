import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FundraisingCreateEvent from './page';
import { apiPost } from '@/lib/api';

jest.mock('@/lib/api', () => ({ apiPost: jest.fn() }));
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('FundraisingCreateEvent', () => {
  beforeEach(() => {
    (apiPost as jest.Mock).mockReset();
  });

  it('validates and submits form', async () => {
    render(<FundraisingCreateEvent />);
    fireEvent.click(screen.getByText('Crear evento'));
    expect(screen.getByText('Requerido')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Feria' } });
    fireEvent.change(screen.getByPlaceholderText('Fecha (YYYY-MM-DD)'), { target: { value: '2024-05-01' } });
    fireEvent.click(screen.getByText('Crear evento'));
    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });
});
