"use client";
import {useEffect, useState} from "react";
import Nav from "@/components/Nav";
import {getToken} from "@/lib/auth";
import {apiGet} from "@/lib/api";
import {NextIntlClientProvider, useTranslations} from 'next-intl';
import esMessages from "@/i18n/es.json";

function DashboardContent(){
  const [me,setMe]=useState<any>();
  const [kpis,setKpis]=useState<any>();
  const t = useTranslations('Dashboard');
  useEffect(()=>{ (async()=>{
    const tk = getToken();
    const m = await apiGet<any>("/me/", tk);
    const k = await apiGet<any>("/analytics/overview/", tk);
    setMe(m); setKpis(k);
  })(); },[]);
  const name = me ? `${me.first_name} ${me.last_name}` : '';
  return (
    <>
      <Nav/>
      <main style={{padding:16}}>
        <h2>{t('welcome', {name})}</h2>
        <pre>{JSON.stringify(kpis,null,2)}</pre>
      </main>
    </>
  );
}

export default function Dashboard(){
  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
      <DashboardContent/>
    </NextIntlClientProvider>
  );
}
