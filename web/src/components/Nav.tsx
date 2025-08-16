"use client";
import Link from "next/link";
import {useTranslations} from 'next-intl';
import LanguageSwitcher from "./LanguageSwitcher";

export default function Nav(){
  const t = useTranslations('Nav');
  return (
    <nav style={{display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee"}}>
      <Link href="/dashboard">{t('dashboard')}</Link>
      <Link href="/calendar">{t('calendar')}</Link>
      <Link href="/complaints">{t('complaints')}</Link>
      <Link href="/suggestions">{t('suggestions')}</Link>
      <Link href="/surveys">{t('surveys')}</Link>
      <Link href="/fundraising">{t('fundraising')}</Link>
      <LanguageSwitcher/>
    </nav>
  );
}
