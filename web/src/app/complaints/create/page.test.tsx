import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComplaintCreate from './page';
import { apiPost } from '@/lib/api';

jest.mock('@/components/Nav', () => () => <nav />);
jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/api', () => ({ apiPost: jest.fn() }));

describe('ComplaintCreate', () => {
  beforeEach(() => {
    (apiPost as jest.Mock).mockReset();
  });

  it('submits complaint form', async () => {
    (apiPost as jest.Mock).mockResolvedValue({ id: 5 });
    render(<ComplaintCreate />);
    fireEvent.change(screen.getByPlaceholderText('ID de grupo'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('ID de maestro'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('ID de estudiante (opcional)'), { target: { value: '3' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'Hi' } });
    fireEvent.click(screen.getByText('Crear incidencia'));
    await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/complaints/', {
      group_id: 1,
      target_teacher_id: 2,
      about_student_id: 3,
      description: 'Hi',
    }, 'token'));
    expect(await screen.findByText('Incidencia creada #5')).toBeInTheDocument();
  });
});
