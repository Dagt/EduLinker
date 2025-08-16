import { render, screen, fireEvent, waitFor } from '@testing-library/react';
jest.mock('next-intl');
import CreateSuggestion from './page';
import { apiPost } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('CreateSuggestion', () => {
  it('creates suggestion', async () => {
    (window as any).confirm = jest.fn(() => true);
    (apiPost as jest.Mock).mockResolvedValue({});

    render(<CreateSuggestion />);

    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 't' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), { target: { value: 'd' } });
    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });
});
