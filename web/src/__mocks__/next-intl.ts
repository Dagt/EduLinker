const React = require('react');
const en = require('@/i18n/en.json');
const es = require('@/i18n/es.json');

let locale = 'es';
export function setLocale(l: string) {
  locale = l;
}

export const NextIntlClientProvider = ({children}: any) => React.createElement(React.Fragment, null, children);

export function useTranslations(namespace: string) {
  const messages = locale === 'en' ? en : es;
  const ns = messages[namespace] || {};
  return (key: string, values?: Record<string, any>) => {
    let msg = ns[key] || '';
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        msg = msg.replace(`{${k}}`, String(v));
      }
    }
    return msg;
  };
}
