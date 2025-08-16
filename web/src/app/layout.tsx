import {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages, setRequestLocale} from 'next-intl/server';
import "@/lib/sentry";

export default async function RootLayout({children}:{children: ReactNode}) {
  const locale = await getLocale();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
