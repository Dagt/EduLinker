const React = require('react');
let messages = require('@/i18n/es.json');

export function setMockMessages(m: any) {
  messages = m;
}

export const NextIntlClientProvider = ({children}: any) => React.createElement(React.Fragment, null, children);

export function useTranslations(namespace: string) {
  const ns = messages[namespace] || {};
  const t = (key: string, values?: Record<string, any>) => {
    let msg = ns[key] || '';
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        if (typeof v !== 'function') {
          msg = msg.replace(`{${k}}`, String(v));
        }
      }
    }
    return msg;
  };
  t.rich = (key: string, values: Record<string, any>) => {
    let msg = ns[key] || '';
    for (const [k, v] of Object.entries(values)) {
      if (typeof v !== 'function') {
        msg = msg.replace(`{${k}}`, String(v));
      }
    }
    return msg.replace(/<[^>]+>/g, '');
  };
  return t;
}
