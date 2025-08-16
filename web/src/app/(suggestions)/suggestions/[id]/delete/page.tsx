"use client";
import Nav from "@/components/Nav";
import { useState } from "react";
import { apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

export default function SuggestionDelete({ params }:{ params:{ id:string } }){
  const [msg, setMsg] = useState("");
  const t = useTranslations("SuggestionDelete");

  async function onDelete(){
    if(typeof window !== 'undefined' && !window.confirm(t('confirm'))) return;
    try {
      const tk = getToken();
      await apiDelete(`/suggestions/${params.id}`, tk);
      setMsg(t('deleted'));
    } catch (e:any) {
      setMsg(e.message || t('error'));
    }
  }

  return (
    <>
      <Nav />
      <main style={{ padding:16, maxWidth:560 }}>
        <h2>{t('header')}</h2>
        <button onClick={onDelete}>{t('delete')}</button>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
