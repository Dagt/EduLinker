import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import ExpenseEvidenceForm from './ExpenseEvidenceForm';
import { createExpenseEvidence } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  createExpenseEvidence: jest.fn(),
}));

jest.mock('@/components/UploadButton', () => ({ onUploaded }: any) => (
  <button onClick={() => onUploaded('http://file')}>Upload</button>
));
jest.mock('@/lib/roles', () => ({ requireRole: jest.fn() }));
import { requireRole } from '@/lib/roles';
Object.defineProperty(window, 'localStorage', { value: { getItem: (k: string) => (k === 'role' ? 'admin' : 'token') } });

describe('ExpenseEvidenceForm', () => {
  beforeEach(() => {
    (createExpenseEvidence as jest.Mock).mockReset();
    (requireRole as jest.Mock).mockReset();
    (requireRole as jest.Mock).mockReturnValue(true);
  });

  it('submits form', async () => {
    (createExpenseEvidence as jest.Mock).mockResolvedValue({ id: 1 });
    render(<ExpenseEvidenceForm />);
    fireEvent.click(screen.getByText('Upload'));
    fireEvent.change(screen.getByPlaceholderText('ID de ledger (opcional)'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('ID de grupo (opcional)'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Concepto'), { target: { value: 'Food' } });
    fireEvent.click(screen.getByText('Guardar evidencia'));
    await waitFor(() => expect(createExpenseEvidence).toHaveBeenCalled());
  });

  it('submits without optional fields', async () => {
    (createExpenseEvidence as jest.Mock).mockResolvedValue({ id: 1 });
    render(<ExpenseEvidenceForm />);
    fireEvent.click(screen.getByText('Upload'));
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Concepto'), { target: { value: 'Food' } });
    fireEvent.click(screen.getByText('Guardar evidencia'));
    await waitFor(() => expect(createExpenseEvidence).toHaveBeenCalled());
    expect((createExpenseEvidence as jest.Mock).mock.calls[0][0]).toEqual({ amount: 10, concept: 'Food', file_url: 'http://file' });
  });

  it('requires file upload', async () => {
    render(<ExpenseEvidenceForm />);
    fireEvent.change(screen.getByPlaceholderText('Monto'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('Concepto'), { target: { value: 'Food' } });
    fireEvent.click(screen.getByText('Guardar evidencia'));
    expect(screen.getByText('Sube el archivo primero')).toBeInTheDocument();
  });

  it('denies unauthorized', () => {
    (requireRole as jest.Mock).mockReturnValue(false);
    render(<ExpenseEvidenceForm />);
    expect(screen.getByText('No autorizado')).toBeInTheDocument();
  });
});
