"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import { apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function SuggestionDelete({ params }:{ params:{ id:string } }){
  const [msg, setMsg] = useState("");
  const { t } = useTranslation();

  async function onDelete(){
    if(typeof window !== 'undefined' && !window.confirm(t('SuggestionDelete.confirm'))) return;
    try {
      const tk = getToken();
      await apiDelete(`/suggestions/${params.id}`, tk);
      setMsg(t('SuggestionDelete.deleted'));
    } catch (e:any) {
      setMsg(e.message || t('SuggestionDelete.error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t('SuggestionDelete.header')}</h2>
        <button onClick={onDelete}>{t('SuggestionDelete.delete')}</button>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
