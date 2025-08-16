const React = require('react');
let messages = require('@/i18n/es.json');

export function setMessages(m: any) {
  messages = m;
}

export const NextIntlClientProvider = ({children}: any) => React.createElement(React.Fragment, null, children);

export function useTranslations(namespace: string) {
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
