"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getToken } from "@/lib/auth";
import { updateSuggestionStatus } from "@/lib/api";
import { requireRole } from "@/lib/roles";
import {NextIntlClientProvider, useTranslations} from 'next-intl';
import esMessages from "@/i18n/es.json";

function SuggestionStatusContent(){
  const [id,setId]=useState("");
  const [status,setStatus]=useState("");
  const [msg,setMsg]=useState("");
  const t = useTranslations('SuggestionStatus');

  if(!requireRole(["admin","teacher"])) return <p>{t('unauthorized')}</p>;

  async function submit(e:React.FormEvent){
    e.preventDefault(); setMsg("");
    try{
      const tk = getToken();
      await updateSuggestionStatus(Number(id), status, tk);
      setMsg(t('updated'));
      setId(""); setStatus("");
    }catch(err:any){ setMsg(err.message || t('error')); }
  }

  return (<>
    <Nav/>
    <main style={{padding:16, maxWidth:560}}>
      <h2>{t('title')}</h2>
      <form onSubmit={submit}>
        <input placeholder={t('id')} value={id} onChange={e=>setId(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <input placeholder={t('status')} value={status} onChange={e=>setStatus(e.target.value)}
               style={{display:"block",margin:"8px 0",padding:8,width:"100%"}}/>
        <button>{t('update')}</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  </>);
}

export default function SuggestionStatus(){
  return (
    <NextIntlClientProvider locale="es" messages={esMessages}>
      <SuggestionStatusContent/>
    </NextIntlClientProvider>
  );
}
