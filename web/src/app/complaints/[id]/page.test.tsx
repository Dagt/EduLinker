import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComplaintThread from './page';
import { apiGet, apiPost } from '@/lib/api';

jest.mock('@/components/Nav', () => () => <nav />);
jest.mock('@/lib/auth', () => ({ getToken: () => 'token' }));
jest.mock('@/lib/api', () => ({ apiGet: jest.fn(), apiPost: jest.fn() }));

describe('ComplaintThread', () => {
  beforeEach(() => {
    (apiGet as jest.Mock).mockReset();
    (apiPost as jest.Mock).mockReset();
  });

  it('loads complaint and sends message', async () => {
    (apiGet as jest.Mock).mockResolvedValueOnce({
      id: 5,
      status: 'OPEN',
      description: 'desc',
      messages: [],
    }).mockResolvedValueOnce({
      id: 5,
      status: 'OPEN',
      description: 'desc',
      messages: [],
    });
    render(<ComplaintThread params={{ id: '5' }} />);
    await screen.findByText('Incidencia #5');
    fireEvent.change(screen.getByPlaceholderText('Escribe una respuesta'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByText('Enviar'));
    await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/complaints/5/messages/', {
      message: 'hi',
      attachments: [],
    }, 'token'));
  });
});
