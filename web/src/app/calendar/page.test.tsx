import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import es from '@/i18n/es.json';
import Calendar from './page';
import { apiGet } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('CalendarPage', () => {
  it('renders calendar with translations', async () => {
    (apiGet as jest.Mock).mockResolvedValue([{id:1,title:'E1',start_at:'2024-01-01T00:00:00Z'}]);

    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <Calendar />
      </NextIntlClientProvider>
    );

    expect(await screen.findByText(/E1/)).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: es.Calendar.title})).toBeInTheDocument();
  });
});
