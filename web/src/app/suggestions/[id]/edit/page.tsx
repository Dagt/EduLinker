"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { apiGet, apiPatch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslations } from "next-intl";
import SuggestionForm, { SuggestionFormData } from "../../SuggestionForm";

export default function SuggestionEdit({ params }: { params: { id: string } }){
  const [initial, setInitial] = useState<SuggestionFormData | null>(null);
  const [msg, setMsg] = useState("");
  const t = useTranslations('SuggestionEdit');

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await apiGet<SuggestionFormData>(`/suggestions/${params.id}/`, tk);
        setInitial(data);
      } catch (e) {
        console.error(e);
        setMsg(t('error'));
      }
    })();
  }, [params.id, t]);

  async function onSubmit(data: SuggestionFormData){
    setMsg("");
    if(!data.title.trim() || !data.description.trim()){
      setMsg(t('missing'));
      return;
    }
    if(typeof window !== 'undefined' && !window.confirm(t('confirm'))) return;
    try{
      const tk = getToken();
      await apiPatch(`/suggestions/${params.id}/`, data, tk);
      setMsg(t('updated'));
    }catch(err: any){
      setMsg(err.message || t('error'));
    }
  }

  return (
    <>
      <Nav/>
      <main style={{padding:16, maxWidth:560}}>
        <h2>{t('header')}</h2>
        {initial && (
          <SuggestionForm
            initial={initial}
            onSubmit={onSubmit}
            titlePlaceholder={t('title')}
            descriptionPlaceholder={t('description')}
            submitLabel={t('update')}
          />
        )}
        {msg && <p>{msg}</p>}
      </main>
    </>
  );
}
