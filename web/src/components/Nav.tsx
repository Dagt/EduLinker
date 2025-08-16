"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import {usePathname} from "next/navigation";

export default function Nav(){
  const { t } = useTranslation();
  const pathname = usePathname() || '/';
  const locale = pathname.split('/')[1] === 'es' ? 'es' : 'en';
  const suggPath = locale === 'es' ? '/sugerencias' : '/suggestions';
  return (
    <nav style={{display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee"}}>
      <Link href="/dashboard">{t('Nav.dashboard')}</Link>
      <Link href="/calendar">{t('Nav.calendar')}</Link>
      <Link href="/complaints">{t('Nav.complaints')}</Link>
      <Link href={suggPath}>{t('Nav.suggestions')}</Link>
      <Link href="/surveys">{t('Nav.surveys')}</Link>
      <Link href="/fundraising">{t('Nav.fundraising')}</Link>
      <Link href="/analytics">{t('Nav.analytics')}</Link>
      <LanguageSwitcher/>
    </nav>
  );
}
