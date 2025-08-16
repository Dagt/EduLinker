import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LedgerForm from './LedgerForm';
import { createFundraisingLedger } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  createFundraisingLedger: jest.fn(),
}));
jest.mock('@/lib/roles', () => ({ requireRole: jest.fn() }));
import { requireRole } from '@/lib/roles';
Object.defineProperty(window, 'localStorage', { value: { getItem: (k: string) => (k === 'role' ? 'admin' : 'token') } });

describe('LedgerForm', () => {
  beforeEach(() => {
    (createFundraisingLedger as jest.Mock).mockReset();
    (requireRole as jest.Mock).mockReset();
    (requireRole as jest.Mock).mockReturnValue(true);
  });

  it('submits form', async () => {
    (createFundraisingLedger as jest.Mock).mockResolvedValue({ id: 1 });
    render(<LedgerForm />);
    fireEvent.change(screen.getByPlaceholderText('ID de evento'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('ID de grupo'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => expect(createFundraisingLedger).toHaveBeenCalled());
  });

  it('shows error message on failure', async () => {
    (createFundraisingLedger as jest.Mock).mockRejectedValue({});
    render(<LedgerForm />);
    fireEvent.change(screen.getByPlaceholderText('ID de evento'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('ID de grupo'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => expect(screen.getByText('Error al registrar')).toBeInTheDocument());
  });

  it('denies unauthorized', () => {
    (requireRole as jest.Mock).mockReturnValue(false);
    render(<LedgerForm />);
    expect(screen.getByText('No autorizado')).toBeInTheDocument();
  });
});
