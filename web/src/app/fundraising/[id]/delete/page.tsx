"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import { apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function FundraisingDelete({ params }:{ params:{ id:string } }){
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  async function onDelete(){
    if(typeof window !== 'undefined' && !window.confirm(t('FundraisingDelete.confirm'))) return;
    try {
      const tk = getToken();
      await apiDelete(`/fundraising-events/${params.id}`, tk);
      setMsg(t('FundraisingDelete.deleted'));
    } catch (e:any) {
      setMsg(e.message || t('FundraisingDelete.error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:680 }}>
        <h2>{t('FundraisingDelete.header')}</h2>
        <button onClick={onDelete}>{t('FundraisingDelete.delete')}</button>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
