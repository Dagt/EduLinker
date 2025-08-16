import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import FundraisingPage from './page';
import FundraisingLedger from './ledger/page';
import FundraisingExpense from './expense/page';
import FundraisingSummary from './summary/page';
import { apiGet, apiPost, getFundraisingEventSummary } from '@/lib/api';

jest.mock('@/lib/api');
jest.mock('@/components/UploadButton', () => ({ onUploaded }: any) => (
  <button onClick={() => onUploaded('http://file')}>Upload</button>
));
jest.mock('@/lib/roles', () => ({ requireRole: () => true }));
Object.defineProperty(window, 'localStorage', { value: { getItem: (k: string) => (k === 'role' ? 'admin' : 'token') } });

describe('FundraisingPage', () => {
  beforeEach(() => {
    (apiGet as jest.Mock).mockReset();
    (apiPost as jest.Mock).mockReset();
    (getFundraisingEventSummary as jest.Mock).mockReset();
  });

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

  it('submits ledger form', async () => {
    (apiPost as jest.Mock).mockResolvedValue({id:1});
    render(<FundraisingLedger />);
    fireEvent.change(screen.getByPlaceholderText('ID de evento'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('ID de grupo'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });

  it('submits expense evidence form', async () => {
    (apiPost as jest.Mock).mockResolvedValue({id:1});
    render(<FundraisingExpense />);
    fireEvent.click(screen.getByText('Upload'));
    fireEvent.change(screen.getByPlaceholderText('ID de ledger (opcional)'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('ID de grupo (opcional)'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Concepto'), { target: { value: 'Food' } });
    fireEvent.click(screen.getByText('Guardar evidencia'));
    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });

  it('loads event summary', async () => {
    (getFundraisingEventSummary as jest.Mock).mockResolvedValue({ total_collected: '100.00', expenses: [{ id: 1, concept: 'Food', amount: '20.00', file_url: 'http://f' }] });
    render(<FundraisingSummary />);
    fireEvent.change(screen.getByPlaceholderText('ID de evento'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Cargar'));
    expect(await screen.findByText('Food')).toBeInTheDocument();
  });
});
