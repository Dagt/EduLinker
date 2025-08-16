import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import es from '@/i18n/es.json';
import SuggestionsPage from './page';
import { apiGet, apiPost } from '@/lib/api';

jest.mock('@/lib/api');
Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'token' } });

describe('SuggestionsPage', () => {
  it('lists and creates suggestions', async () => {
    (apiGet as jest.Mock).mockResolvedValue([{id:1,title:'t1',description:'d1'}]);
    (apiPost as jest.Mock).mockResolvedValue({id:2,title:'t2',description:'d2'});

    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <SuggestionsPage />
      </NextIntlClientProvider>
    );
    expect(await screen.findByText('t1')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: es.SuggestionsPage.header})).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(es.SuggestionsPage.title), { target: { value: 't2' } });
    fireEvent.change(screen.getByPlaceholderText(es.SuggestionsPage.description), { target: { value: 'd2' } });
    fireEvent.click(screen.getByText(es.SuggestionsPage.submit));

    await waitFor(() => expect(apiPost).toHaveBeenCalled());
  });
});
