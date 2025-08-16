"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet, apiDelete } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type Suggestion = { id:number; title:string; description:string };

export default function SuggestionDelete({ params }:{ params:{ id:string } }){
  const [sug, setSug] = useState<Suggestion|null>(null);
  const [msg, setMsg] = useState("");
  const t = useTranslations("SuggestionDelete");

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<Suggestion>(`/suggestions/${params.id}`, tk);
        setSug(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [params.id]);

  async function handleDelete(){
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
        {sug && <p>{sug.title}</p>}
        <button onClick={handleDelete}>{t('delete')}</button>
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
