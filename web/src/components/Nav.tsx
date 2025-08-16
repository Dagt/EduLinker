"use client";
import Link from "next/link";
import {useTranslations} from 'next-intl';
import LanguageSwitcher from "./LanguageSwitcher";
import {usePathname} from "next/navigation";

export default function Nav(){
  const t = useTranslations('Nav');
  const pathname = usePathname() || '/';
  const locale = pathname.split('/')[1] === 'es' ? 'es' : 'en';
  const suggPath = locale === 'es' ? '/sugerencias' : '/suggestions';
  return (
    <nav style={{display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee"}}>
      <Link href="/dashboard">{t('dashboard')}</Link>
      <Link href="/calendar">{t('calendar')}</Link>
      <Link href="/complaints">{t('complaints')}</Link>
      <Link href={suggPath}>{t('suggestions')}</Link>
      <Link href="/surveys">{t('surveys')}</Link>
      <Link href="/fundraising">{t('fundraising')}</Link>
      <Link href="/analytics">{t('analytics')}</Link>
      <LanguageSwitcher/>
    </nav>
  );
}
