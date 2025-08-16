"use client";
import {ChangeEvent} from "react";
import {usePathname} from "next/navigation";
import {useTranslations} from 'next-intl';

export default function LanguageSwitcher(){
  const pathname = usePathname() || '/';
  const segments = pathname.split('/');
  const locale = segments[1] === 'es' ? 'es' : 'en';
  const t = useTranslations('LanguageSwitcher');

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    const segments = pathname.split('/');
    if(segments[1] === 'en' || segments[1] === 'es'){
      segments[1] = nextLocale;
    } else {
      segments.splice(1,0,nextLocale);
    }
    window.location.pathname = segments.join('/');
  }

  return (
    <select value={locale} onChange={onChange}>
      <option value="en">{t('english')}</option>
      <option value="es">{t('spanish')}</option>
    </select>
  );
}

